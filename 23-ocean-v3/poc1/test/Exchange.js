const BigNumber = require('bn.js');

const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");
const OceanToken = artifacts.require("OceanToken");
const X20ONE = artifacts.require("X20ONE");
const X20TWO = artifacts.require("X20TWO");

contract("UniswapFactory", () => {

    let uniswapExchange;
    let uniswapFactory;
    let x20twoToken;
    let x20oneToken;
    let x20oneExchangeAddress; 
    let x20twoExchangeAddress;   
    let x20oneExchange;
    let x20twoExchange;  
    let block;
    let accounts;



  beforeEach('innit contracts for each test', async function () {
    uniswapExchange = await UniswapExchange.deployed();
    uniswapFactory = await UniswapFactory.deployed();   
    oceanToken = await  OceanToken.deployed();
    x20oneToken = await X20ONE.deployed();
    x20twoToken = await X20TWO.deployed();
    accounts = await web3.eth.getAccounts();
  })

  it("...should create exchange", async () => {

    await uniswapFactory.initializeFactory(uniswapExchange.address);
    await uniswapFactory.createExchange(x20twoToken.address);
    
    const token = await uniswapFactory.getTokenWithId(1);
    assert.equal(token, x20twoToken.address, "err, exchange");

  });

  it("...should create second exchange and add liquidity", async () => {

    await uniswapFactory.createExchange(x20oneToken.address);

    const token = await uniswapFactory.getTokenWithId(2);
    assert.equal(token, x20oneToken.address, "err, exchange");
    
    x20twoExchangeAddress = await uniswapFactory.getExchange(x20twoToken.address);  
    x20oneExchangeAddress = await uniswapFactory.getExchange(x20oneToken.address);  
    x20twoExchange = await UniswapExchange.at(x20twoExchangeAddress);
    x20oneExchange = await UniswapExchange.at(x20oneExchangeAddress);

    let block = await web3.eth.getBlock();
    const ethValue = new BigNumber(50);
    const ethValue2 = new BigNumber(30);

    await x20twoToken.approve(x20twoExchangeAddress, 1700000000);
    await x20twoExchange.addLiquidity(10, 1700000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue, "ether")});
    await x20oneToken.approve(x20oneExchangeAddress, 230000000);
    await x20oneExchange.addLiquidity(10, 230000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue2, "ether")});
  });

  it("... swap tokens", async () => {

    let eth = await web3.utils.toWei(new BigNumber(2), "ether");
    let block = await web3.eth.getBlock();

    x20twoToken.transfer(accounts[1], 5000000);
    
    await x20twoToken.approve(x20twoExchangeAddress, 1700000000, {from: accounts[1]});
    await x20twoExchange.tokenToTokenSwapInput(5000000, 1, 1, block.timestamp+100000, x20oneToken.address, {from: accounts[1]});
  });

  it("... swap tokens to the third address", async () => {

    let eth = await web3.utils.toWei(new BigNumber(2), "ether");
    let block = await web3.eth.getBlock();

    x20twoToken.transfer(accounts[1], 5000000);
    
    await x20twoToken.approve(x20twoExchangeAddress, 1700000000, {from: accounts[1]});
    await x20twoExchange.tokenToTokenTransferInput(5000000, 1, 1, block.timestamp+100000, accounts[2], x20oneToken.address, {from: accounts[1]});
  });


});
