pragma solidity >=0.4.21 <0.6.0;

import './common/ERC20.sol';
import './common/ERC20Mintable.sol';

contract DataToken is ERC20, ERC20Mintable {

    string  name;
    string  symbol;
    uint8   decimals;
	string  metadata;
	address owner;

	function setDataToken(
		string  _name, 
		string  _symbol, 
		string  _metadata,
		uint8   _decimals
		) 
	external 
	{
		require(owner == address(0),
			"owner should be a zero address");

		name 	 = _name;
		symbol 	 = _symbol;
		decimals = _decimals;
		metadata = _metadata;
		owner 	 = msg.sender;

		addMinter(owner);
	}
}
