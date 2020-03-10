const UniswapExchange = artifacts.require("UniswapExchange");
const UniswapFactory = artifacts.require("UniswapFactory");
const OceanMarket = artifacts.require("OceanMarket");
const OceanFactory = artifacts.require("OceanFactory");
const OceanToken = artifacts.require("OceanToken");
const X20ONE = artifacts.require("X20ONE");
const X20TWO = artifacts.require("X20TWO");
const DataToken = artifacts.require("DataToken");

const truffleAssert = require('truffle-assertions');
const BigNumber = require('bn.js');

contract("OceanMarket", () => {

    let uniswapExchange;
    let uniswapFactory;
    let oceanMarket;
    let oceanFactory;
    let oceanToken;
    let x20oneToken;
    let x20oneExchangeAddress; 
    let x20oneExchange;
    let block;
    let accounts;
    let ethValue;
    let dataToken;

  beforeEach('innit contracts for each test', async function () {
    uniswapExchange = await UniswapExchange.deployed();
    uniswapFactory = await UniswapFactory.deployed();   
    oceanMarket = await OceanMarket.deployed();
    oceanFactory = await OceanFactory.deployed();
    oceanToken = await  OceanToken.deployed();
    x20oneToken = await X20ONE.deployed();
    x20twoToken = await X20TWO.deployed();
    dataToken = await DataToken.deployed();
    accounts = await web3.eth.getAccounts();
  })

  it("...should create x20one exchange", async () => {
    // create Uniswap exchange
    await uniswapFactory.initializeFactory(uniswapExchange.address);
    truffleAssert.passes(uniswapFactory.createExchange(x20oneToken.address));
  });

  it("...should create x20one market and get it's address", async () => {
    // create Ocean market
    await truffleAssert.passes(oceanFactory.createMarket(x20oneToken.address));

    let x20oneMarket = await oceanFactory.getMarket(x20oneToken.address);
    assert(x20oneMarket != "0x0000000000000000000000000000000000000000");  
  });

  it("...should not create x20one market", async () => {
    await truffleAssert.reverts(oceanFactory.createMarket(x20oneToken.address), "market already exists.");
  });

  it("...should add liquidity to x20one exchange", async () => {
    
    ethValue = new BigNumber(10);
    block = await web3.eth.getBlock();

    x20oneExchangeAddress = await uniswapFactory.getExchange(x20oneToken.address); 
    x20oneExchange = await UniswapExchange.at(x20oneExchangeAddress);

    await x20oneToken.approve(x20oneExchangeAddress, 23000000000000);
    await x20oneExchange.addLiquidity(10, 100000000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue, "ether")});
  });

  it("...should create ocean exchange and add liquidity", async () => {

    truffleAssert.passes(uniswapFactory.createExchange(oceanToken.address));
    
    oceanToken.mint(accounts[1], 23000000000000, {from: accounts[1]});    

    oceanExchangeAddress = await uniswapFactory.getExchange(oceanToken.address); 
    oceanExchange = await UniswapExchange.at(oceanExchangeAddress);

    await oceanToken.approve(oceanExchangeAddress, 23000000000000, {from: accounts[1]});
    await oceanExchange.addLiquidity(10, 100000000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue, "ether"), from: accounts[1]});
   });

   it("...should lockAndMint", async () => {

    let x20oneMarketAddress = await oceanFactory.getMarket(x20oneToken.address);
    const x20oneMarket = await OceanMarket.at(x20oneMarketAddress);     

    await x20oneToken.transfer(accounts[2], 500000000);
    // approve ERC20 token spending for Uniswap exchage 
    await x20oneToken.approve(x20oneExchange.address, 23000000000000, {from: accounts[2]});
    // approve ERC20 token spending for Ocean market
    await x20oneToken.approve(x20oneMarket.address, 23000000000000, {from: accounts[2]});
    // approve ERC721 for Ocean market
    await dataToken.setApprovalForAll(x20oneMarket.address, true, {from: accounts[2]});
    // escrow ERC20 and mint ERC721
    await truffleAssert.passes(x20oneMarket.lockAndMint(500000000, "metadata", {from: accounts[2]}));     

    let dataTokenBalance = await dataToken.balanceOf(accounts[2]);
    assert(dataTokenBalance.toNumber() == 1);
   });

   it("...should withdrawAndBurn", async () => {

    let x20oneMarketAddress = await oceanFactory.getMarket(x20oneToken.address);
    const x20oneMarket = await OceanMarket.at(x20oneMarketAddress);       

    let event = await dataToken.getPastEvents('Minted', { fromBlock: 0, toBlock: 'latest'});
    let tokenId = await event[0].returnValues[1];

    //generate signature from token minter account
    let hash = await dataToken.getHash(tokenId, 500000000, "metadata", {from: accounts[2]});
    signature = await web3.eth.sign(hash, accounts[2]);
    // check the signature, burn ERC721 token, withdraw ERC20 
    await truffleAssert.passes(await x20oneMarket.withdrawAndBurn(tokenId, accounts[1], 500000000, "metadata", signature, {from: accounts[4]}));     

    let dataTokenBalance = await dataToken.balanceOf(accounts[2]);
    assert(dataTokenBalance.toNumber() == 0);

    });

   it("...should swap x20 tokean to ocean and withdraw to proxy", async () => {

    let x20oneMarketAddress = await oceanFactory.getMarket(x20oneToken.address);
    const x20oneMarket = await OceanMarket.at(x20oneMarketAddress);     
    // withdraw fees to Ocean proxy  
    await truffleAssert.passes(await x20oneMarket.swapToOcean());     
    });
});