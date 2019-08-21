pragma solidity 0.4.25;

import "zos-lib/contracts/Initializable.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "../registry/OceanRegistry.sol";
import '../token/OceanToken.sol';
import '../random/OceanRandao.sol';
import '../serviceAgreement/ServiceAgreement.sol';

/**
 * @title Ocean Reward
 * @dev distribute Ocean token rewards to service provider as incentives with dispute resolution.
 */

contract OceanReward is Initializable, Ownable {

    using SafeMath for uint256;
    using SafeMath for uint;

    // global variables
    OceanToken  public  mToken;
    OceanRandao public random;
    OceanRegistry public registry;
    ServiceAgreement public agreement;

    // reward distribution

    uint256 public distributeThreshold;       // trigger distribution of rewards if amountReward > threshold
    address public winner;                    // the winner candidate for token rewards
    bytes32 public did;                       // did for dataset corresponding to winner
    uint256 public withdrawBlock;
    uint256 public withdrawDelay;         // time delay for token reward withraw
    mapping (uint256 => bool) hasUsedcampaignID;     // campaign id for random number generation has been use d

    /**
    * @dev OceanReward Constructor
    * @param _tokenAddress The deployed contract address of OceanToken
    * Runs only on initial contract creation.
    */
    function initialize(
      address _tokenAddress,
      address _randaoAddress,
      address _registryAddress,
      address _agreementAddress,
      address _owner
    ) initializer public {
        require(_tokenAddress != address(0x0), 'Token address is 0x0.');
        require(_randaoAddress != address(0x0), 'RANDAO address is 0x0.');
        require(_registryAddress != address(0x0), 'Registry address is 0x0.');
        require(_agreementAddress != address(0x0), 'Service agreement address is 0x0.');
        require(_owner != address(0x0), 'Owner address is 0x0.');
        // instantiate Ocean token contract
        mToken = OceanToken(_tokenAddress);
        // set instance of RANDAO
        random = OceanRandao(_randaoAddress);
        // set registry instance:
        // note: each dataset listing must apply for listing in registry (deposit stakes as well)
        registry = OceanRegistry(_registryAddress);
        // set SA address
        agreement = ServiceAgreement(_agreementAddress);
        // Set owner
        Ownable.initialize(_owner);
        // set the token receiver to be marketplace
        mToken.setRewardAddress(address(this));
        // initialize variables
        distributeThreshold = 1000 * 10 ** 18;
        // change number of blocks to reach a specific period of delay time
        withdrawDelay = 3600;
    }


    /**
    @dev pick a winner from the candidate list in the service agreement contract
    */
    function pickWinner() public {
        // get the latest campaign id for RNG
        uint256 _campaignID = random.getLastCampaign();
        require(hasUsedcampaignID[_campaignID] == false, 'campaign id of RNG has been used. wait for the next.');
        // pick winner
        uint256 num = agreement.getCount();
        require(num > 0, 'candidate list must have at least one provider.');
        // generate random number
        uint256 index = random.getRandom(_campaignID)%num;
        // find winner address
        (winner, did) = agreement.getCandidate(index);
        require(winner != address(0) && did != 0x0, 'Winner or did is not valid.');
        // set this random number to be 'used'
        hasUsedcampaignID[_campaignID] = true;
        // set withdraw block number
        withdrawBlock = block.number.add(withdrawDelay);
    }

    /**
    @dev claim token rewards in the pool
    */
    function claimRewards() public {
        // check winner address is valid
        require(winner != address(0) && did != 0x0, 'Winner or did is not valid.');
        // check delay time period
        require(block.number >= withdrawBlock, 'Delay time has not been reached.');
        // check if challenge never exists or challenge fails
        require(registry.challengeNeverExists(did) || !registry.challengeWasSuccess(did), 'Challenge succeeds.');
        // check token reward balance should exceeds threshold
        uint256 amount = mToken.balanceOf(address(this));
        require( amount >= distributeThreshold, 'Reward pool balance does not reach threshold.');
        // send token rewards
        require(mToken.transfer(winner, amount), 'Token transfer failed.');
        // reset winner address and start new round
        winner = address(0);
        did = 0x0;
    }

}
