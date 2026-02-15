// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StakeRegistry} from "../src/StakeRegistry.sol";
import {TaskEscrow} from "../src/TaskEscrow.sol";

contract Deploy is Script {
    function run() external {
        address aihToken = vm.envAddress("AIH_TOKEN_ADDRESS");
        uint256 timeoutSeconds = vm.envOr("ESCROW_TIMEOUT_SECONDS", uint256(24 hours));

        vm.startBroadcast();

        StakeRegistry registry = new StakeRegistry(aihToken);
        console.log("StakeRegistry deployed at:", address(registry));

        TaskEscrow escrow = new TaskEscrow(address(registry), timeoutSeconds);
        console.log("TaskEscrow deployed at:", address(escrow));

        vm.stopBroadcast();
    }
}
