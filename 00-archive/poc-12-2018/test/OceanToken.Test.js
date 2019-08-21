/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')

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

contract('OceanToken', (accounts) => {
    let pAddress
    let token

    before('deploy contracts and create proxy before all tests', async function() {
        zos = new ZeppelinHelper('OceanToken')
        await zos.pushContract(accounts[9])
        await zos.createContract(accounts[0], false)
        pAddress = zos.getProxyAddress('OceanToken')
        token = await OceanToken.at(pAddress)
        await token.mintInitialSupply(accounts[0])
    })

    describe('Test OceanToken', () => {

      it('Should be able to call method', async () => {
        let balance = await token.balanceOf(accounts[0])
        console.log("owner balance :=", balance / scale)
        assert.equal(balance / scale, 560000000, 'receiver should have 560000000 tokens initially')
      })

      it('Should mint new tokens ', async () => {
        for (i = 0; i < 100; i++) {
          // mint tokens
          let minted = false
          let receipt = await token.mintTokens({ from: accounts[0] })
          if(receipt.logs.length == 2){
            minted = receipt.logs[1].args._status
          }
          // query reward token balance
          // let balance = await token.balanceOf(reward.address)
          let balance = await token.balanceOf(accounts[0])
          let blocknumber = await web3.eth.getBlockNumber()
          if( i == 0 || minted == true) {
            console.log(`block ${blocknumber} := ${balance / scale } Ocean tokens minted.`)
          }
          if(balance / scale  == 1400000000) { break; }
        }
      })

    })
})
