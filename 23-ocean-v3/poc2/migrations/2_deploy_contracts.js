const Template = artifacts.require("DataToken");
const DataTokenFactory = artifacts.require("DataTokenFactory");

module.exports = function(deployer) {

  deployer.then(async () => {
		await deployer.deploy(Template);
  		await deployer.deploy(DataTokenFactory, Template.address);
  });

};
