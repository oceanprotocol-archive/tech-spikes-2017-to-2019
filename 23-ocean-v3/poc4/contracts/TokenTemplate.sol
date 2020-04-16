pragma solidity ^0.6.0;

contract TokenTemplate {
    
    uint256 public publicVal;
    string public name;
    uint256 public value;
    
    constructor() public {
    }
    
    // "init(string,uint256)","test",200
    function init(
        string memory _name, 
        uint256 _value
    ) 
        public
    {
        name = _name;
        value = _value;
    }
    
    function setValue(uint256 val) public {
        require(
          val != publicVal &&
          val != 0,
          'Invalid value'
        );
        
        publicVal = val;
    }
    
    function getValue() public view returns(uint256) {
        return publicVal;
    }
}