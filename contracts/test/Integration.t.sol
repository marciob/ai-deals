// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";

contract IntegrationTest is Test {
    TaskEscrow public escrow;

    address public orchestrator; // contract owner / backend

    // Providers
    address public dineAssist = makeAddr("DineAssist");
    address public premiumTable = makeAddr("PremiumTable");

    // Requester
    address public requester = makeAddr("requester");

    uint256 constant TIMEOUT = 24 hours;

    function setUp() public {
        orchestrator = address(this);
        escrow = new TaskEscrow(TIMEOUT);
        vm.deal(requester, 100 ether);
    }

    // ── Normal Task: End-to-End ──────────────────────────────

    function test_NormalTask_EndToEnd() public {
        bytes32 taskId = keccak256("normal-task-1");
        bytes32 taskHash = keccak256("find best restaurant nearby");
        bytes32 proofHash = keccak256("restaurant-recommendation-proof");

        // 1. Requester creates escrow
        vm.prank(requester);
        escrow.createEscrow{value: 0.5 ether}(taskId, taskHash);

        // 2. Orchestrator assigns DineAssist and releases payment
        uint256 dineAssistBalBefore = dineAssist.balance;
        escrow.release(taskId, dineAssist, proofHash);

        // 3. Verify settlement
        TaskEscrow.Escrow memory e = escrow.getEscrow(taskId);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, dineAssist);
        assertEq(dineAssist.balance, dineAssistBalBefore + 0.5 ether);
    }

    // ── Urgent Task: End-to-End ──────────────────────────────

    function test_UrgentTask_EndToEnd() public {
        bytes32 taskId = keccak256("urgent-task-1");
        bytes32 taskHash = keccak256("book premium table ASAP");
        bytes32 proofHash = keccak256("booking-confirmation-proof");

        vm.prank(requester);
        escrow.createEscrow{value: 2 ether}(taskId, taskHash);

        uint256 premiumBalBefore = premiumTable.balance;
        escrow.release(taskId, premiumTable, proofHash);

        TaskEscrow.Escrow memory e = escrow.getEscrow(taskId);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, premiumTable);
        assertEq(premiumTable.balance, premiumBalBefore + 2 ether);
    }

    // ── Timeout scenario ───────────────────────────────────

    function test_TimeoutScenario() public {
        bytes32 taskId = keccak256("timeout-task-1");
        bytes32 taskHash = keccak256("task that times out");

        vm.prank(requester);
        escrow.createEscrow{value: 1 ether}(taskId, taskHash);

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
}
