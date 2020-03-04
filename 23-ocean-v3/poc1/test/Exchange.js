const BigNumber = require('bn.js');

const Factory = artifacts.require("UniswapFactory");
const Exchange = artifacts.require("UniswapExchange");
const OCEAN = artifacts.require("OCEAN");
const XYZ = artifacts.require("XYZ");

web3.eth.getAccounts().then(function(acc){ accounts = acc })

contract("UniswapFactory", () => {

  it("...should create exchange", async () => {
    const exchange = await Exchange.deployed();
    const factory = await Factory.deployed();
    const ocean = await OCEAN.deployed();

    await factory.initializeFactory(exchange.address);
    await factory.createExchange(ocean.address);
    
    const token = await factory.getTokenWithId(1);
    assert.equal(token, ocean.address, "err, exchange");

  });

  it("...should create second exchange and add liquidity", async () => {
    const factory = await Factory.deployed();

    const xyz = await XYZ.deployed();
    const ocean = await OCEAN.deployed();

    await factory.createExchange(xyz.address);

    const token = await factory.getTokenWithId(2);
    assert.equal(token, xyz.address, "err, exchange");
    
    const oceanExchangeAddress = await factory.getExchange(ocean.address);  
    const xyzExchangeAddress = await factory.getExchange(xyz.address);  
    const oceanExchange = await Exchange.at(oceanExchangeAddress);
    const xyzExchange = await Exchange.at(xyzExchangeAddress);

    let block = await web3.eth.getBlock();
    const ethValue = new BigNumber(50);
    const ethValue2 = new BigNumber(30);

    await ocean.approve(oceanExchangeAddress, 17000000000000);
    await oceanExchange.addLiquidity(10, 17000000000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue, "ether")});
    await xyz.approve(xyzExchangeAddress, 23000000000000);
    await xyzExchange.addLiquidity(10, 23000000000000, block.timestamp+100000, {value:web3.utils.toWei(ethValue2, "ether")});
  });

  it("... swap tokens", async () => {
    const factory = await Factory.deployed();

    const xyz = await XYZ.deployed();
    const ocean = await OCEAN.deployed();

    const oceanExchangeAddress = await factory.getExchange(ocean.address);  
    const xyzExchangeAddress = await factory.getExchange(xyz.address);  
    const oceanExchange = await Exchange.at(oceanExchangeAddress);
    const xyzExchange = await Exchange.at(xyzExchangeAddress);

    let eth = await web3.utils.toWei(new BigNumber(2), "ether");
    // let minEth = await web3.utils.toWei(new BigNumber(0.000000000001), "ether");
    let block = await web3.eth.getBlock();
    let accounts = await web3.eth.getAccounts();

    //swap eth to xyz
    xyzExchange.ethToTokenSwapInput(1, block.timestamp + 1000000, {value:eth, from: accounts[1]});
    let xyzBalance = await xyz.balanceOf(accounts[1]);
    assert(xyzBalance.toNumber()>0);
    
    //swap eth to ocean
    oceanExchange.ethToTokenSwapInput(1, block.timestamp + 1000000, {value:eth, from: accounts[1]});
    let oceanBalance = await ocean.balanceOf(accounts[1]);
    assert(oceanBalance.toNumber()>0);
  });
});
