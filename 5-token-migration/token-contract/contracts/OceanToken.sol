pragma solidity 0.5.3;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * @title Ocean Protocol ERC20 Token Contract
 * @author Ocean Protocol Team
 *
 * @dev Implementation of the Ocean Token.
 */
contract OceanToken is Ownable, ERC20Pausable, ERC20Detailed, ERC20Capped {

	using SafeMath for uint256;

	uint256 CAP = 1410000000;
	uint256 TOTALSUPPLY = CAP.mul(10 ** 18);

  // maintain the list of token holders
  mapping (address => bool) public accountExist;
  address[] public accountList;

	/**
	* @dev OceanToken constructor
	*      Runs only on initial contract creation.
	* @param _owner refers to the owner of the contract
	*/
	constructor(
		address _owner
	)
		public
		ERC20Detailed('OceanToken', 'OCEAN', 18)
		ERC20Capped(TOTALSUPPLY)
		Ownable()
	{
		// add owner as minter
		addMinter(_owner);
		// renounce msg.sender as minter
		renounceMinter();
		// transfer the ownership to the owner
		transferOwnership(_owner);
    // add owner to the account list
    accountList.push(_owner);
    accountExist[_owner] = true;
	}

    // Pausable Transfer Functions
    /**
     * @dev Transfer tokens when not paused
     **/
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        // add receiver into the account list if he/she is not in the list
        if( accountExist[_to] == false ){
          accountList.push(_to);
          accountExist[_to] = true;
        }
        return super.transfer(_to, _value);
    }

    /**
     * @dev transferFrom function to tansfer tokens when token is not paused
     **/
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        // add receiver into the account list if he/she is not in the list
        if( accountExist[_to] == false ){
          accountList.push(_to);
          accountExist[_to] = true;
        }
        return super.transferFrom(_from, _to, _value);
    }

    // retrieve the list of token holders (each time retrieve partial from the list to avoid out-of-gas error)
    function getAccountList(uint256 begin, uint256 end) public view onlyOwner returns (address[] memory) {
        // check input parameters are in the range
        require( (begin >= 0 && end < accountList.length), 'input parameter is not valide');
        address[] memory v = new address[](end.sub(begin).add(1));
        for (uint256 i = begin; i < end; i++) {
            // skip accounts whose balance is zero
            if(super.balanceOf(accountList[i]) > 0){
              v[i] = accountList[i];
            }
        }
        return v;
    }

    // kill the contract and destroy all tokens
  	function kill()
  		public
  		onlyOwner
  	{
  		selfdestruct(address(uint160(owner())));
  	}

  	function()
  		external payable
  	{
  		revert();
  	}
}
