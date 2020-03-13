pragma solidity ^0.5.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";

contract XToken is Ownable, ERC20Detailed, ERC20Capped {
    using SafeMath for uint256;

    uint8 constant DECIMALS = 18;
    uint256 constant CAP = 1000000000;
    uint256 TOTALSUPPLY = uint256(10) ** DECIMALS;

    constructor(
        address contractOwner
    )
        public
        ERC20Detailed('XToken', 'X', DECIMALS)
        ERC20Capped(TOTALSUPPLY)
        Ownable()
    {
        addMinter(contractOwner);
        renounceMinter();
        transferOwnership(contractOwner);
    }

    function mint()
        public
        payable
        onlyOwner
    {
        super._mint(address(this), 1);
        require(
            deduct(),
            'unable to deduct fee'
        );
    }

    function deduct()
        private
        returns (bool)
    {
        return true;
    }
}