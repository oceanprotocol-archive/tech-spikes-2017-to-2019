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
		uniswapFactory 	   = IUniswapFactory(_uniswapFactory);
		uniswapExchange    = IUniswapExchange(uniswapFactory.getExchange(_token)); 	 
		oceanFactory   	   = OceanFactory(msg.sender);
		token 		   	   = IERC20(_token);
	}

	function escrow(uint256 amount) public {
		require(!oceanFactory.isOceanMarket(address(this)), 
			"should not be an ocean market");
		token.transferFrom(msg.sender, address(this), amount);
		uint256 fee = amount.sub((amount.mul(950000)).div(PPM));
		feePool = feePool.add(fee);
		escrowBalances[msg.sender] = amount.sub(fee);
	}

	function feelessEscrow(uint256 amount) public {
		require(oceanFactory.isOceanMarket(address(this)), 
			"should be an ocean market");
		token.transferFrom(msg.sender, address(this), amount);
		escrowBalances[msg.sender] = amount;
	}

	function withdraw(address to) public {
		require(escrowBalances[msg.sender] > 0,
			"should have tokens escrowed");
		require(to != msg.sender,
			"cannot withdraw to this address");
		token.transfer(to, escrowBalances[msg.sender]);
		escrowBalances[msg.sender] = 0;	
	}

	function swapToOcean() public payable {
		token.approve(address(uniswapExchange), feePool);
		uniswapExchange.tokenToTokenTransferInput(feePool, 1, 1, block.timestamp.add(100000), oceanFactory.getOceanToken(), oceanFactory.getOceanProxy());
	}

	// fallback function
	function() external payable{	
	
	}
}
