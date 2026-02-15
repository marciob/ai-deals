// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockAIH is ERC20 {
    constructor() ERC20("AI Helpers Token", "AIH") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
