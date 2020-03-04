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
	uint256			 public feePool;
	uint256			 public constant PPM = 1000000;  

	mapping (address => uint256) escrowBalances;

	constructor(address _uniswapFactory, address _token) public {
		uniswapFactory 	= IUniswapFactory(_uniswapFactory);
		uniswapExchange = IUniswapExchange(uniswapFactory.getExchange(_token)); 	 
		token 		   	= IERC20(_token);
		oceanFactory   	= OceanFactory(msg.sender);

		token.approve(address(uniswapExchange), token.totalSupply());
	}

	function escrow(uint256 amount) public payable {
		require(!oceanFactory.isOceanMarket(address(this)), 
			"err: should not be an ocean exchange");
		token.transferFrom(msg.sender, address(this), amount);
		uint256 fee = amount.sub((amount.mul(950000)).div(PPM));
		feePool = feePool.add(fee);
		escrowBalances[msg.sender] = amount.sub(fee);
		feePool = amount;
		if (feePool > 1000000) {
			_swapToOcean;
		}
	}

	function feelessEscrow(uint256 amount) public {
		require(oceanFactory.isOceanMarket(address(this)), 
			"err: should be an ocean exchange");
		token.transfer(address(this), amount);
		escrowBalances[msg.sender] = amount;		
	}

	function _swapToOcean() private {
		uint256 swapAmount = ((feePool.mul(PPM)).div(2)).div(PPM);
		// uniswapExchange.tokenToTokenSwapInput(swapAmount, 1, 1, block.timestamp.add(100000), oceanToken);
	}

	function withdraw() public {
		require(escrowBalances[msg.sender] > 0,
			"err: should have escrow balance");
		token.transferFrom(address(this), msg.sender, escrowBalances[msg.sender]);
		escrowBalances[msg.sender] = 0;	
	}

	// fallback function
	function() external payable{	
	
	}
}
