"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, keccak256, toHex } from "viem";
import TaskEscrowABI from "@/lib/abis/TaskEscrow.json";

const ESCROW_ADDRESS = process.env
  .NEXT_PUBLIC_TASK_ESCROW_ADDRESS as `0x${string}` | undefined;

export function useCreateEscrow() {
  const {
    data: txHash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  function createEscrow(
    taskId: string,
    taskHash: `0x${string}`,
    budgetMon: string
  ) {
    if (!ESCROW_ADDRESS) throw new Error("NEXT_PUBLIC_TASK_ESCROW_ADDRESS not set");
    const taskIdBytes32 = keccak256(toHex(taskId));
    writeContract({
      address: ESCROW_ADDRESS,
      abi: TaskEscrowABI,
      functionName: "createEscrow",
      args: [taskIdBytes32, taskHash],
      value: parseEther(budgetMon),
    });
  }

  return {
    createEscrow,
    txHash,
    isPending: isPending || isConfirming,
    isSuccess,
    error: writeError,
  };
}
