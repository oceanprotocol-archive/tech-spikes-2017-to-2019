const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");
const OceanMarket = artifacts.require("OceanMarket");
const OceanFactory = artifacts.require("OceanFactory");
var OceanToken = artifacts.require("OceanToken");
var X20ONE = artifacts.require("X20ONE");
var X20TWO = artifacts.require("X20TWO");

const truffleAssert = require('truffle-assertions');
const BigNumber = require('bn.js');

contract("OceanMarket", () => {

    let uniswapExchange;
    let uniswapFactory;
    let oceanMarket;
    let oceanFactory;
    let oceanToken;
    let x20oneToken;
    let xyzExchangeAddress; 
    let xyzExchange;
    let block;


  beforeEach('innit contracts for each test', async function () {
    uniswapExchange = await UniswapExchange.deployed();
    uniswapFactory = await UniswapFactory.deployed();   
    oceanMarket = await OceanMarket.deployed();
    oceanFactory = await OceanFactory.deployed();
    oceanToken = await  OceanToken.deployed();
    x20oneToken = await X20ONE.deployed();
    x20twoToken = await X20TWO.deployed();
  })

  it("...should create XYZ exchange", async () => {
    await uniswapFactory.initializeFactory(uniswapExchange.address);
    truffleAssert.passes(uniswapFactory.createExchange(x20oneToken.address));
  });

  it("...should create XYZ market and get it's address", async () => {
    await truffleAssert.passes(oceanFactory.createMarket(x20oneToken.address));

    let xyzMarket = await oceanFactory.getMarket(x20oneToken.address);
    assert(xyzMarket != "0x0000000000000000000000000000000000000000");
      
  });

  it("...should not create XYZ market", async () => {
    await truffleAssert.reverts(oceanFactory.createMarket(x20oneToken.address), "market already exists.");
  });

  it("...should not create XYZ market", async () => {
    await truffleAssert.reverts(oceanFactory.createMarket(x20oneToken.address), "market already exists.");
  });

  it("...should add liquidity to xyz ezchange", async () => {
    
    let ethValue = new BigNumber(10);
    block = await web3.eth.getBlock();

    xyzExchangeAddress = await uniswapFactory.getExchange(x20oneToken.address); 
    xyzExchange = await UniswapExchange.at(xyzExchangeAddress);

    await x20oneToken.approve(xyzExchangeAddress, 23000000000000);
    await xyzExchange.addLiquidity(10, 100000000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue, "ether")});
  });

  it("...should escrow XYZ tokens with fee", async () => {
     let xyzMarketAddress = await oceanFactory.getMarket(x20oneToken.address);
     const xyzMarket = await OceanMarket.at(xyzMarketAddress);     

     await x20oneToken.approve(xyzMarket.address, 23000000000000);

     await truffleAssert.passes(xyzMarket.escrow(20000000));

    });


});
