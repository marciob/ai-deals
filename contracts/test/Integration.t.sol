// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";
import {StakeRegistry} from "../src/StakeRegistry.sol";
import {MockAIH} from "./mocks/MockAIH.sol";

contract IntegrationTest is Test {
    TaskEscrow public escrow;
    StakeRegistry public registry;
    MockAIH public aih;

    address public orchestrator; // contract owner / backend

    // Providers
    address public dineAssist = makeAddr("DineAssist");
    address public budgetBook = makeAddr("BudgetBook");
    address public premiumTable = makeAddr("PremiumTable");

    // Requester
    address public requester = makeAddr("requester");

    uint256 constant TIMEOUT = 24 hours;

    function setUp() public {
        orchestrator = address(this);
        aih = new MockAIH();
        registry = new StakeRegistry(address(aih));
        escrow = new TaskEscrow(address(registry), TIMEOUT);

        // Stake providers: DineAssist=150, BudgetBook=50, PremiumTable=600
        _stakeProvider(dineAssist, 150 ether);
        _stakeProvider(budgetBook, 50 ether);
        _stakeProvider(premiumTable, 600 ether);

        vm.deal(requester, 100 ether);
    }

    function _stakeProvider(address provider, uint256 amount) internal {
        aih.mint(provider, amount);
        vm.startPrank(provider);
        aih.approve(address(registry), amount);
        registry.stake(amount);
        vm.stopPrank();
    }

    // ── Normal Task: 100 AIH threshold ─────────────────────

    function test_NormalTask_ProviderSelection() public {
        uint256 minStake = 100 ether;

        // DineAssist (150) and PremiumTable (600) eligible
        assertTrue(registry.isEligible(dineAssist, minStake));
        assertFalse(registry.isEligible(budgetBook, minStake));
        assertTrue(registry.isEligible(premiumTable, minStake));
    }

    function test_NormalTask_EndToEnd() public {
        bytes32 taskId = keccak256("normal-task-1");
        bytes32 taskHash = keccak256("find best restaurant nearby");
        bytes32 proofHash = keccak256("restaurant-recommendation-proof");
        uint256 minStake = 100 ether;

        // 1. Requester creates escrow
        vm.prank(requester);
        escrow.createEscrow{value: 0.5 ether}(taskId, taskHash, minStake);

        // 2. Orchestrator assigns DineAssist and releases payment
        uint256 dineAssistBalBefore = dineAssist.balance;
        escrow.release(taskId, dineAssist, proofHash);

        // 3. Verify settlement
        TaskEscrow.Escrow memory e = escrow.getEscrow(taskId);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, dineAssist);
        assertEq(dineAssist.balance, dineAssistBalBefore + 0.5 ether);
    }

    // ── Urgent Task: 500 AIH threshold ─────────────────────

    function test_UrgentTask_ProviderFiltering() public {
        uint256 minStake = 500 ether;

        assertFalse(registry.isEligible(dineAssist, minStake));
        assertFalse(registry.isEligible(budgetBook, minStake));
        assertTrue(registry.isEligible(premiumTable, minStake));
    }

    function test_UrgentTask_EndToEnd() public {
        bytes32 taskId = keccak256("urgent-task-1");
        bytes32 taskHash = keccak256("book premium table ASAP");
        bytes32 proofHash = keccak256("booking-confirmation-proof");
        uint256 minStake = 500 ether;

        vm.prank(requester);
        escrow.createEscrow{value: 2 ether}(taskId, taskHash, minStake);

        uint256 premiumBalBefore = premiumTable.balance;
        escrow.release(taskId, premiumTable, proofHash);

        TaskEscrow.Escrow memory e = escrow.getEscrow(taskId);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, premiumTable);
        assertEq(premiumTable.balance, premiumBalBefore + 2 ether);
    }

    function test_UrgentTask_RevertsOnIneligibleProvider() public {
        bytes32 taskId = keccak256("urgent-task-2");
        bytes32 taskHash = keccak256("urgent task hash");
        uint256 minStake = 500 ether;

        vm.prank(requester);
        escrow.createEscrow{value: 1 ether}(taskId, taskHash, minStake);

        // DineAssist only has 150 AIH, needs 500
        vm.expectRevert(TaskEscrow.ProviderNotEligible.selector);
        escrow.release(taskId, dineAssist, keccak256("proof"));
    }

    // ── Timeout scenario ───────────────────────────────────

    function test_TimeoutScenario() public {
        bytes32 taskId = keccak256("timeout-task-1");
        bytes32 taskHash = keccak256("task that times out");

        vm.prank(requester);
        escrow.createEscrow{value: 1 ether}(taskId, taskHash, 100 ether);

        uint256 requesterBalBefore = requester.balance;

        // Requester can't refund before timeout
        vm.prank(requester);
        vm.expectRevert(TaskEscrow.TimeoutNotReached.selector);
        escrow.refund(taskId);

        // Warp past timeout
        vm.warp(block.timestamp + TIMEOUT + 1);

        vm.prank(requester);
        escrow.refund(taskId);

        assertEq(requester.balance, requesterBalBefore + 1 ether);
        TaskEscrow.Escrow memory e = escrow.getEscrow(taskId);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Refunded));
    }

    // ── Stake locking prevents premature unstake ───────────

    function test_StakeLocking_PreventsPrematureUnstake() public {
        bytes32 taskId = keccak256("locked-task-1");

        // PremiumTable locks 400 of 600 staked
        vm.prank(premiumTable);
        registry.lockStake(taskId, 400 ether);

        // Can only unstake up to 200 (unlocked portion)
        vm.prank(premiumTable);
        vm.expectRevert(StakeRegistry.InsufficientUnlockedStake.selector);
        registry.unstake(300 ether);

        // Can unstake up to 200
        vm.prank(premiumTable);
        registry.unstake(200 ether);
        assertEq(registry.getStake(premiumTable), 400 ether);

        // Unlock, now full unstake works
        registry.unlockStake(premiumTable, taskId);
        vm.prank(premiumTable);
        registry.unstake(400 ether);
        assertEq(registry.getStake(premiumTable), 0);
    }
}
