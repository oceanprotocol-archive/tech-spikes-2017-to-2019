pragma solidity >=0.4.21 <0.6.0;

import '@optionality.io/clone-factory/contracts/CloneFactory.sol';
import './DataToken.sol';

contract DataTokenFactory is CloneFactory {

	address public tokenTemplate;

    uint8 constant DECIMALS = 18;
    
    address[] tokens;
   	// mapping (address => address) ownerToToken;


    event TokenCreated (
        uint256  tokenId,
        address  tokenAddress
    );

	constructor(address _template) public {
    	tokenTemplate = _template;
  	}
  	
	function createToken(
		string  _name, 
		string  _symbol, 
		string  _metadata
	) 
	external 
	returns(address  token) 
	{
		token = createClone(tokenTemplate);
		DataToken(token).setDataToken(_name, _symbol, _metadata, DECIMALS);
		
		tokens.push(token);
		// ownerToToken[msg.sender] = token;

		emit TokenCreated(tokens.length-1, token);
	}

	function mintTo(
		uint256 tokenId, 
		address to
		) 
	public 
	payable 
	{
		require(msg.value > 0,
			"no fee sent");

		address token = tokens[tokenId];

		// require(ownerToToken[msg.sender] == token,
		// 	"should be a token owner");
		DataToken(token)._mint.value(msg.value)(to, msg.sender);
	}
}