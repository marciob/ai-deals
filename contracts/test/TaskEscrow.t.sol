// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";

contract TaskEscrowTest is Test {
    TaskEscrow public escrow;

    address public owner;
    address public requester = makeAddr("requester");
    address public provider = makeAddr("provider");
    address public stranger = makeAddr("stranger");

    uint256 constant TIMEOUT = 24 hours;
    uint256 constant ESCROW_AMOUNT = 1 ether;

    bytes32 constant TASK_ID = keccak256("task-1");
    bytes32 constant TASK_HASH = keccak256("task-hash-1");
    bytes32 constant PROOF_HASH = keccak256("proof-hash-1");

    function setUp() public {
        owner = address(this);
        escrow = new TaskEscrow(TIMEOUT);

        vm.deal(requester, 10 ether);
        vm.deal(stranger, 10 ether);
    }

    // ── Create Escrow ──────────────────────────────────────

    function test_CreateEscrow_Success() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(e.requester, requester);
        assertEq(e.amount, ESCROW_AMOUNT);
        assertEq(e.taskHash, TASK_HASH);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Open));
        assertTrue(escrow.escrowExists(TASK_ID));
    }

    function test_CreateEscrow_RevertsOnZeroAmount() public {
        vm.prank(requester);
        vm.expectRevert(TaskEscrow.ZeroAmount.selector);
        escrow.createEscrow{value: 0}(TASK_ID, TASK_HASH);
    }

    function test_CreateEscrow_RevertsOnDuplicate() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        vm.prank(requester);
        vm.expectRevert(TaskEscrow.EscrowAlreadyExists.selector);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);
    }

    function testFuzz_CreateEscrow(uint256 amount) public {
        amount = bound(amount, 1, 10 ether);
        vm.deal(requester, amount);

        vm.prank(requester);
        escrow.createEscrow{value: amount}(TASK_ID, TASK_HASH);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(e.amount, amount);
    }

    // ── Release ────────────────────────────────────────────

    function test_Release_Success() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        uint256 providerBalBefore = provider.balance;

        escrow.release(TASK_ID, provider, PROOF_HASH);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Released));
        assertEq(e.provider, provider);
        assertEq(e.proofHash, PROOF_HASH);
        assertEq(provider.balance, providerBalBefore + ESCROW_AMOUNT);
    }

    function test_Release_RevertsOnNonExistent() public {
        vm.expectRevert(TaskEscrow.EscrowNotFound.selector);
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    function test_Release_RevertsOnAlreadySettled() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);
        escrow.release(TASK_ID, provider, PROOF_HASH);

        vm.expectRevert(TaskEscrow.EscrowAlreadySettled.selector);
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    function test_Release_RevertsOnUnauthorized() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        vm.prank(stranger);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        escrow.release(TASK_ID, provider, PROOF_HASH);
    }

    // ── Refund ─────────────────────────────────────────────

    function test_Refund_ByOwner() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        uint256 requesterBalBefore = requester.balance;

        escrow.refund(TASK_ID);

        TaskEscrow.Escrow memory e = escrow.getEscrow(TASK_ID);
        assertEq(uint8(e.status), uint8(TaskEscrow.EscrowStatus.Refunded));
        assertEq(requester.balance, requesterBalBefore + ESCROW_AMOUNT);
    }

    function test_Refund_ByRequesterAfterTimeout() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        vm.warp(block.timestamp + TIMEOUT + 1);

        uint256 requesterBalBefore = requester.balance;

        vm.prank(requester);
        escrow.refund(TASK_ID);

        assertEq(requester.balance, requesterBalBefore + ESCROW_AMOUNT);
    }

    function test_Refund_RevertsOnRequesterBeforeTimeout() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        vm.prank(requester);
        vm.expectRevert(TaskEscrow.TimeoutNotReached.selector);
        escrow.refund(TASK_ID);
    }

    function test_Refund_RevertsOnUnauthorized() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        vm.warp(block.timestamp + TIMEOUT + 1);

        vm.prank(stranger);
        vm.expectRevert(TaskEscrow.Unauthorized.selector);
        escrow.refund(TASK_ID);
    }

    function test_Refund_RevertsOnAlreadySettled() public {
        vm.prank(requester);
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);
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
        escrow.createEscrow{value: ESCROW_AMOUNT}(TASK_ID, TASK_HASH);

        assertTrue(escrow.escrowExists(TASK_ID));
    }
}
