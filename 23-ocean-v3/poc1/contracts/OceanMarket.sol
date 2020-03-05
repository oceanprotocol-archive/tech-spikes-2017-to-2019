pragma solidity >=0.5.0 <0.6.0;

import './OceanFactory.sol';
import './uniswap_interfaces/IERC20.sol';
import './uniswap_interfaces/IUniswapFactory.sol';
import './uniswap_interfaces/IUniswapExchange.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract OceanMarket {

	using SafeMath for uint256;

	IUniswapFactory  public uniswapFactory;
	IUniswapExchange public uniswapExchange;
	IERC20           public token;
	OceanFactory     public oceanFactory;
	// uint256			 public feePool;
	uint256			 public constant PPM = 1000000;  

	// mapping (address => uint256) escrowBalances;

	constructor(address _uniswapFactory, address _token) public {
		uniswapFactory 	   = IUniswapFactory(_uniswapFactory);
		uniswapExchange    = IUniswapExchange(uniswapFactory.getExchange(_token)); 	 
		oceanFactory   	   = OceanFactory(msg.sender);
		token 		   	   = IERC20(_token);
	}

	function escrow(uint256 amount) public {
		require(!oceanFactory.isOceanMarket(address(this)), 
			"err: should not be an ocean exchange");
		token.transferFrom(msg.sender, address(this), amount);
	}

	function swapToOcean() public payable {
		token.approve(address(uniswapExchange), token.balanceOf(address(this)));
		uniswapExchange.tokenToTokenSwapInput(token.balanceOf(address(this)), 1, 1, block.timestamp.add(100000), oceanFactory.getOceanToken());
	}

	// fallback function
	function() external payable{	
	
	}
}
