/* globals artifacts */
const OceanToken = artifacts.require('OceanToken')

// dummy owner, replace with real wallet/owner
const owner = '0xf9e6BFc60Bb6Ae652671Bb7B9b8A65A289Bd113E'

module.exports = function(deployer) {
    deployer.deploy(OceanToken)
}
