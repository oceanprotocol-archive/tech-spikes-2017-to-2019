pragma solidity >=0.5.0 <0.6.0;

import "./OceanMarket.sol";
import "./uniswap_interfaces/IUniswapFactory.sol";

contract OceanFactory {
	
	OceanMarket     public oceanMarket;
	IUniswapFactory public uniswapFactory;
	address 		public oceanToken;
	address 		public oceanProxy;

	mapping (address => address) tokenToMarket;
	mapping (address => address) marketToToken;

	constructor(address payable _oceanMarket, 
				address _oceanToken,
				address _oceanProxy, 
				address _uniswapFactory) 
	public 
	{
		oceanToken     = _oceanToken;
		oceanProxy     = _oceanProxy;
		oceanMarket    = OceanMarket(_oceanMarket);
		uniswapFactory = IUniswapFactory(_uniswapFactory);
		
		tokenToMarket[_oceanToken]  = _oceanMarket;
		marketToToken[_oceanMarket] = _oceanToken;
	} 

	function createMarket(address token) public returns(address) {
		require(tokenToMarket[token] == address(0),
			"market already exists");
		OceanMarket market = new OceanMarket(address(uniswapFactory), token);
		
		tokenToMarket[token] 		   = address(market);
		marketToToken[address(market)] = token;

		return address(market);
	}

	function getMarket(address token) public view returns(address){
		return(tokenToMarket[token]);
	}

	function getToken(address market) public view returns(address){
		return(marketToToken[market]);
	}

	function isOceanMarket(address marketAddress) public view returns(bool){
		return(marketAddress == address(oceanMarket));
	}

	function getOceanToken() public view returns(address){
		return(oceanToken);
	}

	function getOceanProxy() public view returns(address){
		return(oceanProxy);
	}


}