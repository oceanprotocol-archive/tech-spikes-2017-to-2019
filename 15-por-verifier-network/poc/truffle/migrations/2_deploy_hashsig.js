/* globals artifacts */
const Cache = artifacts.require('Verifier.sol')

module.exports = function(deployer) {
    deployer.deploy(Cache)
}
