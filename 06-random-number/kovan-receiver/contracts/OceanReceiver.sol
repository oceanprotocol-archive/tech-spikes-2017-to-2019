pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
/*
 * POC of Ocean / Chainlink Integration
 * by Ocean Protocol Team
 */

contract OceanReceiver is Ownable {
  /*
   * global variables
   */
  uint256 public data;
  /*
   * events
   */
  event requestFulfilled(uint256 _data);
  /*
   * constructor function
   */
  constructor() public {}
  /*
   * view functions to get internal information
   */
  function getRequestResult() public view returns (uint256) {
    return data;
  }
  /*
   * function to keep the returned value from Chainlink network
   */
  function receiveData(uint256 _data)
    public
  {
    data = _data;
    emit requestFulfilled(_data);
  }
}
