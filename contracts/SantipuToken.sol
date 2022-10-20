// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Custom Token
 * @author santipu
 */

contract SantipuToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("SantipuToken", "SPT") {
    _mint(msg.sender, initialSupply);
  }
}
