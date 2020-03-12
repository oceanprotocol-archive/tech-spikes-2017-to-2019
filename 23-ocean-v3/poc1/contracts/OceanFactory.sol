pragma solidity >=0.5.0 <0.6.0;

import "./OceanMarket.sol";
import "./uniswap_interfaces/IUniswapFactory.sol";

/**
* @title OceanFactory
* @dev Contract for Ocean markets management
*/
contract OceanFactory {
	
	OceanMarket     public oceanMarket;
	IUniswapFactory public uniswapFactory;
	address 		public dataToken;
	address 		public oceanToken;
	address 		public oceanProxy;

	mapping (address => address) tokenToMarket;
	mapping (address => address) marketToToken;

	/**
     * @notice constructor
     * @param _dataToken data token address
     * @param _oceanToken address of OCEAN ERC20 token
     * @param _oceanProxy address that recieves fees in OCEAN
     * @param _uniswapFactory address of Uniswap exchange factory 
     */
	constructor(address _dataToken, 
				address _oceanToken,
				address _oceanProxy, 
				address _uniswapFactory) 
	public 
	{
		dataToken 	   = _dataToken;
		oceanToken     = _oceanToken;
		oceanProxy     = _oceanProxy;
		uniswapFactory = IUniswapFactory(_uniswapFactory);
		oceanMarket    = new OceanMarket(_uniswapFactory, _oceanToken, dataToken);
		
		tokenToMarket[_oceanToken]  = address(oceanMarket);
		marketToToken[address(oceanMarket)] = _oceanToken;
	} 

	/**
     * @notice Create Ocean market
     * @param token address of a token that doesn't have Ocean market yet 
     * @return market address
     */
	function createMarket(address token) public returns(address) {
		require(tokenToMarket[token] == address(0),
			"market already exists");
		OceanMarket market = new OceanMarket(address(uniswapFactory), token, dataToken);
		
		tokenToMarket[token] 		   = address(market);
		marketToToken[address(market)] = token;

		return address(market);
	}

	/**
     * @notice Return address of an existing Ocean market
     * @param token address of a token that has Ocean market  
	 * @return market address
     */
	function getMarket(address token) public view returns(address){
		return(tokenToMarket[token]);
	}

	/**
     * @notice Return address of a token assigned to an existing Ocean market
     * @param market Ocean market address
     * @return token address
     */
	function getToken(address market) public view returns(address){
		return(marketToToken[market]);
	}

	/**
     * @notice Checks if market is assigned for an Ocean token 
     * @param marketAddress Ocean market address  
     * @return bool
     */
	function isOceanMarket(address marketAddress) public view returns(bool){
		return(marketAddress == address(oceanMarket));
	}

	/**
     * @notice Returns OCEAN token address 
     * @return OCEAN token address
     */
	function getOceanToken() public view returns(address){
		return(oceanToken);
	}

	/**
     * @notice Returns Ocean proxy address 
     * @return Ocean proxy address
     */
	function getOceanProxy() public view returns(address){
		return(oceanProxy);
	}

	/**
     * @notice Returns data token address 
     * @return dataToken address
     */ 
	function getDataToken() public view returns(address){
		return(dataToken);
	}


}