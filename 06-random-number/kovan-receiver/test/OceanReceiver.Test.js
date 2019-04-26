"use strict";

const Web3 = require('web3')

// const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0'))
const web3 = new Web3(new Web3.providers.HttpProvider('https://nile.dev-ocean.com'))

const h = require("chainlink-test-helpers");
const scale = 1e18;

function wait(ms) {
    const start = new Date().getTime()
    let end = start
    while (end < start + ms) {
        end = new Date().getTime()
    }
}

contract("OceanReceiver", (accounts) => {
  const OceanReceiver = artifacts.require("OceanReceiver.sol");
  const defaultAccount =0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c;
  let ocean;

  beforeEach(async () => {
    ocean = await OceanReceiver.at("0x46e81953D09Ba4D670cF73304DAD8808E8cd03a7");
  });

  describe("should receive data from Chainlink callback", () => {
    let request;

    it("check result from the Chainlink", async () => {
      let data = 0
      let timer = 0
      while(data == 0){
        wait(1000)
        timer = timer + 1
        console.log("waiting for " + timer + " second")
        data = await ocean.getRequestResult()
        if(data != 0) {
          console.log("Request is fulfilled. data := " + data)
        }
      }

    });
  });
});
