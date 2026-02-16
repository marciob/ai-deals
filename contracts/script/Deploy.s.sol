// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";

contract Deploy is Script {
    function run() external {
        uint256 timeoutSeconds = vm.envOr("ESCROW_TIMEOUT_SECONDS", uint256(24 hours));

        vm.startBroadcast();

        TaskEscrow escrow = new TaskEscrow(timeoutSeconds);
        console.log("TaskEscrow deployed at:", address(escrow));

        vm.stopBroadcast();
    }
}
