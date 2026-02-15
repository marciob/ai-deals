// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakeRegistry {
    IERC20 public immutable aihToken;

    mapping(address => uint256) public stakes;
    mapping(address => mapping(bytes32 => uint256)) public lockedStakes;
    mapping(address => uint256) public totalLocked;

    event Staked(address indexed provider, uint256 amount);
    event Unstaked(address indexed provider, uint256 amount);
    event StakeLocked(address indexed provider, bytes32 indexed taskId, uint256 amount);
    event StakeUnlocked(address indexed provider, bytes32 indexed taskId, uint256 amount);

    error ZeroAmount();
    error InsufficientStake();
    error InsufficientUnlockedStake();
    error AlreadyLocked();
    error NotLocked();
    error TransferFailed();

    constructor(address _aihToken) {
        aihToken = IERC20(_aihToken);
    }

    function stake(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        bool success = aihToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (stakes[msg.sender] < amount) revert InsufficientStake();
        if (stakes[msg.sender] - totalLocked[msg.sender] < amount) revert InsufficientUnlockedStake();
        stakes[msg.sender] -= amount;
        bool success = aihToken.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        emit Unstaked(msg.sender, amount);
    }

    function lockStake(bytes32 taskId, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (lockedStakes[msg.sender][taskId] != 0) revert AlreadyLocked();
        if (stakes[msg.sender] - totalLocked[msg.sender] < amount) revert InsufficientUnlockedStake();
        lockedStakes[msg.sender][taskId] = amount;
        totalLocked[msg.sender] += amount;
        emit StakeLocked(msg.sender, taskId, amount);
    }

    function unlockStake(address provider, bytes32 taskId) external {
        uint256 amount = lockedStakes[provider][taskId];
        if (amount == 0) revert NotLocked();
        delete lockedStakes[provider][taskId];
        totalLocked[provider] -= amount;
        emit StakeUnlocked(provider, taskId, amount);
    }

    function isEligible(address provider, uint256 minStake) external view returns (bool) {
        return stakes[provider] >= minStake;
    }

    function getStake(address provider) external view returns (uint256) {
        return stakes[provider];
    }

    function getUnlockedStake(address provider) external view returns (uint256) {
        return stakes[provider] - totalLocked[provider];
    }
}
