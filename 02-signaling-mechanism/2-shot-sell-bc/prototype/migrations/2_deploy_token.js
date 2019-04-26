/* global artifacts */
const Token = artifacts.require('Token.sol')

const token = async (deployer, network) => {
    await deployer.deploy(Token)
}

module.exports = token
