pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ServiceFeeManager {
    using SafeMath for uint256;

    uint256 public constant  DIVIDENT = 90;
    uint256 public constant  DIVIDER  = 100;

    function getFee(
        uint256 _startGas,
        uint256 _tokenAmount
    )
    public
    view 
    returns(uint256)
    {

        uint256 txPrice  = _getTxPrice(_startGas);
        int128  tokenLog = log_2(int128(_tokenAmount+1));

        return  ((uint256(tokenLog).mul(txPrice)).mul(DIVIDENT)).div(DIVIDER); 
    }

    function getCashback(
        uint256 _fee,
        uint256 _payed
    )
    public
    pure 
    returns(uint256)
    {
        return _payed.sub(_fee);
    }
 
    function _getTxPrice(
        uint256 _startGas
    )
    private
    view
    returns(uint256)
    {
        uint256 usedGas = _startGas.sub(gasleft());
        return  usedGas.mul(tx.gasprice); 
    } 

  function log_2 (int128 x) internal pure returns (int128) {
    require (x > 0);

    int256 msb = 0;
    int256 xc = x;
    if (xc >= 0x10000000000000000) { xc >>= 64; msb += 64; }
    if (xc >= 0x100000000) { xc >>= 32; msb += 32; }
    if (xc >= 0x10000) { xc >>= 16; msb += 16; }
    if (xc >= 0x100) { xc >>= 8; msb += 8; }
    if (xc >= 0x10) { xc >>= 4; msb += 4; }
    if (xc >= 0x4) { xc >>= 2; msb += 2; }
    if (xc >= 0x2) msb += 1;  // No need to shift xc anymore

    int256 result = msb - 64 << 64;
    uint256 ux = uint256 (x) << 127 - msb;
    for (int256 bit = 0x8000000000000000; bit > 0; bit >>= 1) {
      ux *= ux;
      uint256 b = ux >> 255;
      ux >>= 127 + b;
      result += bit * int256 (b);
    }

    return int128 (result);
  }
}