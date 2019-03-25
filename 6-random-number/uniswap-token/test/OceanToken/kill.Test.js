/* eslint-env mocha */
/* global artifacts, contract, describe, it, beforeEach */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const OceanToken = artifacts.require('OceanToken')

contract('OceanToken', (accounts) => {
    let oceanToken

    const owner = accounts[1]
    const someone = accounts[2]

    beforeEach('initialize token before each test', async () => {
        oceanToken = await OceanToken.new(owner)
    })

    describe('kill', () => {
        it('Should be killable from owner', async () => {
            await oceanToken.kill({ from: owner })
        })

        it('Should fail to kill from someone', async () => {
            await assert.isRejected(
                oceanToken.kill({ from: someone })
            )
        })
    })
})
