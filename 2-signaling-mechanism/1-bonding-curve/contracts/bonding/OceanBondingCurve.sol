pragma solidity 0.4.25;

import '../library/Ownable.sol';
import "./BancorFormula.sol";
import '../token/OceanToken.sol';

/**
 * @title Ocean Bonding Curve
 * @dev Ocean token holders can stake on assets through bonding curves and get bonded tokens.
 */

contract OceanBondingCurve is BancorFormula, Ownable {

    using SafeMath for uint256;
    using SafeMath for uint;

    // global variables
    OceanToken  public  mToken;
    uint256     public  scale;
    uint256     public  gasPrice;               // maximum gas price for bancor transactions
    uint32      private reserveRatio;           // determine shape of bonding curve

    // bonding curve struct
    struct bondingCurve {
      address  creator;
      uint256  virtualSupply;                   // initial virtual supply of bonded tokens to avoid numeric error
      uint256  poolBalance;                     // total amount of Ocean tokens deposited to purchase bonded tokens
      ERC20Token bondedToken;
      mapping (address => uint256) balances;    // num of ocean tokens for each token holder
    }
    // lookup table from DID to corresponding bondingCurve struct
    mapping(bytes32 => bondingCurve) did2BondingCurve;
    mapping (string => bool) nameExist;
    mapping (string => bool) symbolExist;

    event bondingCurveCreated(address indexed _creator, bytes32 indexed _did);
    event buyBondedTokens(address indexed _requester, uint256 _ocn, uint256 _tokens);
    event sellBondedTokens(address indexed _requester, uint256 _ocn, uint256 _tokens);

      // verifies that the gas price is lower than the universal limit
    modifier validGasPrice() {
      assert(tx.gasprice <= gasPrice);
      _;
    }

    modifier validBondingCurve(bytes32 did) {
      assert(did2BondingCurve[did].creator != address(0));
      _;
    }

    ///////////////////////////////////////////////////////////////////
    //  inquery function
    ///////////////////////////////////////////////////////////////////
    function getTokenBalance(bytes32 did, address account) validBondingCurve(did) public view returns (uint256 balance) {
        return did2BondingCurve[did].bondedToken.balanceOf(account);
    }

    function getTokenAddress(bytes32 did) validBondingCurve(did) public view returns (address) {
        return address(did2BondingCurve[did].bondedToken);
    }

    ///////////////////////////////////////////////////////////////////
    //  initialize function
    ///////////////////////////////////////////////////////////////////
    constructor(address _tokenAddress) public {
        require(_tokenAddress != address(0x0), 'Token address is 0x0.');
        // instantiate Ocean token contract
        mToken = OceanToken(_tokenAddress);
        // initialize variables
        scale = 10 ** 18;
        reserveRatio = 900000;  // MAX_WEIGHT = 1000000;
        gasPrice = 0 wei;
    }

    // Testing: request initial fund transfer
    function requestTokens(uint256 amount) public returns (uint256) {
        require(msg.sender != 0x0);
        require(mToken.transfer(msg.sender, amount));
        return amount;
    }

    // create new Bonding Curve
    function createBondingCurve(bytes32 did, string name, string symbol) public returns (bool success) {
        // prevent multiple bonding curves for the same asset
        require(did2BondingCurve[did].creator == address(0), 'there must be only one BC per did');
        require(nameExist[name] == false && symbolExist[symbol] == false, 'name or symbol already exists.');
        require(did != 0x0, 'did is not valid');

        // create bonded token
        ERC20Token _token = new ERC20Token(name, symbol);
        // set caller to be bondingCurve contract only!
        _token.setCallerContract(address(this));

        // create bonding curve
        did2BondingCurve[did] = bondingCurve({
          creator: msg.sender,
          virtualSupply: 10 * scale,
          poolBalance: 1 * scale,
          bondedToken: _token
        });

        // mint virtual supply tokens
        _token.mint(address(this), did2BondingCurve[did].virtualSupply);

        // emit message
        emit bondingCurveCreated(msg.sender, did);

        // update mapping
        nameExist[name] = true;
        symbolExist[symbol] = true;
        return true;
    }

    ///////////////////////////////////////////////////////////////////
    // Bonding Curve Module
    ///////////////////////////////////////////////////////////////////
    /**
     * @dev Buy tokens
     */
    function buy(bytes32 did, uint256 ocn) validBondingCurve(did) validGasPrice() public returns(bool success) {
        ERC20Token _token = did2BondingCurve[did].bondedToken;
        uint256 poolBalance = did2BondingCurve[did].poolBalance;

        // calculate the amount bonded tokens to be minted:
        uint256 tokensToMint = calculatePurchaseReturn(_token.totalSupply().div(scale), poolBalance.div(scale),reserveRatio, ocn.div(scale));

        // transfer Ocean tokens into contract for purchase
        require(mToken.transferFrom(msg.sender, address(this), ocn));
        did2BondingCurve[did].balances[msg.sender] = did2BondingCurve[did].balances[msg.sender].add(ocn);
        did2BondingCurve[did].poolBalance = did2BondingCurve[did].poolBalance.add(ocn);

        // mint new bonded tokens
        _token.mint(msg.sender, tokensToMint.mul(scale));

        emit buyBondedTokens(msg.sender, ocn, tokensToMint);
        return true;
    }

    /**
     * @dev Sell tokens
     * @param sellAmount Amount of tokens to withdraw
     */
    function sell(bytes32 did, uint256 sellAmount) validBondingCurve(did) validGasPrice() public returns(bool success) {
        ERC20Token _token = did2BondingCurve[did].bondedToken;
        require(sellAmount > 0 && _token.balanceOf(msg.sender) >= sellAmount, 'msg.sender has no enough balance.');

        // calculate amount of Ocean tokens to withdraw
        uint256 poolBalance = did2BondingCurve[did].poolBalance;
        uint256 ocn = calculateSaleReturn(_token.totalSupply().div(scale), poolBalance.div(scale), reserveRatio, sellAmount.div(scale)).mul(scale);
        require(mToken.balanceOf(address(this)) >= ocn, 'contract has no enough Ocean token balance.');

        // burn bonded tokens
        _token.burnFrom(msg.sender, sellAmount);

        // release Ocean tokens
        require(mToken.transfer(msg.sender, ocn));
        did2BondingCurve[did].balances[msg.sender] = did2BondingCurve[did].balances[msg.sender].sub(ocn);
        did2BondingCurve[did].poolBalance = did2BondingCurve[did].poolBalance.sub(ocn);

        emit sellBondedTokens(msg.sender, ocn, sellAmount);
        return true;
    }

    /**
      @dev Allows the owner to update the gas price limit
      @param _gasPrice The new gas price limit
    */
    function setGasPrice(uint256 _gasPrice) onlyOwner public {
      require(_gasPrice > 0);
      gasPrice = _gasPrice;
    }

}


contract ERC20Token is ERC20 {

    string  private _name;
    string  private _symbol;
    uint8   private _decimals;
    address private _callerContract;

    modifier validCaller(address _addr) {
        require(_addr == _callerContract && isContract(_addr));
        _;
    }

    constructor (string name, string symbol) public {
        _name = name;
        _symbol = symbol;
        _decimals = 18;
    }

    function setCallerContract(address bondingContract) public {
        require(_callerContract == address(0), 'bondingCurve contract address has been initialized.');
        require(bondingContract != address(0) && isContract(bondingContract), 'bondingContract address is not valid');
        _callerContract = bondingContract;
    }

    function isContract(address _addr) private view returns (bool) {
        uint length;
        assembly { length := extcodesize(_addr) }
        return length > 0;
    }
    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public validCaller(msg.sender) returns (bool) {
        _mint(to, value);
        return true;
    }

    /**
     * @dev Burns a specific amount of tokens.
     * @param value The amount of token to be burned.
     */
    function burn(uint256 value) public validCaller(msg.sender) {
        _burn(msg.sender, value);
    }

    /**
     * @dev Burns a specific amount of tokens from the target address and decrements allowance
     * @param from address The address which you want to send tokens from
     * @param value uint256 The amount of token to be burned
     */
    function burnFrom(address from, uint256 value) public validCaller(msg.sender) {
        _burnFrom(from, value);
    }

}
