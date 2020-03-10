pragma solidity >=0.5.0 <0.6.0;

import './DataToken.sol';
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

	DataToken		 public dataToken;
	IUniswapFactory  public uniswapFactory;
	IUniswapExchange public uniswapExchange;
	IERC20           public token;
	OceanFactory     public oceanFactory;
	uint256			 public feePool;
	uint256			 public constant PPM = 1000000;  

	struct Escrow {
		address minter;
		uint256 value;
		bool    isConsumed;
	}

	mapping (uint256 => Escrow) escrowData;

	/**
     * @notice constructor
     * @param _uniswapFactory address of Uniswap exchange factory 
     * @param _token address of an ERC20 token for the given exchange
     * @param _dataToken data token
     */
	constructor(address _uniswapFactory, address _token, address _dataToken) public {
		uniswapFactory 	   = IUniswapFactory(_uniswapFactory);
		uniswapExchange    = IUniswapExchange(uniswapFactory.getExchange(_token)); 	 
		oceanFactory   	   = OceanFactory(msg.sender);
		token 		   	   = IERC20(_token);
		dataToken 		   = DataToken(_dataToken);
	}

	/**
     * @notice Lock ERC20 tokens and mint ERC721 data token
     * @param amount amount of ERC721 tokens
     * @param metadata dataToken related metadata
     */
    function lockAndMint(uint256 amount, string memory metadata) public returns(uint256) {
		require(dataToken.isApprovedForAll(msg.sender, address(this)),
			"should be ApprovedForAll");
	
		uint tokensLocked = _lock(amount);
		uint id = uint(keccak256(abi.encodePacked(now, msg.sender, amount)));
		dataToken.mint(msg.sender, id, metadata);
		escrowData[id] = Escrow({
			minter: msg.sender,
			value: tokensLocked,
			isConsumed: false   		
		});		
		return id;
    }

	/**
     * @notice Withdraw escrowed tokens
     */
	function withdrawAndBurn(
						uint id, 
					    address to, 
					    uint price, 
					    string memory metadata, 
					    bytes memory signature
		) public 
	{
		require(escrowData[id].value > 0,
			"should have tokens escrowed");
		require(to != escrowData[id].minter,
			"cannot withdraw to this address");

		address _addressSigned = dataToken.getMessageSigner(id, price, metadata, signature);
        require(_addressSigned == escrowData[id].minter,
        		"signer should be the minter");
        // _user = address(uint160(_userSigned))

		// // TODO: should be changed to signer
		// require(escrowData[id].minter == msg.sender,
		// 	"only minter can withdraw");

		token.transfer(to, escrowData[id].value);
		dataToken.burn(id);
		escrowData[id].value = 0;
		escrowData[id].isConsumed = true;	
	}

	/**
     * @notice Swap accumulated tokens to OCEAN and transfer to Ocean Proxy
     */
	function swapToOcean() public payable {
		require(feePool > 0,
			"There is nothing to withdraw");
		token.approve(address(uniswapExchange), feePool);
		uniswapExchange.tokenToTokenTransferInput(feePool, 1, 1, block.timestamp.add(100000), oceanFactory.getOceanProxy(), oceanFactory.getOceanToken());
		feePool = 0;
	}

	function _lock(uint256 amount) private returns(uint256) {
		token.transferFrom(msg.sender, address(this), amount);
		if (oceanFactory.isOceanMarket(address(this))) {
			return amount;
		} else {
			uint256 fee = amount.sub((amount.mul(950000)).div(PPM));
			feePool = feePool.add(fee);
			return amount.div(fee);
		} 
	}

	/**
     * @notice fallback function
     */
	function() external payable{	
	
	}
}