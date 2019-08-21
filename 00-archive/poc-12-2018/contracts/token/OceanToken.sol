pragma solidity 0.4.25;

import "zos-lib/contracts/Initializable.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";

/**
 * @title Ocean Token
 * @dev Ocean ERC20 tokens with token mining and distribution.
 */

contract OceanToken is Initializable, ERC20 {

    using SafeMath for uint256;

    // ============
    // DATA STRUCTURES:
    // ============
    string public name;                             // Set the token name for display
    string public symbol;                           // Set the token symbol for display

    // initial receiver of tokens
    address public tokenReceiver;                   // address to receive initial supply of TOKENS
    address public rewardAddress;                   // address to receive reward tokens

    // constants
    uint8 public decimals;                        // Set the number of decimals for display
    uint256 public totalSupply;                   // OceanToken total supply
    uint256 public currentSupply;                 // current available tokens

    // network reward parameters
    uint256 public unmintedSupply;                  // token amount that are not minted
    uint256 public inflationRatePerInterval;      // inflationRatePerInterval should be multiplied by 1e18
    uint256 public blockInterval;                 // period of inflation calculation

    uint256 public initInflationBlock;
    uint256 public lastInflationBlock;

    // Events
    event tokenMinted(address indexed _miner, uint256 _amount);

    /**
    * @dev OceanToken Constructor
    * Runs only on initial contract creation.
    */
    function initialize() initializer public {
        name = 'OceanToken';
        symbol = 'OCN';
        tokenReceiver = address(0);
        rewardAddress = address(0);
        decimals = 18;
        totalSupply = 1400000000 * 10 ** 18;
        currentSupply = totalSupply.mul(40).div(100);
        unmintedSupply = totalSupply.sub(currentSupply);
        inflationRatePerInterval = 1.02 * (10 ** 18);     // inflation rate per block (50% / half-life-num-block), e.g., 2%
        blockInterval = 1;                                // testing: calculate inflation every block
        // log init block number
        initInflationBlock = block.number;
        // log last mining block
        lastInflationBlock = block.number;
    }

    /**
    * @dev mintInitialSupply mints the initial supply tokens and sends to receiver (called upon deployment and only once)
    * @param _to The address to send initial supply tokens
    * @return success setting is successful.
    */
    function mintInitialSupply(address _to) public returns (bool success){
        // make sure receiver is not set already
        require(tokenReceiver == address(0), 'Receiver address already set.');
        // Creator address is assigned initial available tokens
        super._mint(_to, currentSupply);
        // set receiver
        tokenReceiver = _to;
        return true;
    }

    /**
    * @dev setRewardPool set the address (OceanReward) to receive the reward tokens
    * @param _to The address to send tokens
    * @return success setting is successful.
    */
    function setRewardAddress(address _to) public returns (bool success){
        // make sure receiver is not set already
        require(rewardAddress == address(0), 'reward pool address already set.');
        // set _rewardPool
        rewardAddress = _to;
        return true;
    }

    /**
     * @dev emitTokens Ocean tokens according to schedule forumla
     * @return true if the mining of Ocean tokens is successful.
     */
    function mintTokens() public returns (bool success) {
        // check if all tokens have been minted
        if (currentSupply == totalSupply) {
            return false;
        }

        uint256 infRate = inflationRatePerInterval;
        uint256 blockInt = blockInterval;
        uint256 currentBlock = block.number;

        // compute the number of interval elapsed since the last time we minted infation tokens
        uint256 intervalsSinceLastMint = currentBlock / blockInt - lastInflationBlock / blockInt;

        // only update at least with one interval elapsed
        require(intervalsSinceLastMint > 0);

        uint256 rate = infRate;
        // compute inflation for total timeIntervals elapsed
        for (uint256 i = 1; i < intervalsSinceLastMint; i++) {
          rate = rate.mul(infRate).div(10 ** 18);
        }

        // calculate number of tokens to be minted
        require(rate <= 2 * (10 ** 18), 'inflation cannot exceed the limit.');
        uint256 tokenInflation = unmintedSupply.mul(rate).div(10 ** 18).sub(unmintedSupply);

        // avoid minting more tokens than total supply
        if (currentSupply.add(tokenInflation) > totalSupply) {
            tokenInflation = totalSupply.sub(currentSupply);
        }
        // mint new tokens and deposit in OceanReward contract
        // super._mint(tokenReceiver, tokenInflation);  // testing purpose: send reward tokens to receiver
        super._mint(rewardAddress, tokenInflation);     // production: send reward tokens to reward contract
        // log the block number
        lastInflationBlock = currentBlock;
        // update current token supply
        currentSupply = currentSupply.add(tokenInflation);
        emit tokenMinted(msg.sender, tokenInflation);
        return true;
    }

    /**
    * @dev Fallback function to return Ether deposit
    */
    function() public payable {
        revert();
    }

}
