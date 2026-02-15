// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StakeRegistry} from "../src/StakeRegistry.sol";
import {MockAIH} from "./mocks/MockAIH.sol";

contract StakeRegistryTest is Test {
    StakeRegistry public registry;
    MockAIH public aih;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 constant STAKE_AMOUNT = 100 ether;

    function setUp() public {
        aih = new MockAIH();
        registry = new StakeRegistry(address(aih));

        aih.mint(alice, 1000 ether);
        aih.mint(bob, 1000 ether);

        vm.prank(alice);
        aih.approve(address(registry), type(uint256).max);
        vm.prank(bob);
        aih.approve(address(registry), type(uint256).max);
    }

    // ── Stake ──────────────────────────────────────────────

    function test_Stake_Success() public {
        vm.prank(alice);
        registry.stake(STAKE_AMOUNT);

        assertEq(registry.getStake(alice), STAKE_AMOUNT);
        assertEq(aih.balanceOf(address(registry)), STAKE_AMOUNT);
    }

    function test_Stake_Multiple() public {
        vm.startPrank(alice);
        registry.stake(50 ether);
        registry.stake(50 ether);
        vm.stopPrank();

        assertEq(registry.getStake(alice), 100 ether);
    }

    function test_Stake_RevertsOnZero() public {
        vm.prank(alice);
        vm.expectRevert(StakeRegistry.ZeroAmount.selector);
        registry.stake(0);
    }

    function test_Stake_RevertsWithoutApproval() public {
        address carol = makeAddr("carol");
        aih.mint(carol, 100 ether);
        // no approve

        vm.prank(carol);
        vm.expectRevert(); // ERC20 insufficient allowance
        registry.stake(100 ether);
    }

    function testFuzz_Stake(uint256 amount) public {
        amount = bound(amount, 1, 1000 ether);
        aih.mint(alice, amount); // ensure enough

        vm.prank(alice);
        registry.stake(amount);

        assertEq(registry.getStake(alice), amount);
    }

    // ── Unstake ────────────────────────────────────────────

    function test_Unstake_Success() public {
        vm.startPrank(alice);
        registry.stake(STAKE_AMOUNT);
        registry.unstake(40 ether);
        vm.stopPrank();

        assertEq(registry.getStake(alice), 60 ether);
        assertEq(aih.balanceOf(alice), 940 ether);
    }

    function test_Unstake_Full() public {
        vm.startPrank(alice);
        registry.stake(STAKE_AMOUNT);
        registry.unstake(STAKE_AMOUNT);
        vm.stopPrank();

        assertEq(registry.getStake(alice), 0);
        assertEq(aih.balanceOf(alice), 1000 ether);
    }

    function test_Unstake_RevertsOnZero() public {
        vm.prank(alice);
        vm.expectRevert(StakeRegistry.ZeroAmount.selector);
        registry.unstake(0);
    }

    function test_Unstake_RevertsOnInsufficientStake() public {
        vm.prank(alice);
        vm.expectRevert(StakeRegistry.InsufficientStake.selector);
        registry.unstake(1 ether);
    }

    // ── Eligibility ────────────────────────────────────────

    function test_IsEligible_True() public {
        vm.prank(alice);
        registry.stake(STAKE_AMOUNT);

        assertTrue(registry.isEligible(alice, STAKE_AMOUNT));
        assertTrue(registry.isEligible(alice, 50 ether));
    }

    function test_IsEligible_False() public {
        vm.prank(alice);
        registry.stake(STAKE_AMOUNT);

        assertFalse(registry.isEligible(alice, 200 ether));
    }

    function test_IsEligible_Unstaked() public {
        assertFalse(registry.isEligible(alice, 1 ether));
        assertTrue(registry.isEligible(alice, 0));
    }

    // ── Lock / Unlock ──────────────────────────────────────

    function test_LockStake_Success() public {
        bytes32 taskId = keccak256("task-1");

        vm.prank(alice);
        registry.stake(STAKE_AMOUNT);

        vm.prank(alice);
        registry.lockStake(taskId, 50 ether);

        assertEq(registry.lockedStakes(alice, taskId), 50 ether);
        assertEq(registry.totalLocked(alice), 50 ether);
        assertEq(registry.getUnlockedStake(alice), 50 ether);
    }

    function test_LockStake_RevertsOnInsufficientUnlocked() public {
        bytes32 taskId = keccak256("task-1");

        vm.prank(alice);
        registry.stake(50 ether);

        vm.prank(alice);
        vm.expectRevert(StakeRegistry.InsufficientUnlockedStake.selector);
        registry.lockStake(taskId, 100 ether);
    }

    function test_LockStake_RevertsOnDuplicateLock() public {
        bytes32 taskId = keccak256("task-1");

        vm.startPrank(alice);
        registry.stake(STAKE_AMOUNT);
        registry.lockStake(taskId, 30 ether);

        vm.expectRevert(StakeRegistry.AlreadyLocked.selector);
        registry.lockStake(taskId, 20 ether);
        vm.stopPrank();
    }

    function test_UnlockStake_Success() public {
        bytes32 taskId = keccak256("task-1");

        vm.prank(alice);
        registry.stake(STAKE_AMOUNT);

        vm.prank(alice);
        registry.lockStake(taskId, 50 ether);

        registry.unlockStake(alice, taskId);

        assertEq(registry.lockedStakes(alice, taskId), 0);
        assertEq(registry.totalLocked(alice), 0);
        assertEq(registry.getUnlockedStake(alice), STAKE_AMOUNT);
    }

    function test_UnlockStake_RevertsOnNotLocked() public {
        bytes32 taskId = keccak256("task-1");

        vm.expectRevert(StakeRegistry.NotLocked.selector);
        registry.unlockStake(alice, taskId);
    }

    function test_Unstake_RevertsWhenStakeLocked() public {
        bytes32 taskId = keccak256("task-1");

        vm.startPrank(alice);
        registry.stake(STAKE_AMOUNT);
        registry.lockStake(taskId, 80 ether);

        vm.expectRevert(StakeRegistry.InsufficientUnlockedStake.selector);
        registry.unstake(50 ether);
        vm.stopPrank();
    }
}
