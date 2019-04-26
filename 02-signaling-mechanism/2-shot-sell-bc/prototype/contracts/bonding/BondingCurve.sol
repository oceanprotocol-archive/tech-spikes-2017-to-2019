pragma solidity 0.4.25;

import '../token/Token.sol';

/**
 * @title linear Bonding Curve
 * @dev token holders can stake on assets through bonding curves and get bonded tokens.
 */

contract BondingCurve {

    using SafeMath for uint256;
    using SafeMath for uint;

    // global variables
    Token  public  mToken;
    uint256     public  scale;

    uint256  totalSupply = 0;
    uint256  poolBalance = 0;
    ERC20Token bondedToken;

    mapping (address => uint256) balances;    // num of ocean tokens for each token holder

    event buyBondedTokens(address indexed _requester, uint256 _ocn, uint256 _tokens);
    event sellBondedTokens(address indexed _requester, uint256 _ocn, uint256 _tokens);

    function getTokenAddress() view public returns (address){
      return address(bondedToken);
    }

    function getPrice() view public returns (uint256) {
        return totalSupply;
    }

    function getTokenBalance() view public returns (uint256) {
        return bondedToken.balanceOf(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////
    //  initialize function
    ///////////////////////////////////////////////////////////////////
    constructor(address _tokenAddress) public {
        require(_tokenAddress != address(0x0), 'Token address is 0x0.');
        // instantiate Ocean token contract
        mToken = Token(_tokenAddress);
        // initialize variables
        scale = 10 ** 18;
        bondedToken = new ERC20Token("BondToken", "BT");
    }

    // Testing: request initial fund transfer
    function requestTokens(uint256 amount) public returns (uint256) {
        require(msg.sender != 0x0);
        require(mToken.transfer(msg.sender, amount));
        return amount;
    }

    ///////////////////////////////////////////////////////////////////
    // Bonding Curve Module
    ///////////////////////////////////////////////////////////////////
    function queryAfterBuyPrice(uint256 numTokens) public returns (uint256 price, uint256 cost) {
        price = totalSupply + numTokens;
        cost = (price.div(scale) ** 2 - totalSupply.div(scale) ** 2).div(2).mul(scale);
    }

    function brokerCoverShort(address lender, uint256 numTokens) public returns(uint256 cost) {
        uint256 newSupply = totalSupply + numTokens;
        // calculate the amount bonded tokens to be minted:
        cost = (newSupply.div(scale) ** 2 - totalSupply.div(scale) ** 2).div(2).mul(scale);

        // mint new bonded tokens
        bondedToken.mint(lender, numTokens);
        totalSupply += numTokens;
        poolBalance += cost;

        emit buyBondedTokens(lender, cost, numTokens);
        return cost;
    }

    function brokerBuy(address buyer, uint256 numTokens) public returns(uint256 cost) {
        uint256 newSupply = totalSupply + numTokens;
        // calculate the amount bonded tokens to be minted:
        cost = (newSupply.div(scale) ** 2 - totalSupply.div(scale) ** 2).div(2).mul(scale);

        // transfer reserved tokens into contract for purchase
        require(mToken.transferFrom(buyer, address(this), cost));

        // mint new bonded tokens
        bondedToken.mint(buyer, numTokens);
        totalSupply += numTokens;
        poolBalance += cost;

        emit buyBondedTokens(buyer, cost, numTokens);
        return cost;
    }

    /**
     * @dev Buy 'numTokens' bonded tokens
     */
    function buy(uint256 numTokens) public returns(bool success) {
        uint256 newSupply = totalSupply + numTokens;
        // calculate the amount bonded tokens to be minted:
        uint256 cost = (newSupply.div(scale) ** 2 - totalSupply.div(scale) ** 2).div(2).mul(scale);

        // transfer reserved tokens into contract for purchase
        require(mToken.transferFrom(msg.sender, address(this), cost));

        // mint new bonded tokens
        bondedToken.mint(msg.sender, numTokens);
        totalSupply += numTokens;
        poolBalance += cost;

        emit buyBondedTokens(msg.sender, cost, numTokens);
        return true;
    }

    /**
     * @dev Sell tokens
     * @param sellAmount Amount of tokens to withdraw
     */
    function sell(uint256 sellAmount) public returns(uint256 cost) {
        ERC20Token _token = bondedToken;
        require(sellAmount > 0 && _token.balanceOf(msg.sender) >= sellAmount, 'msg.sender has no enough balance.');

        // calculate amount of Ocean tokens to withdraw
        uint256 newSupply = totalSupply - sellAmount;
        cost = (totalSupply.div(scale) ** 2 - newSupply.div(scale) ** 2).div(2).mul(scale);
        require(mToken.balanceOf(address(this)) >= cost, 'contract has no enough Ocean token balance.');

        // burn bonded tokens
        bondedToken.burnFrom(msg.sender, sellAmount);

        // release Ocean tokens
        require(mToken.transfer(msg.sender, cost));
        totalSupply -= sellAmount;
        poolBalance -= cost;

        emit sellBondedTokens(msg.sender, cost, sellAmount);
        return cost;
    }


    function brokerSell(address seller, uint256 sellAmount) public returns(uint256 cost) {
        ERC20Token _token = bondedToken;
        //require(sellAmount > 0 && _token.balanceOf(seller) >= sellAmount, 'msg.sender has no enough balance.');

        // calculate amount of Ocean tokens to withdraw
        uint256 newSupply = totalSupply - sellAmount;
        cost = (totalSupply.div(scale) ** 2 - newSupply.div(scale) ** 2).div(2).mul(scale);
        require(mToken.balanceOf(address(this)) >= cost, 'contract has no enough Ocean token balance.');

        // burn bonded tokens
        bondedToken.burn(sellAmount);

        // release Ocean tokens
        require(mToken.transfer(seller, cost));
        totalSupply -= sellAmount;
        poolBalance -= cost;

        emit sellBondedTokens(seller, cost, sellAmount);
        return cost;
    }


}


contract ERC20Token is ERC20 {

    string  private _name;
    string  private _symbol;
    uint8   private _decimals;

    constructor (string name, string symbol) public {
        _name = name;
        _symbol = symbol;
        _decimals = 18;
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public  returns (bool) {
        _mint(to, value);
        return true;
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param value The amount of token to be burned.
     */
    function burn(uint256 value) public  {
        _burn(msg.sender, value);
    }

    /**
     * @dev Burns a specific amount of tokens from the target address and decrements allowance
     * @param from address The address which you want to send tokens from
     * @param value uint256 The amount of token to be burned
     */
    function burnFrom(address from, uint256 value) public {
        _burnFrom(from, value);
    }

}
