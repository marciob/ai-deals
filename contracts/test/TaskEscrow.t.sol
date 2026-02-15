// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";
import {StakeRegistry} from "../src/StakeRegistry.sol";
import {MockAIH} from "./mocks/MockAIH.sol";

contract TaskEscrowTest is Test {
    TaskEscrow public escrow;
    StakeRegistry public registry;
    MockAIH public aih;

    address public owner;
    address public requester = makeAddr("requester");
    address public provider = makeAddr("provider");
    address public stranger = makeAddr("stranger");

    uint256 constant TIMEOUT = 24 hours;
    uint256 constant ESCROW_AMOUNT = 1 ether;
    uint256 constant MIN_STAKE = 100 ether;

    bytes32 constant TASK_ID = keccak256("task-1");
    bytes32 constant TASK_HASH = keccak256("task-hash-1");
    bytes32 constant PROOF_HASH = keccak256("proof-hash-1");

    function setUp() public {
        owner = address(this);
        aih = new MockAIH();
        registry = new StakeRegistry(address(aih));
        escrow = new TaskEscrow(address(registry), TIMEOUT);

        // Fund provider with AIH and stake
        aih.mint(provider, 500 ether);
        vm.prank(provider);
        aih.approve(address(registry), type(uint256).max);
        vm.prank(provider);
        registry.stake(200 ether);

        // Fund requester and stranger with MON
        vm.deal(requester, 10 ether);
        vm.deal(stranger, 10 ether);
    }

    // ── Create Escrow ──────────────────────────────────────

    function test_CreateEscrow_Success() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(e.requester, requester);
        assertEq(e.amount, ESCROW_AMOUNT);
        assertEq(e.taskHash, TASK_HASH);
        assertEq(e.minStake, MIN_STAKE);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Open));
        assertTrue(escrow.escrowExists(TASK_ID));
    }

    function test_CreateEscrow_RevertsOnZeroAmount() public {
        vm.prank(requester);
        vm.expectRevert(TaskEscrow.ZeroAmount.selector);
        escrow.createEscrow{value: 0}(TASK_ID, TASK_HASH, MIN_STAKE);
    }

    function test_CreateEscrow_RevertsOnDuplicate() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        vm.prank(requester);
        vm.expectRevert(TaskEscrow.EscrowAlreadyExists.selector);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);
    }

    function testFuzz_CreateEscrow(uint256 amount) public {
        amount = bound(amount, 1, 10 ether);
        vm.deal(requester, amount);

        vm.prank(requester);
        escrow.createEscrow{value: amount}(TASK_ID, TASK_HASH, MIN_STAKE);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(e.amount, amount);
    }

    // ── Release ────────────────────────────────────────────

    function test_Release_Success() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        uint256 providerBalBefore = provider.balance;

        escrow.release(TASK_ID, provider, PROOF_HASH);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, provider);
        assertEq(e.proofHash, PROOF_HASH);
        assertEq(provider.balance, providerBalBefore + ESCROW_AMOUNT);
    }

    function test_Release_RevertsOnIneligibleProvider() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, 1000 ether); // provider only has 200

        vm.expectRevert(TaskEscrow.ProviderNotEligible.selector);
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    function test_Release_RevertsOnNonExistent() public {
        vm.expectRevert(TaskEscrow.EscrowNotFound.selector);
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    function test_Release_RevertsOnAlreadySettled() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);
        escrow.release(TASK_ID, provider, PROOF_HASH);

        vm.expectRevert(TaskEscrow.EscrowAlreadySettled.selector);
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    function test_Release_RevertsOnUnauthorized() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        vm.prank(stranger);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    // ── Refund ─────────────────────────────────────────────

    function test_Refund_ByOwner() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        uint256 requesterBalBefore = requester.balance;

        escrow.refund(TASK_ID);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Refunded));
        assertEq(requester.balance, requesterBalBefore + ESCROW_AMOUNT);
    }

    function test_Refund_ByRequesterAfterTimeout() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        vm.warp(block.timestamp + TIMEOUT + 1);

        uint256 requesterBalBefore = requester.balance;

        vm.prank(requester);
        escrow.refund(TASK_ID);

        assertEq(requester.balance, requesterBalBefore + ESCROW_AMOUNT);
    }

    function test_Refund_RevertsOnRequesterBeforeTimeout() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        vm.prank(requester);
        vm.expectRevert(TaskEscrow.TimeoutNotReached.selector);
        escrow.refund(TASK_ID);
    }

    function test_Refund_RevertsOnUnauthorized() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        vm.warp(block.timestamp + TIMEOUT + 1);

        vm.prank(stranger);
        vm.expectRevert(TaskEscrow.Unauthorized.selector);
        escrow.refund(TASK_ID);
    }

    function test_Refund_RevertsOnAlreadySettled() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);
        escrow.refund(TASK_ID);

        vm.expectRevert(TaskEscrow.EscrowAlreadySettled.selector);
        escrow.refund(TASK_ID);
    }

    function test_Refund_RevertsOnNonExistent() public {
        vm.expectRevert(TaskEscrow.EscrowNotFound.selector);
        escrow.refund(TASK_ID);
    }

    // ── View helpers ───────────────────────────────────────

    function test_EscrowExists() public {
        assertFalse(escrow.escrowExists(TASK_ID));

        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH, MIN_STAKE);

        assertTrue(escrow.escrowExists(TASK_ID));
    }
}
