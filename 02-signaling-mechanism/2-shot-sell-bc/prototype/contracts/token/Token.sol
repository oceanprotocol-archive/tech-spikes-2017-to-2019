pragma solidity 0.4.25;

import "../library/ERC20.sol";

/**
 * @title Ocean Token
 * @dev Ocean ERC20 tokens with token mining and distribution.
 */

contract Token is ERC20 {

    using SafeMath for uint256;

    // ============
    // DATA STRUCTURES:
    // ============
    string public name;                             // Set the token name for display
    string public symbol;                           // Set the token symbol for display

    // constants
    uint256 public totalSupply;                   // OceanToken total supply

    /**
    * @dev OceanToken Constructor
    * Runs only on initial contract creation.
    */
    constructor() public {
        name = 'Token';
        symbol = 'TKN';
        totalSupply = 1400000000 * 10 ** 18;
        super._mint(msg.sender, totalSupply);
    }

}
