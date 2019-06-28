/* globals artifacts */
const Signature = artifacts.require('hashSig.sol')

module.exports = function(deployer) {
    deployer.deploy(Signature)
}
