/* global artifacts */
const Token = artifacts.require('Token.sol')
const BondingCurve = artifacts.require('BondingCurve.sol')
const Broker = artifacts.require('Broker.sol')

const broker = async (deployer, network) => {
    const tokenAddress = Token.address
    const bcAddress = BondingCurve.address

    await deployer.deploy(
        Broker,
        tokenAddress,
        bcAddress
    )
}

module.exports = broker
