pragma solidity >=0.5.0 <0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20Capped.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';
import '@openzeppelin/contracts/ownership/Ownable.sol';

/**
 * @title Ocean Protocol ERC20 Token Contract
 * @author Ocean Protocol Team
 * @dev Implementation of the Ocean Token.
 */
contract OceanToken is Ownable, ERC20Pausable, ERC20Detailed, ERC20Capped {

    using SafeMath for uint256;

    uint8 constant DECIMALS = 18;
    uint256 constant CAP = 1400000000;
    uint256 TOTALSUPPLY = CAP.mul(uint256(10) ** DECIMALS);

    // keep track token holders
    address[] private accounts = new address[](0);
    mapping(address => bool) private tokenHolders;

    /**
     * @dev OceanToken constructor
     */
    constructor(
        address contractOwner
    )
    public
    ERC20Detailed('OceanToken', 'OCEAN', DECIMALS)
    ERC20Capped(TOTALSUPPLY)
    Ownable()
    {
        addPauser(contractOwner);
        renouncePauser();
        addMinter(contractOwner);
        renounceMinter();
        transferOwnership(contractOwner);
    }

    /**
     * @dev transfer tokens when not paused (pausable transfer function)
     * @param _to receiver address
     * @param _value amount of tokens
     * @return true if receiver is illegible to receive tokens
     */
    function transfer(
        address _to,
        uint256 _value
    )
    public
    returns (bool)
    {
        bool success = super.transfer(_to, _value);
        if (success) {
            updateTokenHolders(msg.sender, _to);
        }
        return success;
    }

    /**
     * @dev transferFrom transfers tokens only when token is not paused
     * @param _from sender address
     * @param _to receiver address
     * @param _value amount of tokens
     * @return true if receiver is illegible to receive tokens
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
    public
    returns (bool)
    {
        bool success = super.transferFrom(_from, _to, _value);
        if (success) {
            updateTokenHolders(_from, _to);
        }
        return success;
    }

    /**
     * @dev retrieve the address & token balance of token holders (each time retrieve partial from the list)
     * @param _start index
     * @param _end index
     * @return array of accounts and array of balances
     */
    function getAccounts(
        uint256 _start,
        uint256 _end
    )
    external
    view
    onlyOwner
    returns (address[] memory, uint256[] memory)
    {
        require(
            _start <= _end && _end < accounts.length,
            'Array index out of bounds'
        );

        uint256 length = _end.sub(_start).add(1);

        address[] memory _tokenHolders = new address[](length);
        uint256[] memory _tokenBalances = new uint256[](length);

        for (uint256 i = _start; i <= _end; i++)
        {
            address account = accounts[i];
            uint256 accountBalance = super.balanceOf(account);
            if (accountBalance > 0)
            {
                _tokenBalances[i] = accountBalance;
                _tokenHolders[i] = account;
            }
        }

        return (_tokenHolders, _tokenBalances);
    }

    /**
     * @dev get length of account list
     */
    function getAccountsLength()
    external
    view
    onlyOwner
    returns (uint256)
    {
        return accounts.length;
    }

    /**
     * @dev kill the contract and destroy all tokens
     */
    function kill()
    external
    onlyOwner
    {
        selfdestruct(address(uint160(owner())));
    }

    /**
     * @dev fallback function prevents ether transfer to this contract
     */
    function()
    external
    payable
    {
        revert('Invalid ether transfer');
    }

    /*
     * @dev tryToAddTokenHolder try to add the account to the token holders structure
     * @param account address
     */
    function tryToAddTokenHolder(
        address account
    )
    private
    {
        if (!tokenHolders[account] && super.balanceOf(account) > 0)
        {
            accounts.push(account);
            tokenHolders[account] = true;
        }
    }

    /*
     * @dev updateTokenHolders maintains the accounts array and set the address as a promising token holder
     * @param sender address
     * @param receiver address.
     */
    function updateTokenHolders(
        address sender,
        address receiver
    )
    private
    {
        tryToAddTokenHolder(sender);
        tryToAddTokenHolder(receiver);
    }
}
