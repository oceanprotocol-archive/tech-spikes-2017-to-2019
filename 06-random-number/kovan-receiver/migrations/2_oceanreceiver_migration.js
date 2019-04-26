var oceanReceiver = artifacts.require("OceanReceiver");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(oceanReceiver, {from: accounts[0]});
};
