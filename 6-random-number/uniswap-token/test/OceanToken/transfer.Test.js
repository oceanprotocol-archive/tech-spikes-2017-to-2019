/* eslint-env mocha */
/* global artifacts, assert, contract, describe, it, beforeEach */
const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken

    const minter = accounts[1]
    const spender = accounts[2]
    const someone = accounts[3]

    describe('transfer', () => {
        beforeEach('mint tokens before each test', async () => {
            oceanToken = await OceanToken.new(minter)
            await oceanToken.mint(spender, 1000, { from: minter })
        })

        it('Should transfer', async () => {
            // act
            await oceanToken.transfer(someone, 100, { from: spender })

            // assert
            const balance = await oceanToken.balanceOf(someone)
            assert.strictEqual(balance.toNumber(), 100)
        })

        it('Should not transfer to empty address', async () => {
            // act-assert
            try {
                await oceanToken.transfer(0x0, 100, { from: spender })
            } catch (e) {
                assert.strictEqual(e.reason, 'invalid address')
                return
            }
            assert.fail('Expected revert not received')
        })
    })
})
