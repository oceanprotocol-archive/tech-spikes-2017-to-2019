pragma solidity ^0.6.0;

import "github/OpenZeppelin/openzeppelin-contracts/contracts/ownership/Ownable.sol";
import "github/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract DataTokenERC20 is ERC20, Ownable {
    
    string public name;
    string public symbol;
    uint8 public decimals;
    
    bool private initialized = false;
    
    modifier onlyNotInitialized(){
        require(
            !initialized,
            'Token contract already initialized'
        );
        _;
    }
    constructor() public {
        // owner will be changed prior the setup to TokenFactory address
        transferOwnership(msg.sender);
    }
    
    // called only by TokenFactory (the contract owner)
    // "init(string,string,address)","DATATOKEN-1","DT01"
    // "init(string,string,address)","DATATOKEN-2","DT02"
    function init(
        string memory _name, 
        string memory _symbol,
        address _owner
    ) 
        public
        onlyNotInitialized
    {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        _transferOwnership(_owner);
        initialized = true;
    }
}