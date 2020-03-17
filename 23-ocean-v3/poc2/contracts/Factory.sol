pragma solidity >=0.4.21 <0.6.0;

import '@optionality.io/clone-factory/contracts/CloneFactory.sol';

contract CoinFactory is CloneFactory {

	address public TokenTemplate;

	constructor(address _template) public {
    	TokenTemplate = _template;
  	}
  	
	function createMinimalToken() external returns(address  minimalToken) {
		minimalToken = createClone(TokenTemplate);
	}

}