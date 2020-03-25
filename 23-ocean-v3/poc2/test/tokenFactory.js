const BigNumber = require('bn.js');

const DataTokenFactory = artifacts.require("DataTokenFactory");
const DataToken = artifacts.require("DataToken");

contract('DataTokenFactory', (accounts) => {
  it('..should create minimal token', async () => {
    const dataTokenFactory = await DataTokenFactory.deployed();
    let minimalToken = await dataTokenFactory.createToken("test", "TEST", "metadata.test");

    let event = await dataTokenFactory.getPastEvents('TokenCreated', { fromBlock: 0, toBlock: 'latest'});
    let tokenAddress = event[0].returnValues[1];

    assert(tokenAddress != "0x0000000000000000000000000000000000000000");
  });

  it('..should create minimal token and mint it', async () => {
    let accounts = await web3.eth.getAccounts();

    const dataTokenFactory = await DataTokenFactory.deployed();
    let minimalToken = await dataTokenFactory.createToken("test", "TEST", "metadata.test");

    let event = await dataTokenFactory.getPastEvents('TokenCreated', { fromBlock: 0, toBlock: 'latest'});
    let tokenId = event[0].returnValues[0];
    let tokenAddress = event[0].returnValues[1];

    let ethValue = new BigNumber(10000000);

    // await console.log(await web3.eth.getBalance(accounts[0]));

    let token = await DataToken.at(tokenAddress);

    await dataTokenFactory.mintTo(tokenId, accounts[2], {value:web3.utils.toWei(ethValue, "gwei")});

	// let feeEvent = await token.getPastEvents('DeductedFee', { fromBlock: 0, toBlock: 'latest'});

	// await console.log(await feeEvent[0].returnValues[2]);	
	// await console.log(await feeEvent[0]);
    // await console.log(await web3.eth.getBalance(accounts[0]));
  });

});
