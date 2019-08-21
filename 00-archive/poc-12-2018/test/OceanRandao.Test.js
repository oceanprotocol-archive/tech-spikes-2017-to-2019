/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')
const OceanRandao = artifacts.require('OceanRandao')

global.artifacts = artifacts
global.web3 = web3
let zos
const scale = 1e18

async function assertRevert(promise) {
    try {
        await promise
        assert.fail('Expected revert not received')
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0
        assert(revertFound, `Expected "revert", got ${error} instead`)
    }
}

// NOTE: remove all modifier in OceanRandao contract to avoid timeLineCheck failure
// testing below assume there is NO timeline checks; everything happens back to back.
contract('OceanRandao', (accounts) => {
    let pAddress
    let randao
    let token
    let deposit = 10 * scale
    let campaignID
    let secret0
    let secret1

    describe('Test OceanRandao', () => {
      it('Should deploy proxy of contract', async () => {
          zos = new ZeppelinHelper('OceanRandao')
          await zos.pushContract(accounts[9])
          await zos.createContract(accounts[0], false)
          pAddress = zos.getProxyAddress('OceanRandao')
          randao = await OceanRandao.at(pAddress)
      })

      it('Should mint initial Ocean tokens', async () => {
          pAddress = zos.getProxyAddress('OceanToken')
          token = await OceanToken.at(pAddress)
          await token.mintInitialSupply(accounts[0])
          let balance = await token.balanceOf(accounts[0])
          console.log("user [0] has Ocean token balance :=", balance / scale)
          await token.transfer(accounts[1], 100 * scale)
          balance = await token.balanceOf(accounts[1])
          console.log("user [1] has Ocean token balance :=", balance / scale)
      })


      it('Should create a campaign', async () => {
          let currentBlock = await web3.eth.getBlockNumber();
          let bnum = currentBlock + 20;
          await token.approve(randao.address, 100 * scale, { from: accounts[0]} );
          await randao.newCampaign(bnum, deposit, 12, 6, {from: accounts[0]})
          campaignID = await randao.numCampaigns()
      })

      it('Should join a campaign', async () => {
          await token.approve(randao.address, 100 * scale, { from: accounts[1]} );
          randao.follow(campaignID -1, { from: accounts[1]})
      })

      it('Should commit secret', async () => {
          secret0 = '135'
          console.log('user[0] secret to be committed is: ', secret0)
          commitmentHash = await randao.shaCommit(secret0.toString(10), {from: accounts[0]});
          console.log('commitmentHash of user[0] secret := ', commitmentHash);

          await randao.commit(campaignID - 1, commitmentHash, { from: accounts[0]})
          console.log('user[0] commit success')

          secret1 = '11';
          console.log('user[1] secret to be committed is: ', secret1)
          let commitmentHash = await randao.shaCommit(secret1.toString(10), {from: accounts[1]});
          console.log('commitmentHash of user[1] secret := ', commitmentHash);
          //Timecop.ff(9);

          await randao.commit(campaignID - 1, commitmentHash, { from: accounts[1]})
          console.log('user[1] commit success')
          // Timecop.ff(5);
      })

      it('Should reveal secret', async () => {
          await randao.reveal(campaignID - 1, secret0.toString(10), {from: accounts[0]});
          console.log('user[0] reveal success')

          await randao.reveal(campaignID - 1, secret1.toString(10), {from: accounts[1]});
          console.log('user[1] reveal success')
      })

      it('Should print random number', async () => {
          // Timecop.ff(5);
          await randao.getRandom(campaignID - 1, {from: accounts[1]});
          // print random number through call function:  c.random ^= p.secret;
          let random = await randao.queryRandom(campaignID - 1, {from: accounts[1]});
          console.log('random := ', random.toString());
      })

      it('Should claim token reward', async () => {
          // get money reward
          await randao.getMyBounty(campaignID -1, { from: accounts[1] });
      })

    }) // end of describe
})
