pragma solidity 0.4.25;

import "zos-lib/contracts/Initializable.sol";
import '../token/OceanToken.sol';

/**
 * @title Ocean Randao
 * @dev random number generation using 'commit-reveal' approach
 * derived from Randao's contract: https://github.com/randao/
 */

contract OceanRandao is Initializable {

  using SafeMath for uint256;

  OceanToken  public  mToken;

  struct Participant {
      uint256   secret;
      bytes32   commitment;
      uint256   reward;
      bool      revealed;
      bool      rewarded;
  }

  struct Consumer {
    address caddr;
    uint256 bountypot;
  }

  struct Campaign {
      uint32    bnum;
      uint96    deposit;
      uint16    commitBalkline;
      uint16    commitDeadline;

      uint256   random;
      bool      settled;
      uint256   bountypot;
      uint32    commitNum;
      uint32    revealsNum;

      mapping (address => Consumer) consumers;
      mapping (address => Participant) participants;
  }

  uint256 public numCampaigns;
  uint256 public lastCampaigns;
  Campaign[] public campaigns;

  modifier blankAddress(address _n) {
    require(_n == 0);
    _;
  }

  modifier moreThanZero(uint256 _deposit) {
    require(_deposit > 0);
    _;
  }

  modifier notBeBlank(bytes32 _s) {
    require(_s != "");
    _;
  }

  modifier beBlank(bytes32 _s) {
    require(_s == "");
    _;
  }

  modifier beFalse(bool _t) {
    require(!_t);
    _;
  }


  // constructor
  /**
  * @dev OceanReward Constructor
  * @param _tokenAddress The deployed contract address of OceanToken
  * Runs only on initial contract creation.
  */
  function initialize(address _tokenAddress) initializer public {
      require(_tokenAddress != address(0x0), 'Token address is 0x0.');
      // instantiate Ocean token contract
      mToken = OceanToken(_tokenAddress);
  }

  event LogCampaignAdded(uint256 indexed campaignID,
                         address indexed from,
                         uint32 indexed bnum,
                         uint96 deposit,
                         uint16 commitBalkline,
                         uint16 commitDeadline,
                         uint256 bountypot);

  modifier timeLineCheck(uint32 _bnum, uint16 _commitBalkline, uint16 _commitDeadline) {
      require(_commitBalkline > 0 && _commitDeadline > 0 && _commitDeadline < _commitBalkline);
      require(block.number < _bnum && block.number < _bnum - _commitBalkline);
      _;
  }

  function newCampaign(
      uint32 _bnum,
      uint96 _deposit,
      uint16 _commitBalkline,
      uint16 _commitDeadline
  ) timeLineCheck(_bnum, _commitBalkline, _commitDeadline)
    moreThanZero(_deposit) external returns (uint256 _campaignID) {
      // transfer Ocean tokens as deposit
      require(mToken.transferFrom(msg.sender, address(this), _deposit));
      _campaignID = campaigns.length++;
      Campaign storage c = campaigns[_campaignID];
      numCampaigns++;
      c.bnum = _bnum;
      c.deposit = _deposit;
      c.commitBalkline = _commitBalkline;
      c.commitDeadline = _commitDeadline;
      c.bountypot = _deposit;
      c.consumers[msg.sender] = Consumer(msg.sender, _deposit);
      emit LogCampaignAdded(_campaignID, msg.sender, _bnum, _deposit, _commitBalkline, _commitDeadline, _deposit);
  }

  event LogFollow(uint256 indexed CampaignId, address indexed from, uint256 bountypot);

  function follow(uint256 _campaignID)
    external returns (bool) {
      Campaign storage c = campaigns[_campaignID];
      Consumer storage consumer = c.consumers[msg.sender];
      return followCampaign(_campaignID, c, consumer);
  }

  modifier checkFollowPhase(uint256 _bnum, uint16 _commitDeadline) {
      require(block.number < _bnum - _commitDeadline);
      _;
  }

  function followCampaign(
      uint256 _campaignID,
      Campaign storage c,
      Consumer storage consumer
  ) checkFollowPhase(c.bnum, c.commitDeadline)
    blankAddress(consumer.caddr) internal returns (bool) {
      // transfer Ocean tokens as deposit
      require(mToken.transferFrom(msg.sender, address(this), c.deposit));
      c.bountypot += c.deposit;
      c.consumers[msg.sender] = Consumer(msg.sender, c.deposit);
      emit LogFollow(_campaignID, msg.sender, c.deposit);
      return true;
  }

  event LogCommit(uint256 indexed CampaignId, address indexed from, bytes32 commitment);

  function commit(uint256 _campaignID, bytes32 _hs) notBeBlank(_hs) external {
      Campaign storage c = campaigns[_campaignID];
      commitmentCampaign(_campaignID, _hs, c);
  }

  modifier checkCommitPhase(uint256 _bnum, uint16 _commitBalkline, uint16 _commitDeadline) {
      require(block.number > _bnum - _commitBalkline);
      require(block.number < _bnum - _commitDeadline);
      _;
  }

  function commitmentCampaign(
      uint256 _campaignID,
      bytes32 _hs,
      Campaign storage c
  ) checkCommitPhase(c.bnum, c.commitBalkline, c.commitDeadline)
    beBlank(c.participants[msg.sender].commitment) internal {
      // transfer Ocean tokens as deposit
      require(mToken.transferFrom(msg.sender, address(this), c.deposit));

      c.participants[msg.sender] = Participant(0, _hs, 0, false, false);
      c.commitNum++;
      emit LogCommit(_campaignID, msg.sender, _hs);
  }

  // For test
  function getCommitment(uint256 _campaignID) external constant returns (bytes32) {
      Campaign storage c = campaigns[_campaignID];
      Participant storage p = c.participants[msg.sender];
      return p.commitment;
  }

  function shaCommit(uint256 _s) public pure returns (bytes32) {
      return keccak256(abi.encodePacked(_s));
  }

  event LogReveal(uint256 indexed CampaignId, address indexed from, uint256 secret);

  function reveal(uint256 _campaignID, uint256 _s) external {
      Campaign storage c = campaigns[_campaignID];
      Participant storage p = c.participants[msg.sender];
      revealCampaign(_campaignID, _s, c, p);
  }

  modifier checkRevealPhase(uint256 _bnum, uint16 _commitDeadline) {
      require(block.number > _bnum - _commitDeadline);
      require(block.number < _bnum);
      _;
  }

  modifier checkSecret(uint256 _s, bytes32 _commitment) {
      require(keccak256(abi.encodePacked(_s)) == _commitment);
      _;
  }

  function revealCampaign(
    uint256 _campaignID,
    uint256 _s,
    Campaign storage c,
    Participant storage p
  ) checkRevealPhase(c.bnum, c.commitDeadline)
    checkSecret(_s, p.commitment)
    beFalse(p.revealed) internal {
      p.secret = _s;
      p.revealed = true;
      c.revealsNum++;
      c.random ^= p.secret;
      emit LogReveal(_campaignID, msg.sender, _s);
  }

  modifier bountyPhase(uint256 _bnum){
    require(block.number >= _bnum);
    _;
  }

  function getRandom(uint256 _campaignID) external returns (uint256) {
      Campaign storage c = campaigns[_campaignID];
      return returnRandom(c, _campaignID);
  }

  function returnRandom(Campaign storage c, uint256 _campaignID) bountyPhase(c.bnum) internal returns (uint256) {
      if (c.revealsNum == c.commitNum) {
          c.settled = true;
          lastCampaigns = _campaignID;
          return c.random;
      }
  }

  function queryRandom(uint256 _campaignID) external view returns (uint256) {
      Campaign storage c = campaigns[_campaignID];
      if (c.revealsNum == c.commitNum) {
          return c.random;
      }
  }

  function getLastCampaign() external view returns (uint256) {
      return lastCampaigns;
  }

  // The commiter get his bounty and deposit, there are three situations
  // 1. Campaign succeeds.Every revealer gets his deposit and the bounty.
  // 2. Someone revels, but some does not,Campaign fails.
  // The revealer can get the deposit and the fines are distributed.
  // 3. Nobody reveals, Campaign fails.Every commiter can get his deposit.
  function getMyBounty(uint256 _campaignID) external {
      Campaign storage c = campaigns[_campaignID];
      Participant storage p = c.participants[msg.sender];
      transferBounty(c, p);
  }

  function transferBounty(
      Campaign storage c,
      Participant storage p
    ) bountyPhase(c.bnum)
      beFalse(p.rewarded) internal {
      if (c.revealsNum > 0) {
          if (p.revealed) {
              uint256 share = calculateShare(c);
              returnReward(share, c, p);
          }
      // Nobody reveals
      } else {
          returnReward(0, c, p);
      }
  }

  function calculateShare(Campaign c) internal pure returns (uint256 _share) {
      // Someone does not reveal. Campaign fails.
      if (c.commitNum > c.revealsNum) {
          //_share = (fines(c)) / c.revealsNum;
          _share = ((c.commitNum - c.revealsNum) * c.deposit) / c.revealsNum;
      // Campaign succeeds.
      } else {
          _share = c.bountypot / c.revealsNum;
      }
  }

  function returnReward(
      uint256 _share,
      Campaign storage c,
      Participant storage p
  ) internal {
      p.reward = _share;
      p.rewarded = true;
      // return funds
      require(mToken.transfer(msg.sender, _share + c.deposit));
  }

  function fines(Campaign c) internal pure returns (uint256) {
      return (c.commitNum - c.revealsNum) * c.deposit;
  }

  // If the campaign fails, the consumers can get back the bounty.
  function refundBounty(uint256 _campaignID) external {
      Campaign storage c = campaigns[_campaignID];
      returnBounty(c);
  }

  modifier campaignFailed(uint32 _commitNum, uint32 _revealsNum) {
      require(_commitNum != _revealsNum || _commitNum == 0);
      _;
  }

  modifier beConsumer(address _caddr) {
      require(_caddr == msg.sender);
      _;
  }

  function returnBounty(Campaign storage c)
    bountyPhase(c.bnum)
    campaignFailed(c.commitNum, c.revealsNum)
    beConsumer(c.consumers[msg.sender].caddr) internal {
      uint256 bountypot = c.consumers[msg.sender].bountypot;
      c.consumers[msg.sender].bountypot = 0;
      require(mToken.transfer(msg.sender, bountypot));
  }
}
