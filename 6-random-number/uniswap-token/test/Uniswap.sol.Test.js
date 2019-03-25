"use strict";

// javascript:  transact with deployed token contract

let fs = require("fs");
const Web3 = require('web3')
const BN = require('bignumber.js')

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/Kuo1lxDBsFtMnaw6GiN2'))

const scale = 1e18;

const cap = BN('100')
const decimals = 18
const amount = cap.multipliedBy(BN(10 ** decimals))

contract("OceanToken", (accounts) => {
  const OceanToken = artifacts.require("OceanToken");
  const owner = '0x0E364EB0Ad6EB5a4fC30FC3D2C2aE8EBe75F245c';
  const recipent = '0xf9e6BFc60Bb6Ae652671Bb7B9b8A65A289Bd113E';
  let uniswap, ocean;

  beforeEach(async () => {
    ocean = await OceanToken.at("0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A");
  });


  describe("should transfer tokens", () => {
    it("initial balance", async () => {
      await ocean.transfer(recipent, amount, {from : owner})
      let initBalance = await ocean.balanceOf(recipent)
      console.log("owner has :=" + initBalance / scale + " Ocean tokens")
    });
  });

});
