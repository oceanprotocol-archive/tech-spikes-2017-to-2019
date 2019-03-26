[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

#  Research Uniswap-Chainlink Integration

```
name: research on integration of Uniswap-Chainlink for RNG.
type: research
status: initial draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 03/21/2019
```

* [1. Introduction](#1-introduction)
* [2. Uniswap](#2-uniswap)
	+ [2.1 deploy Ocean token contract to Rinkeby testnet](#21-deploy-ocean-token-contract-to-rinkeby-testnet)
	+ [2.2 create exchange for OCEAN](#22-create-exchange-for-ocean)
	+ [2.3 add initial liquidity for LINK tokens](#23-add-initial-liquidity-for-link-tokens)
	+ [2.4 exchange OCEAN for LINK tokens](#24-exchange-ocean-for-link-tokens)
* [3. Chainlink](#3-chainlink)
	+ [3.1 Request from online Quantum Random Number Generator](#31-request-from-online-quantum-random-number-generator)
	+ [3.2 Deploy the requester contract](#32-deploy-the-requester-contract)
	+ [3.3 Request random numbers](#33-request-random-numbers)
* [License](#license)

## 1. Introduction

Previous research has investigated the [Uniswap](../4-uniswap/README.md) and [Chainlink](../3-data-availability/web-3.0-chainlink/README.md) separately. In this research, we aim to combine Uniswap and Chainlink to import off-chain random numbers to Ocean smart contract. 

In particular:

* **Uniswap**: exchange OCEAN tokens for LINK tokens;
* **Chainlink**: accept LINK tokens from Ocean to fulfill its requests.

It demonstrates a closed loop of workflow including both components. This helps Ocean to resolve the request to access external information sources.

Note: all POC work is done on **Rinkeby testnet** for demo purpose using Node.js v8.11.1 and Truffle v5.0.3.

The folder structure is following:

folder name | description |
---| ---|
uniswap-token | scripts to add OCEAN<>LINK pair |
chainlink | scripts to fulfill request with Chainlink |
img | image files for README.md |

## 2. Uniswap

We need to exchange OCEAN tokens with LINK tokens. 

The workflow of token-to-token swap is shown as below:

* Ocean exchange contract withdraw OCEAN tokens from user's wallet;
* the exchange converts OCEAN tokens into ETH;
* ETH is sent to Chainlink exchange contract for purchase;
* ETH is converted into LINK tokens;
* LINK tokens are sent to user's wallet.

<img src="img/swap_mechanism.jpg" />


### 2.1 deploy Ocean token contract to Rinkeby testnet

First we need to deploy the [OCEAN token contract](uniswap-token/contracts/OceanToken.sol) as:

```
$ truffle migrate --network rinkeby
...
10_ocean_token.js
=================

   Replacing 'OceanToken'
   ----------------------
   > transaction hash:    0x07beaeb6979a8beda0544af0dd499ea260a8f72b411a9f9d12ec40dda5c8225c
   > Blocks: 1            Seconds: 24
   > contract address:    0x56F598cF576d923d7723781cB90BfBF41d81089f
   > account:             0x0E364EB0Ad6EB5a4fC30FC3D2C2aE8EBe75F245c
   > balance:             2.20082358
   > gas used:            1214459
   > gas price:           10 gwei
   > value sent:          0 ETH
   > total cost:          0.01214459 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01214459 ETH
```

Note: LINK token for Chainlink has been deployed to Rinkeby at `0x01BE23585060835E02B77ef475b0Cc51aA1e0709`

### 2.2 create exchange for OCEAN

1. Use script `uniswap-token/script/1.create.ocean.exchange.js` to create an exchange contract for Ocean token. The tx log on [Etherscan](https://rinkeby.etherscan.io/tx/0xd86e743f00574308e3a360c1b11d9b1cf6048dbd6add0cceddc926ec8b5c04f0)

	<img src="img/create_ocean_exchange.jpg" width=1000 />

2. Use script `uniswap-token/script/2.get.ocean.exchange.address.js` to retreive the exchange contract address for OCEAN token:

	```
	$ node script/2.get.ocean.exchange.address.js
	the exchange address for Ocean token is:0xaFD52EF3Cb0eE6673cA5EbE0A25686313fF0C283
	```

3. Use script `uniswap-token/script/3.get.link.exchange.address.js` to retreive the exchange contract address for LINK token at `0x01BE23585060835E02B77ef475b0Cc51aA1e0709`:

	```
	$ node script/3.get.link.exchange.address.js
	the exchange address for LINK token is:0x094AeF967D361E2aE3Af472718e231DC9134724F
	```

### 2.3 add initial liquidity for Ocean tokens

Before we can deposit initial tokens to the Ocean exchange contract, we need to first approve the exchange contract to withdraw OCEAN tokens from the sender's wallet. Use the script `uniswap-token/script/4.approve.ocean.deposit.js` for this purpose:

<img src="img/approve_withdraw.jpg" width=1000 />

After, we can use `uniswap-token/script/5.add.ocean.exchange.liqudity.js` to add initial token liquidity to the exchange contract.

From the Etherscan explorer, it is clear that the Ocean exchange contract has initial balance: 0.1 Ether and 15 Ocean tokens:

<img src="img/deposit.jpg" width=1000 />

### 2.4 exchange OCEAN for LINK tokens

Next, we are ready to swap OCEAN token for LINK tokens through Uniswap exchange. 

In particular, we need to call function `tokenToTokenTransferOutput`, which convert input tokens to output tokens and transfer to receiver address. 

Use the script `uniswap-token/script/6.convert.ocean2link.js` to perform the swap:

<img src="img/swap.jpg" width=1000 />

Clearly, 0.0015 OCEAN tokens are transferred out to the exchange to receive 10 LINK tokens.

The same balance can be verified in Metamask wallet:

<img src="img/balance_metamask.jpg" />

## 3. Chainlink 

Now, we have LINK tokens in our wallet and are ready to send request to Chainlink network.

As a specified application, we use Chainlink to request a random number from the off-chain data source such as [random.org](https://www.random.org/clients/http/) or [online Quantum Random Number Generator](https://qrng.anu.edu.au/API/api-demo.php).

Moreover, Chainlink has setup an adapter for Random.org at [randomorg-chainlink-testnet](https://docs.chain.link/docs/randomorg-chainlink-testnet). Here, we will leverage this adapter to access off-chain random numbers:

**Rinkeby**

* **LINK token address**: 0x01BE23585060835E02B77ef475b0Cc51aA1e0709
* **Oracle address**: 0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e
* **JobID**: 75e0a756bbcc48678c498802a7c5929b

<img src="img/uniswap_chainlink.jpg" />

### 3.1 Request from online Quantum Random Number Generator

Create the Requester Contract

See contract `chainlink/contracts/OceanRequester.sol` for details. The key function is:

```solidity
/*
   * Create a request and send it to default Oracle contract
   */
  function getRandom(
    uint256 _min,
    uint256 _max
  )
    public
    onlyOwner
    returns (bytes32 requestId)
  {
    // create request instance
    Chainlink.Request memory req = newRequest(JOB_ID, this, this.fulfill.selector);
    // fill in the pass-in parameters
    req.addUint("min", _min);
    req.addUint("max", _max);
    // send request & payment to Chainlink oracle (Requester Contract sends the payment)
    requestId = chainlinkRequest(req, ORACLE_PAYMENT);
    // emit event message
    emit requestCreated(msg.sender, JOB_ID, requestId);
  }
```

### 3.2 Deploy the requester contract

```
$ truffle migrate --network rinkeby
...
2_oceanrequester_migration.js
=============================

   Replacing 'OceanRequester'
   --------------------------
   > transaction hash:    0x060c7208a85c7d4786577de3703ffad223a9675d562ab6126beda51ccc3fe1ed
   > Blocks: 0            Seconds: 8
   > contract address:    0x81C8A4BE1bf2491D3c90BdE4615EE4672F13E63b
   > account:             0x0E364EB0Ad6EB5a4fC30FC3D2C2aE8EBe75F245c
   > balance:             1.89272674
   > gas used:            1289807
   > gas price:           10 gwei
   > value sent:          0 ETH
   > total cost:          0.01289807 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01289807 ETH
```

### 3.3 Request random numbers

A Javascript file `chainlink/test/OceanRequester.Test.js` is used to interact with Ocean Requester contract and submit a request to Chainlink network. 

```Javascript
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
    ocean = await OceanRequester.at("0x81C8A4BE1bf2491D3c90BdE4615EE4672F13E63b");
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
      let tx = await ocean.getRandom(LB, UB);
      request = h.decodeRunRequest(tx.receipt.rawLogs[3]);
      console.log("request has been sent. request id :=" + request.id)

      let data = 0
      let timer = 0
      while(data == 0){
        data = await ocean.getRequestResult()
        if(data != 0) {
          console.log("Request is fulfilled. data := " + data)
        }
        wait(1000)
        timer = timer + 1
        console.log("waiting for " + timer + " second")
      }

    });
  });
});
```

The integration testing on Rinkeby takes 1s to fulfill the random number request (i.e., generate a random number between 100 and 1000):

<img src="img/testing.jpg" width=1000 />

## License

```
Copyright 2018 Ocean Protocol Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

