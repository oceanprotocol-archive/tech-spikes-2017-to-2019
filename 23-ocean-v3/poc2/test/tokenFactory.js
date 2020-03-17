const DataTokenFactory = artifacts.require("DataTokenFactory");

contract('DataTokenFactory', (accounts) => {
  it('.. create minimal token factory', async () => {
    const dataTokenFactory = await DataTokenFactory.deployed();
    let minimalToken = await dataTokenFactory.createMinimalToken("test", "TEST", "metadata.test");

    let event = await dataTokenFactory.getPastEvents('TokenCreated', { fromBlock: 0, toBlock: 'latest'});
    let tokenAddress = event[0].returnValues[1];

    assert(tokenAddress != "0x0000000000000000000000000000000000000000");
  });
});
