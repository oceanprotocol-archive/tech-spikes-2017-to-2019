const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

const BigNumber = require('bn.js');

var UniswapExchange = artifacts.require("UniswapExchange");
var UniswapFactory = artifacts.require("UniswapFactory");
var Factory = artifacts.require("OceanFactory");
var Market = artifacts.require("OceanMarket");
var OceanToken = artifacts.require("OceanToken");
var OceanProxy = artifacts.require("OceanProxy");
var X20ONE = artifacts.require("X20ONE");
var X20TWO = artifacts.require("X20TWO");
var DataToken = artifacts.require("DataToken");

module.exports = function(deployer) {

    deployer.then(async () => {
    	let accounts = await web3.eth.getAccounts();

        await deployer.deploy(UniswapExchange);
    	await deployer.deploy(UniswapFactory);
        await deployer.deploy(DataToken);
        await deployer.deploy(OceanProxy);
		await deployer.deploy(OceanToken, accounts[1]);
        await deployer.deploy(X20ONE, web3.utils.fromAscii("X20ONE"), web3.utils.fromAscii("X20ONE"));
		await deployer.deploy(X20TWO, web3.utils.fromAscii("X20TWO"), web3.utils.fromAscii("X20TWO"));
    	await deployer.deploy(Market, UniswapFactory.address, OceanToken.address);
    	await deployer.deploy(Factory, Market.address, OceanToken.address, OceanProxy.address, UniswapFactory.address);
    });

};

