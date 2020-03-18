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

    event DeductedFee(
        address from,
        uint256 value
    );

    constructor(
        address contractOwner
    )
        public
        ERC20Detailed('XToken', 'X', DECIMALS) // Datatoken ID, tokenID
        ERC20Capped(TOTALSUPPLY)
        Ownable()
    {
        addMinter(contractOwner);
        renounceMinter();
        transferOwnership(contractOwner);
    }

    function mint(address to)
        public
        payable
        onlyOwner
    {
        uint256 startGas = gasleft();
        super._mint(address(this), 1);
        uint256 usedGas = startGas - gasleft();
        uint256 fee = usedGas * tx.gasprice;
        require(
            deduct(fee, msg.sender),
            'failed to deduct ocean fee'
        );
        _transfer(address(this), to, 1);
    }

    function deduct(uint256 fee, address from)
        private
        returns (bool)
    {
        emit DeductedFee(
            from,
            fee
        );
        return true;
    }
}