// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPYUSD
 * @notice Mock PYUSD token for local testing
 * @dev Mimics PYUSD ERC20 with 6 decimals (like the real PYUSD)
 */
contract MockPYUSD is ERC20, Ownable {
    constructor() ERC20("PayPal USD", "PYUSD") Ownable(msg.sender) {}

    /**
     * @notice Returns 6 decimals like real PYUSD
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mint tokens for testing
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Mint tokens to caller (for easy testing)
     * @param amount Amount to mint
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    /**
     * @notice Burn tokens
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

