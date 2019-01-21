/* global artifacts */
const OceanToken = artifacts.require('OceanToken.sol')

const oceanToken = async (deployer, network) => {
    await deployer.deploy(OceanToken)
}

module.exports = oceanToken
