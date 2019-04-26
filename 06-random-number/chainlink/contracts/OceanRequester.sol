pragma solidity 0.4.24;

import "chainlink/solidity/contracts/Chainlinked.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/*
 * POC of Ocean / Chainlink Integration
 * by Ocean Protocol Team
 */

contract OceanRequester is Chainlinked, Ownable {
  /*
   * global variables
   */
   // Rinkeby -> Kovan jobId for random.org: 683dcbab01cd49ec96d6d706f9df2381
  bytes32 constant JOB_ID = bytes32("f1282af8d71d4049aae0d44d8a750c11");
  uint256 constant private ORACLE_PAYMENT = 1 * LINK; // default price for each request
  bytes32 public data;

  /*
   * events
   */
  event requestCreated(address indexed requester,bytes32 indexed jobId, bytes32 indexed requestId);
  event requestFulfilled(bytes32 indexed _requestId, bytes32 _data);
  event tokenWithdrawn(address indexed recepient, uint256 amount);
  event tokenDeposited(address indexed sender, uint256 amount);
  /*
   * constructor function
   */
  constructor() public {
    // Set the address for the LINK token for the Rinkeby network.
    setLinkToken(0x01BE23585060835E02B77ef475b0Cc51aA1e0709);
    // Set the address of the oracle in Rinkeby network to create requests to.
    setOracle(0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e);
  }

  /*
   * view functions to get internal information
   */

  function getChainlinkToken() public view returns (address) {
    return chainlinkToken();
  }

  function getOracle() public view returns (address) {
    return oracleAddress();
  }

  function getRequestResult() public view returns (bytes32) {
    return data;
  }

  /*
   * Create a request and send it to default Oracle contract
   */
  function getRandom(
    uint256 _min,
    uint256 _max,
    string _exAddr,
    string _funcId
  )
    public
    onlyOwner
    returns (bytes32 requestId)
  {
    // create request instance
    Chainlink.Request memory req = newRequest(JOB_ID, this, this.fulfill.selector);
    // fill in the pass-in parameters
    req.addUint("min", _min);
    req.addUint("max", _max);
    req.add("exAddr", _exAddr);
    req.add("funcId", _funcId);
    // send request & payment to Chainlink oracle (Requester Contract sends the payment)
    requestId = chainlinkRequest(req, ORACLE_PAYMENT);
    // emit event message
    emit requestCreated(msg.sender, JOB_ID, requestId);
  }

  /*
   * callback function to keep the returned value from Oracle contract
   */
  function fulfill(bytes32 _requestId, bytes32 _hash)
    public
    recordChainlinkFulfillment(_requestId)
  {
    data = _hash;
    emit requestFulfilled(_requestId, _hash);
  }

  // clear the data field
  function clearData()
    public
    onlyOwner
  {
    data = 0x0;
  }

  /*
   * withdraw the remaining LINK tokens from the contract
   */
  function withdrawTokens() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkToken());
    uint256 balance = link.balanceOf(address(this));
    require(link.transfer(msg.sender, balance), "Unable to transfer");
    emit tokenWithdrawn(msg.sender, balance);
  }

  /*
   * cancel the pending request
   */
  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
	onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }
}
