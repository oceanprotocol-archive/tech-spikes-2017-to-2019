/* global artifacts */
const Token = artifacts.require('Token.sol')
const BondingCurve = artifacts.require('BondingCurve.sol')

const bondingCurve = async (deployer, network) => {
    const tokenAddress = Token.address

    await deployer.deploy(
        BondingCurve,
        tokenAddress
    )
}

module.exports = bondingCurve
