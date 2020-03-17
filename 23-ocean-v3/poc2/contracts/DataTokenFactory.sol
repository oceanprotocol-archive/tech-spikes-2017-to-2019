pragma solidity >=0.4.21 <0.6.0;

import '@optionality.io/clone-factory/contracts/CloneFactory.sol';
import './DataToken.sol';

contract DataTokenFactory is CloneFactory {

	address public tokenTemplate;

	constructor(address _template) public {
    	tokenTemplate = _template;
  	}
  	
	function createMinimalToken(
		string  _name, 
		string  _symbol, 
		string  _metadata,
		uint8   _decimals
	) 
	external 
	returns(address  minimalToken) 
	{
		minimalToken = createClone(tokenTemplate);

		DataToken(minimalToken).setDataToken(_name, _symbol, _metadata, _decimals);
	}
}