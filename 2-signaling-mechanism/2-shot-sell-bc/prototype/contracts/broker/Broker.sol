pragma solidity 0.4.25;

import '../library/Ownable.sol';
import "../bonding/BondingCurve.sol";
import '../token/Token.sol';

contract Broker {

  using SafeMath for uint256;
  using SafeMath for uint;

  // global variables
  Token  public  mToken;
  uint256     public  scale;

  BondingCurve public bonding;
  ERC20Token public bondedToken;

  struct Loan {
    address lender;
    address borrower;
    uint256 bondedToken;
    uint256 reserveToken;
    uint256 collateral;
    uint256 interest;
    uint256 thresholdPrice;
    bool    open;
  }

  mapping (address => uint256) mLenders;
  mapping (address => Loan) mBorrowers;
  address public shortSeller;

  function getReservedToken() public view returns (uint256) {
      return mBorrowers[msg.sender].reserveToken;
  }

  function getTP() public view returns (uint256) {
      return mBorrowers[msg.sender].thresholdPrice;
  }

  function getStatus() public view returns (bool) {
      return mBorrowers[shortSeller].open;
  }
  ///////////////////////////////////////////////////////////////////
  //  initialize function
  ///////////////////////////////////////////////////////////////////
  constructor(address _tokenAddress, address _bcAddress) public {
      require(_tokenAddress != address(0x0), 'Token address is 0x0.');
      // instantiate Ocean token contract
      mToken = Token(_tokenAddress);
      // initialize variables
      scale = 10 ** 18;
      // instance
      bonding = BondingCurve(_bcAddress);
      bondedToken = ERC20Token(bonding.getTokenAddress());
  }

  function lenderSendTokens(uint256 amount) public {
    ERC20Token _token = ERC20Token(bondedToken);
    require(_token.transferFrom(msg.sender, address(this), amount));
    mLenders[msg.sender] = amount;
  }

  function shortSellTokens(address lender, uint256 collateral) public {
    shortSeller = msg.sender;
    mBorrowers[msg.sender] = Loan(lender, msg.sender, mLenders[lender], 0, 0, 0, 0, false);
    // transfer collateral
    require(mToken.transferFrom(msg.sender, address(this), collateral));
    // update
    mBorrowers[msg.sender].collateral = collateral;
    // sell borrowed tokens
    ERC20Token _token = ERC20Token(bondedToken);
    _token.transfer(address(bonding), mLenders[lender]);
    mBorrowers[msg.sender].reserveToken = collateral + bonding.brokerSell(address(this), mLenders[lender]);
    mBorrowers[msg.sender].open = true;
    // thresholdPrice
    uint256 nToken = mLenders[lender];
    mBorrowers[msg.sender].thresholdPrice =  ( mBorrowers[msg.sender].reserveToken.div(scale) * 2 - nToken.div(scale) ** 2 ) / ( 2 * mLenders[lender].div(scale));
  }


  uint256 variable;

  function queryVar() public view returns (uint256 cost) {
    address lender = mBorrowers[shortSeller].lender;
    (, cost) = bonding.queryAfterBuyPrice(mLenders[lender]);
  }

  function buyTokens(uint256 num) {
    (uint256 endPrice, uint256 cost) = bonding.queryAfterBuyPrice(num);
    if(endPrice >= mBorrowers[shortSeller].thresholdPrice) {
          // cover short position
          address lender = mBorrowers[shortSeller].lender;
          (, cost) = bonding.queryAfterBuyPrice(mLenders[lender]);
          require(mToken.transfer(address(bonding), cost));
          bonding.brokerCoverShort(mBorrowers[shortSeller].lender, mLenders[lender]);
          mBorrowers[shortSeller].reserveToken -= cost;
          mBorrowers[shortSeller].open = false;
    }

    // buy after
    bonding.brokerBuy(msg.sender, num);
  }

}
