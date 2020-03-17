const DataTokenFactory = artifacts.require("DataTokenFactory");

contract('DataTokenFactory', (accounts) => {
  it('.. create minimal token factory', async () => {
    const dataTokenFactory = await DataTokenFactory.deployed();
    let minimalToken = await dataTokenFactory.createMinimalToken("test", "TEST", "metadata.test");
  });

});
