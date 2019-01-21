/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')
const OceanBondingCurve = artifacts.require('OceanBondingCurve.sol')

const oceanBondingCurve = async (deployer, network) => {
    const tokenAddress = OceanToken.address

    await deployer.deploy(
        OceanBondingCurve,
        tokenAddress
    )
}

module.exports = oceanBondingCurve
