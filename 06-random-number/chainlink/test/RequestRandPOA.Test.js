"use strict";

const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0'))

const h = require("chainlink-test-helpers");
const scale = 1e18;

contract("OceanRequester", (accounts) => {
  const LinkToken = artifacts.require("LinkToken.sol");
  const OceanRequester = artifacts.require("OceanRequester.sol");
  const defaultAccount =0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c;
  const LINK_FEE = web3.utils.toHex(1*10**18)
  const LB = web3.utils.toHex(100)
  const UB = web3.utils.toHex(1000)
  let link, ocean;

  beforeEach(async () => {
    link = await LinkToken.at("0x01BE23585060835E02B77ef475b0Cc51aA1e0709");
    ocean = await OceanRequester.at("0xCD2d163F2a2F48d3aF604F746983c54111CCBda5");
  });

  describe("should request data and receive callback", () => {
    let request;

    it("transfer 1 LINK token to Ocean requester contract if there is no any", async () => {
      let balance = await link.balanceOf(ocean.address)
      if (balance == 0) {
        await link.transfer(ocean.address, LINK_FEE)
      }
    });


    it("LINK balance", async () => {
      let initBalance = await link.balanceOf(ocean.address)
      console.log("Ocean contract has :=" + initBalance / scale + " LINK tokens")
    });

    it("create a request and send to Chainlink", async () => {
      let tx = await ocean.getRandom(LB, UB, '0x46e81953D09Ba4D670cF73304DAD8808E8cd03a7', '0xde947c85');
      request = h.decodeRunRequest(tx.receipt.rawLogs[3]);
      console.log("request has been sent. request id :=" + request.id)
    });
  });
});
