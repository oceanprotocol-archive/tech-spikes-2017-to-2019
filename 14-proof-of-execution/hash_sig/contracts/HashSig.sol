pragma solidity 0.5.3;

contract HashSig {

  mapping (bytes32 => bytes32) signatures;

  constructor() public {
  }

  function addSig(bytes32 _name, bytes32 _hash) public returns (bool) {
    if(signatures[_name] != 0x0) return false;
    signatures[_name] = _hash;
    return true;
  }

  function getSig(bytes32 _name) public view returns (bytes32) {
    return signatures[_name];
  }

}
