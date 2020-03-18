pragma solidity >=0.4.21 <0.6.0;

import './common/ERC20.sol';

contract DataToken is ERC20 {

    event DeductedFee(
        address from,
        uint256 value
    );

    string  name;
    string  symbol;
    uint8   decimals;
	string  metadata;
	address owner;

	function setDataToken(
		string  _name, 
		string  _symbol, 
		string  _metadata,
		uint8   _decimals
		) 
	external 
	{
		require(owner == address(0),
			"owner should be a zero address");

		name 	 = _name;
		symbol 	 = _symbol;
		decimals = _decimals;
		metadata = _metadata;
		owner 	 = msg.sender;
	}

    function mint(address to)
        public
        payable
    {
    	require(owner == msg.sender,
    		"minter should be a message sender");
        uint256 startGas = gasleft();
        super._mint(address(this), 1);
        uint256 usedGas = startGas - gasleft();
        uint256 fee = usedGas * tx.gasprice;
        require(
            _deductFee(fee, msg.sender),
            'failed to deduct ocean fee'
        );
        _transfer(address(this), to, 1);
    }

    function _deductFee(uint256 fee, address from)
        private
        returns (bool)
    {
    	require(msg.value >= fee,
    		"ether sent is not enough");

        if (msg.value>fee){
        	from.transfer(msg.value-fee);
        }
        emit DeductedFee(
            from,
            fee
        );
        return true;
    }
}

