/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it, beforeEach */
const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken

    const minter = accounts[1]
    const spender = accounts[2]
    const someone = accounts[3]
    const someoneElse = accounts[4]

    describe('transferFrom', () => {
        beforeEach('mint tokens before each test', async () => {
            oceanToken = await OceanToken.new(minter)
            // mint 1000 tokens to spender
            await oceanToken.mint(spender, 1000, { from: minter })
        })

        it('Should transfer', async () => {
            // arrange
            // send someone 100 tokens from spender
            await oceanToken.approve(someone, 100, { from: spender })

            // act
            await oceanToken.transferFrom(spender, someoneElse, 100, { from: someone })

            // assert
            const balance = await oceanToken.balanceOf(someoneElse)
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // arrange
            await oceanToken.approve(someone, 100, { from: spender })

            // act-assert
            try {
                await oceanToken.transferFrom(spender, 0x0, 100, { from: someone })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
