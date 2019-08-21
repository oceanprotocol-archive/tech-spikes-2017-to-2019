/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')
const OceanVoting = artifacts.require('OceanVoting')
const OceanRegistry = artifacts.require('OceanRegistry')

const ethers = require('ethers')
const BN = require('bignumber.js');

global.artifacts = artifacts
global.web3 = web3
let zos
const scale = 1e18

function mineBlock(resolve) {
    provider.send('evm_mine', [])
        .then(() => { resolve() })
}

function increaseTimestamp(increase) {
    return new Promise((resolve, reject) => {
        provider.send('evm_increaseTime', [increase])
            .then(() => { mineBlock(resolve) })
    })
}

// NOTE: remove all modifier in OceanRandao contract to avoid timeLineCheck failure
// testing below assume there is NO timeline checks; everything happens back to back.
contract('OceanRegistry', (accounts) => {
    let pAddress
    let voting
    let token
    let registry

    describe('Test OceanRegistry', () => {

      it('Should deploy proxy of contract', async () => {
          zos = new ZeppelinHelper('OceanRegistry')
          await zos.pushContract(accounts[9])
          await zos.createContract(accounts[0], false)
          pAddress = zos.getProxyAddress('OceanRegistry')
          registry = await OceanRegistry.at(pAddress)
      })

      it('Should mint initial Ocean tokens', async () => {
          pAddress = zos.getProxyAddress('OceanToken')
          token = await OceanToken.at(pAddress)
          await token.mintInitialSupply(accounts[0])
          let balance = await token.balanceOf(accounts[0])
          console.log("user [0] has Ocean token balance :=", balance / scale)
      })

      it('Should get Ocean voting proxy instance', async () => {
          pAddress = zos.getProxyAddress('OceanVoting')
          voting = await OceanVoting.at(pAddress)
      })

      it('Should apply and challenge a listing', async () => {
          let minDeposit = 100 * scale
          let listing = '0x7ace91f25e0838f9ed7ae259670bdf4156b3d82a76db72092f1baf06f31f5038'
          await token.approve(registry.address, new BN(minDeposit), { from: accounts[0] });
          await registry.apply(listing, minDeposit, '',  { from: accounts[0] })
          console.log('applicant submits an application of listing')

          // Challenge and get back the pollID
          await token.transfer(accounts[1], new BN(1000 * scale), { from: accounts[0] });
          await token.approve(registry.address, new BN(1000 * scale), { from: accounts[1] });
          let receipt = await registry.challenge(listing, '',  { from: accounts[1] })
          const pollID = receipt.logs[0].args.challengeID
          console.log('create challenge with pollID:=', pollID.toNumber())
      })

  })
})
