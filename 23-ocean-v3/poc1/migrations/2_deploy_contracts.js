const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

const BigNumber = require('bn.js');

var UniswapExchange = artifacts.require("UniswapExchange");
var UniswapFactory = artifacts.require("UniswapFactory");
var Factory = artifacts.require("OceanFactory");
var Market = artifacts.require("OceanMarket");
var OceanToken = artifacts.require("OceanToken");
var X20ONE = artifacts.require("X20ONE");
var X20TWO = artifacts.require("X20TWO");


module.exports = function(deployer) {

  deployer.deploy(UniswapExchange);
  deployer.deploy(X20ONE, web3.utils.fromAscii("X20ONE"), web3.utils.fromAscii("X20ONE"));
  deployer.deploy(X20TWO, web3.utils.fromAscii("X20TWO"), web3.utils.fromAscii("X20TWO"));
  web3.eth.getAccounts()
  			.then((accounts) => deployer.deploy(OceanToken, accounts[1], {from:accounts[2]}))
 			.then(() =>  deployer.deploy(UniswapFactory))
  	 		.then(() =>  deployer.deploy(Market, UniswapFactory.address, OceanToken.address))
  	 		.then(() =>  deployer.deploy(Factory, Market.address, OceanToken.address, UniswapFactory.address));
};
