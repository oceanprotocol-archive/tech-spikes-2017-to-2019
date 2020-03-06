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
	address 		public oceanToken;
	address 		public oceanProxy;

	mapping (address => address) tokenToMarket;
	mapping (address => address) marketToToken;

	/**
     * @notice constructor
     * @param _oceanMarket market contract that works with OCEAN ERC20
     * and acts as a template for other ERC20 contracts
     * @param _oceanToken address of OCEAN ERC20 token
     * @param _oceanProxy address that recieves fees in OCEAN
     * @param _uniswapFactory address of Uniswap exchange factory 
     */
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

	/**
     * @notice Create Ocean market
     * @param token address of a token that doesn't have Ocean market yet 
     * @return market address
     */
	function createMarket(address token) public returns(address) {
		require(tokenToMarket[token] == address(0),
			"market already exists");
		OceanMarket market = new OceanMarket(address(uniswapFactory), token);
		
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


}