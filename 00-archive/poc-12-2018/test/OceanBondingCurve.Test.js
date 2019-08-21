/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const ZeppelinHelper = require('./ZeppelinHelper.js')

const OceanToken = artifacts.require('OceanToken')
const ERC20Token = artifacts.require('ERC20')
const OceanBondingCurve = artifacts.require('OceanBondingCurve')

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

contract('OceanBondingCurve', (accounts) => {
    let pAddress
    let bondingCurve
    let token
    let did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
    let gasPrice = 22000000000;

    describe('Test OceanBondingCurve', () => {
      it('Should deploy proxy of contract', async () => {
          zos = new ZeppelinHelper('OceanBondingCurve')
          await zos.pushContract(accounts[9])
          await zos.createContract(accounts[0], false)
          pAddress = zos.getProxyAddress('OceanBondingCurve')
          bondingCurve = await OceanBondingCurve.at(pAddress)
          // set gasPrice for buy/sell
          await bondingCurve.setGasPrice(gasPrice, { from: accounts[0]})
      })

      it('Should mint initial Ocean tokens', async () => {
          pAddress = zos.getProxyAddress('OceanToken')
          token = await OceanToken.at(pAddress)
          await token.mintInitialSupply(accounts[0])
          let balance = await token.balanceOf(accounts[0])
          console.log("user Ocean token balance :=", balance / scale)
      })

      it('Should create new bonding curve', async () => {
          let name = 'BondingToken'
          let symbol = 'BT'
          await bondingCurve.createBondingCurve(did, name, symbol)
          let balance = await bondingCurve.getTokenBalance(did, bondingCurve.address);
          console.log("initial token balance :=", balance / scale)
          assert.equal(balance / scale, 10, 'initial balance should be 10')
      })

      it('Should buy bonded tokens by sending ocean tokens', async () => {
          // approve withdraw of Ocean tokens from user's wallet
          let amount = 10 * scale
          await token.approve(bondingCurve.address, amount, { from: accounts[0]} );
          await bondingCurve.buy(did, amount)
          balance = await bondingCurve.getTokenBalance(did, accounts[0]);
          console.log("bonded token balance :=", balance / scale)
          console.log('user[0] buy bonded tokens at effective price :=' +  amount / balance + ' Ocean token per bonded token')
      })

      it('Should sell bonded tokens to withdraw ocean tokens', async () => {
          let initbalance = await token.balanceOf(accounts[0])
          let amount = 10 * scale
          let address = await bondingCurve.getTokenAddress(did)
          let erc20token = await ERC20Token.at(address)
          await erc20token.approve(bondingCurve.address, amount, { from: accounts[0]} );
          await bondingCurve.sell(did, amount)
          let balance = await bondingCurve.getTokenBalance(did, accounts[0]);
          console.log("bonded token balance :=", balance / scale)
          let finalbalance = await token.balanceOf(accounts[0])
          console.log('user[0] sell bonded tokens at effective price :=' +  (finalbalance - initbalance) / amount + ' Ocean token per bonded token')
      })


    })


})
