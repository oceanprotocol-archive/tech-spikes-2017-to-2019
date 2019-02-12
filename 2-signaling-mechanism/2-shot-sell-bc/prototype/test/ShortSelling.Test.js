/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */

const Token = artifacts.require('Token')
const ERC20Token = artifacts.require('ERC20')
const BondingCurve = artifacts.require('BondingCurve')
const Broker = artifacts.require('Broker.sol')

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

contract('BondingCurve', (accounts) => {
    let bondingCurve
    let token
    let broker
    let balance
    let erc20token

    describe('Test Broker', () => {
      it('Should mint initial tokens', async () => {
          token = await Token.deployed()
          balance = await token.balanceOf(accounts[0])
          console.log("user token balance :=", balance / scale)
      })

      it('Should buy bonded tokens by sending tokens', async () => {
          bondingCurve = await BondingCurve.deployed()
          // approve withdraw of tokens from user's wallet
          let amount = web3.utils.toBN(10 * 10 ** 18)
          await token.approve(bondingCurve.address, web3.utils.toBN(balance), { from: accounts[0]} );
          await bondingCurve.buy(amount, { from: accounts[0]})

          amount = web3.utils.toBN(500 * 10 ** 18)
          await token.transfer(accounts[2], amount, { from: accounts[0]} )
          await token.approve(bondingCurve.address, web3.utils.toBN(balance), { from: accounts[2]} );
          amount = web3.utils.toBN(10 * 10 ** 18)
          await bondingCurve.buy(amount, { from: accounts[2]})
          balance = await token.balanceOf(accounts[2])
          console.log("user[2] reserved token balance :=", balance / scale)

          balance = await bondingCurve.getTokenBalance(accounts[0]);
          console.log("bonded token balance :=", balance / scale)
          let price = await bondingCurve.getPrice( { from: accounts[0]});
          console.log('current price :=' +  price / scale + ' Ocean token per bonded token')
          let finalbalance = await token.balanceOf(accounts[0])
          console.log('user[0] has reserved token balance :=' +  (finalbalance ) / scale + ' Ocean token')
      })

      it('Should send to Broker for lending', async () => {
          broker = await Broker.deployed()
          let address = await bondingCurve.getTokenAddress()
          erc20token = await ERC20Token.at(address)
          balance = await erc20token.balanceOf(accounts[0])
          await erc20token.approve(broker.address, web3.utils.toBN(balance), { from: accounts[0]} );
          await broker.lenderSendTokens(balance)
          let erc20broker = await erc20token.balanceOf(broker.address)
          console.log("broker contract has bonded token balance :=", erc20broker / scale)
      })

      it('Should borrow bonded tokens from Broker contract', async () => {
          let amount = web3.utils.toBN(100 * 10 ** 18)
          await token.transfer(accounts[1], amount, { from: accounts[0]} )
          balance = await token.balanceOf(accounts[1])
          console.log("user[1] has reserved token balance :=", balance / scale)
          await token.approve(broker.address, web3.utils.toBN(balance), { from: accounts[1]} );

          balance = await token.balanceOf(broker.address)
          console.log("before: broker reserved token balance :=", balance / scale)
          // amount of collateral deposit
          amount = web3.utils.toBN(50 * 10 ** 18)
          await broker.shortSellTokens(accounts[0], amount, { from: accounts[1]})

          let status = await broker.getStatus()
          console.log("short position status :=", status)
          //let sale = await erc20token.balanceOf(bondingCurve.address)
          let sale = await broker.getReservedToken({ from: accounts[1]})
          console.log("user[1] short sale returns reserved token balance :=", sale / scale)

          let tp = await broker.getTP({ from: accounts[1]})
          console.log("user[1] short sale thresholdPrice :=", tp / 1 )

          balance = await token.balanceOf(broker.address)
          console.log("after: broker reserved token balance :=", balance / scale)

          let price = await bondingCurve.getPrice( { from: accounts[0]});
          console.log('current price :=' +  price / scale + ' Ocean token per bonded token')

          amount = web3.utils.toBN(2 * 10 ** 18)
          await token.approve(bondingCurve.address, web3.utils.toBN(balance), { from: accounts[0]} );
          await bondingCurve.buy(amount, { from: accounts[0]})

      })

      it('Should cover short position by Broker contract', async () => {
          let bal1 = await broker.getReservedToken({ from: accounts[1]})
          console.log("user[1] has reserved token balance in Broker contract :=", bal1 / scale)

          let price = await bondingCurve.getPrice( { from: accounts[0]});
          console.log('current price :=' +  price / scale + ' Ocean token per bonded token')

          let amount = web3.utils.toBN(6 * 10 ** 18)

          let res = await broker.queryVar({ from: accounts[0]})
          console.log("cost:=", res / scale)

          await broker.buyTokens(amount, { from: accounts[0]})

          let status = await broker.getStatus()
          console.log("short position status :=", status)

          balance = await token.balanceOf(broker.address)
          console.log("after: broker reserved token balance :=", balance / scale)

          let bal2 = await broker.getReservedToken({ from: accounts[1]})
          console.log("user[1] has reserved token balance in Broker contract :=", bal2 / scale)
      })




/*
      it('Should sell bonded tokens to withdraw tokens', async () => {
          let initbalance = await token.balanceOf(accounts[0])
          let amount = web3.utils.toBN(10 * 10 ** 18)
          let address = await bondingCurve.getTokenAddress()
          let erc20token = await ERC20Token.at(address)
          await erc20token.approve(bondingCurve.address, amount, { from: accounts[0]} );
          await bondingCurve.sell(amount)
          let balance = await bondingCurve.getTokenBalance(accounts[0]);
          console.log("bonded token balance :=", balance / scale)
          let finalbalance = await token.balanceOf(accounts[0])
          console.log('user[0] sell 10 bonded tokens at effective price :=' +  (finalbalance - initbalance) / amount + ' Ocean token per bonded token')
      })
*/

    })


})
