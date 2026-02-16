// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TaskEscrow is Ownable, ReentrancyGuard {
    enum EscrowStatus { Open, Released, Refunded }

    struct Escrow {
        address requester;
        address provider;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        bytes32 taskHash;
        bytes32 proofHash;
    }

    mapping(bytes32 => Escrow) public escrows;
    uint256 public timeoutSeconds;

    event EscrowCreated(bytes32 indexed taskId, address indexed requester, uint256 amount, bytes32 taskHash);
    event EscrowReleased(bytes32 indexed taskId, address indexed provider, uint256 amount, bytes32 proofHash);
    event EscrowRefunded(bytes32 indexed taskId, address indexed requester, uint256 amount);

    error ZeroAmount();
    error EscrowAlreadyExists();
    error EscrowNotFound();
    error EscrowAlreadySettled();
    error TimeoutNotReached();
    error Unauthorized();
    error TransferFailed();

    constructor(uint256 _timeoutSeconds) Ownable(msg.sender) {
        timeoutSeconds = _timeoutSeconds;
    }

    function createEscrow(bytes32 taskId, bytes32 taskHash) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (escrows[taskId].amount != 0) revert EscrowAlreadyExists();

        escrows[taskId] = Escrow({
            requester: msg.sender,
            provider: address(0),
            amount: msg.value,
            status: EscrowStatus.Open,
            createdAt: block.timestamp,
            taskHash: taskHash,
            proofHash: bytes32(0)
        });

        emit EscrowCreated(taskId, msg.sender, msg.value, taskHash);
    }

    function release(bytes32 taskId, address provider, bytes32 proofHash) external onlyOwner nonReentrant {
        Escrow storage e = escrows[taskId];
        if (e.amount == 0) revert EscrowNotFound();
        if (e.status != EscrowStatus.Open) revert EscrowAlreadySettled();

        e.provider = provider;
        e.proofHash = proofHash;
        e.status = EscrowStatus.Released;

        (bool success, ) = provider.call{value: e.amount}("");
        if (!success) revert TransferFailed();

        emit EscrowReleased(taskId, provider, e.amount, proofHash);
    }

    function refund(bytes32 taskId) external nonReentrant {
        Escrow storage e = escrows[taskId];
        if (e.amount == 0) revert EscrowNotFound();
        if (e.status != EscrowStatus.Open) revert EscrowAlreadySettled();

        if (msg.sender != owner()) {
            if (msg.sender != e.requester) revert Unauthorized();
            if (block.timestamp < e.createdAt + timeoutSeconds) revert TimeoutNotReached();
        }

        e.status = EscrowStatus.Refunded;

        (bool success, ) = e.requester.call{value: e.amount}("");
        if (!success) revert TransferFailed();

        emit EscrowRefunded(taskId, e.requester, e.amount);
    }

    function setTimeoutSeconds(uint256 _timeoutSeconds) external onlyOwner {
        timeoutSeconds = _timeoutSeconds;
    }

    function getEscrow(bytes32 taskId) external view returns (Escrow memory) {
        return escrows[taskId];
    }

    function escrowExists(bytes32 taskId) external view returns (bool) {
        return escrows[taskId].amount != 0;
    }
}
