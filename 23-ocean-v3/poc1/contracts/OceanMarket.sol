pragma solidity >=0.5.0 <0.6.0;

import './OceanFactory.sol';
import './uniswap_interfaces/IERC20.sol';
import './uniswap_interfaces/IUniswapFactory.sol';
import './uniswap_interfaces/IUniswapExchange.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

/**
* @title OceanMarket
* @dev Contract for trading ERC20 to DataToken
*/
contract OceanMarket {

	using SafeMath for uint256;

	IUniswapFactory  public uniswapFactory;
	IUniswapExchange public uniswapExchange;
	IERC20           public token;
	OceanFactory     public oceanFactory;
	uint256			 public feePool;
	uint256			 public constant PPM = 1000000;  

	mapping (address => uint256) escrowBalances;

	/**
     * @notice constructor
     * @param _uniswapFactory address of Uniswap exchange factory 
     * @param _token address of an ERC20 token for the given exchange 
     */
	constructor(address _uniswapFactory, address _token) public {
		uniswapFactory 	   = IUniswapFactory(_uniswapFactory);
		uniswapExchange    = IUniswapExchange(uniswapFactory.getExchange(_token)); 	 
		oceanFactory   	   = OceanFactory(msg.sender);
		token 		   	   = IERC20(_token);
	}

	/**
     * @notice Escrow tokens with fee
     * @param amount amount of tokens escrowed
     */
	function escrow(uint256 amount) public {
		require(!oceanFactory.isOceanMarket(address(this)), 
			"should not be an ocean market");
		token.transferFrom(msg.sender, address(this), amount);
		uint256 fee = amount.sub((amount.mul(950000)).div(PPM));
		feePool = feePool.add(fee);
		escrowBalances[msg.sender] = amount.sub(fee);
	}

	/**
     * @notice Escrow tokens without fees, works only for OCEAN tokens
     * @param amount amount of tokens escrowed
     */
	function feelessEscrow(uint256 amount) public {
		require(oceanFactory.isOceanMarket(address(this)), 
			"should be an ocean market");
		token.transferFrom(msg.sender, address(this), amount);
		escrowBalances[msg.sender] = amount;
	}

	/**
     * @notice Withdraw escrowed tokens
     * @param to address to withdraw tokens to
     */
	function withdraw(address to) public {
		require(escrowBalances[msg.sender] > 0,
			"should have tokens escrowed");
		require(to != msg.sender,
			"cannot withdraw to this address");
		token.transfer(to, escrowBalances[msg.sender]);
		escrowBalances[msg.sender] = 0;	
	}

	/**
     * @notice Swap accumulated tokens to OCEAN and transfer to Ocean Proxy
     */
	function swapToOcean() public payable {
		token.approve(address(uniswapExchange), feePool);
		uniswapExchange.tokenToTokenTransferInput(feePool, 1, 1, block.timestamp.add(100000), oceanFactory.getOceanProxy(), oceanFactory.getOceanToken());
		feePool = 0;
	}

	/**
     * @notice fallback function
     */
	function() external payable{	
	
	}
}
