pragma solidity 0.5.7;

contract ServiceFeeManager {

	address payable public collector;

    function cutFee(
        uint256 _startGas
    )
    public
    view 
    returns(uint256)
    {
        uint256 usedGas = _startGas-gasleft();
    	return  usedGas*tx.gasprice; 
    }

    function cashBack(
        uint256 _fee,
        uint256 _payed
    )
    public
    pure 
    returns(uint256)
    {
        return _payed-_fee;
    }
 
    function addFeeCollector(
    	address payable _collector
    ) 
    public 
    {
    	collector = _collector;
    }

    function revokeFeeCollector(

    ) 
    public 
    {
    	collector = address(0);    	
    }

}