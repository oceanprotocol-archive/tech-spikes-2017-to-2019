/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')
const OceanVoting = artifacts.require('OceanVoting')

const utils = require('./OceanVoting.utils.js');
const BN = require('bignumber.js');

global.artifacts = artifacts
global.web3 = web3
let zos
const scale = 1e18

// NOTE: remove all modifier in OceanRandao contract to avoid timeLineCheck failure
// testing below assume there is NO timeline checks; everything happens back to back.
contract('OceanVoting', (accounts) => {
    let pAddress
    let voting
    let token

    describe('Test OceanVoting', () => {
      const [alice] = accounts;

      it('Should deploy proxy of contract', async () => {
          zos = new ZeppelinHelper('OceanVoting')
          await zos.pushContract(accounts[9])
          await zos.createContract(accounts[0], false)
          pAddress = zos.getProxyAddress('OceanVoting')
          voting = await OceanVoting.at(pAddress)
      })

      it('Should mint initial Ocean tokens', async () => {
          pAddress = zos.getProxyAddress('OceanToken')
          token = await OceanToken.at(pAddress)
          await token.mintInitialSupply(accounts[0])
          let balance = await token.balanceOf(accounts[0])
          console.log("user [0] has Ocean token balance :=", balance / scale)
          await token.approve(voting.address, balance, { from: accounts[0] });
      })

      it('should reveal a vote for a poll', async () => {
          const options = utils.defaultOptions();
          options.actor = alice;

          const pollID = await utils.startPollAndCommitVote(options, voting);

          await utils.increaseTime(new BN(options.commitPeriod, 10).add(new BN('1', 10)).toNumber(10));
          await utils.as(options.actor, voting.revealVote, pollID, options.vote, options.salt);

          const votesFor = await utils.getVotesFor(pollID, voting);
          const errMsg = 'votesFor should be equal to numTokens';
          assert.strictEqual(options.numTokens, votesFor.toString(10), errMsg);
    });




    }) // end of describe
})
