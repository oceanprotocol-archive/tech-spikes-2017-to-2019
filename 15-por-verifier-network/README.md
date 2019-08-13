[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

#  Verifier Network Design

```
name: research on verifier network for Proof of Retrieveability
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 07/02/2019
```

# 1. Introduction

More information about PoR can be found in [report](../03-data-availability/web2-compact-por/README.md). In this research, we investigate the design of verifier network, which generates challenges and verifies the proofs from the storage in a decentralized way.

In each design of the verifier network, there are some critical modules in the below:

* **selection of verifiers**: there are a verifier pool, which may include POA authority nodes or registered entities. 
* **consensus mechanism**: the way that verifiers reach an agreement or conclude a verification task.
* **incentive mechanism**: when verifier pool is open to the public and any node can join, it is important to have a proper incentive mechanism in place to reward or punish participants.

We will investigate different designs from these three perspectives and compare their pros & cons in the below. They are sorted by the implementation difficulty from low to high.

# 2. Design 

## 2.1 All-hands POA Authorities

The most straightforward design is to have POA authority nodes in Ocean network to be verifiers. The identity of node operator is known to us. 

* **Selection**: all POA authority nodes are required to participate in the verification task. Each node can generate his own challenge, send it to the storage and verify the proof on its own. 

* **Consensus**:
	* since the number of authority nodes is limited, it is possible to *request all of them to agree* on the verification result; it fails to conclude if there is any single verifier cannot verify the challenge. 
	* alternatively, a *M-out-of-N signature* can be used to reach an agreement: 
		* *fixed number of required signature*: it may require fixed number of signatures from the selected verifiers no matter the total number of participated verifiers;
		* *fixed percentage of requried signature*: it may require a certain percentage of selected verifiers to submit signatures in order to verify data availability. For example, >50% signature is a typical scenario.

* **Incentive**: it is not needed to give rewards to POA authority nodes since they are known and trustworthy entities.

* **Pro**:
	* simple to implement and manage;

* **Con**:
	* limited scalability as each verifier needs to be a POA node;

## 2.2 Variant: Randomly Selected POA Authorities

Based on above design, we can further introduce randomness to the verification game. 

* **Selection**: for each verification task, a few POA authority nodes will be randomly selected from the pool to serve as the verifiers, therefore, making it difficult to predict the verifiers for a specific task.

Other apsects includinng Consensus, Incentive are the same as previous design.

* **Pro**:
	* simple to manage verifiers;
	* random selection makes it difficult to predict verifiers and prevents potential attacks;

* **Con**:
	* limited scalability as each verifier needs to be a POA node;
	* it requires a reliable way to generate random numbers (i.e., Chainlink can be used to import random numbers into smart contract)



## 2.3 Open Verifier Network

To achieve a better decentralization, an open verifier network is demanded, where any node can participate in the verifier pool and receive reward for its own contribution.

* **Selection**: any node can register itself with on-chain smart contract and put in tokens as a stake to join the verifier pool. For each verification task, a few verifiers will be randomly selected from the pool. 

* **Consensus**:
	* since the selected nodes are not reliable and may fail to accomplish the task, it is difficult to request all signatures from them to verify the data availability.
	* instead, a *M-out-of-N signature* is more suitable for this design. It can have two options:
		* *fixed number of required signature*: it may require fixed number of signatures from the selected verifiers no matter the total number of participated verifiers;
		* *fixed percentage of requried signature*: it may require a certain percentage of selected verifiers to submit signatures in order to verify data availability. For example, >50% signature is a typical scenario.

* **Incentive**: 
	* *Participation Incentive*: the selected node that fails to finish the task will be given lower probability to be selected in the future or removed from the verifier pool for a period of time;
	* *Verification Incentive*: verifiers who submit **correct** signature will be given rewards as the incentive; otherwise, their stake will be slashed.

* **Pro**:
	* more open and decentralized approach to the public;
	* it has great scalability as any node can participate the verification;
	* there is no way to predict the verifier identity for each verification task, therefore, reducing the chance of attack from the storage.

* **Con**:
	* it has the risk that the malicious nodes manipulate the consnensus result. 
	* In particular, "fixed number of required signature" approach is easier to be gamed as only limited number of singatures are required.  
	* "fixed percentage of required signature" can have the risk of sybil attack but the cost of such attack is high due to staking requirement.

## 2.4 Challenge-Response Approach

A much more lightweight approach is challenge respose design:

* **Selection**: any node can register itself with on-chain smart contract and put in tokens as a stake to join the verifier pool. Each verifier in the pool can generate challenge and verify the proof on its own.

* **Consensus**:
	* verifiers in the pool continuously challenge the storage for data availability, where the target storage and dataset is randomly chosen;
	* when the verifier cannot prove the data availability, it will raise a challenge against the storage for a specific dataset. The challenge will initiate a verification task that more verifiers are involved;
	* depends on the verification result, the challenger will receive reward or get their stake slashed;
	* if there is no challenge, Ocean assumes the availability of dataset is proved.

* **Incentive**: 
	* challenger who successfully challenge the faulty storage will be given rewards as the incentive; otherwise, their stake will be slashed.		

# 3. POC

After research meeting, we agree to move forward to implement a POC, which is a simplest and working solution. In particular, we will prototype the all-hands POA node approach with majority-win consensus. To make it more fun, we try to use Rust to interact with smart contract.

## 3.1 Architecture

* **Keeper Contract**: 
	* register POA node and manage permission;
	* register dataset and maintain DID registry;
	* dispatch por verification task (i.e., emit event message to POA nodes);
	* submit signature to resolve challenge for a specific dataset;
	* query the status of dataset and their challenges;
* **Verifier Node**:
	* use Rust code to interact with Keeper contract;
	* listen to the event message from Keeper contract and accept task;
	* generate proof for requested dataset;
	* verify the proof from the storage;
	* submit own signature to Keeper contract to confirm the data availability;
* **Storage**:
	* use Rust code to gennerate proof according to challenges;

<img src="img/arch2.jpg" width=800 />

## 3.2 Smart Contract using Solidity

First, the smart contract is built to maintain the registry of verifier and challenge:

```Solidity
pragma solidity 0.5.3;

contract Verifier {
    struct Challenge{
        uint256 nPos;
        uint256 nNeg;
        uint256 quorum;
        bool    result;
        bool    finish;
        mapping(address => bool) votes;
    }

    uint256 nVoters;
    mapping(address => bool) public registry;
    mapping(uint256 => Challenge) public challenges;

    // events
    event verifierAdded(address _verifier, bool _state);
    event verifierRemoved(address _verifier, bool _state);
    event verificationRequested(uint256 _did);
    event verificationFinished(uint256 _did, bool _state);
    
    ...
    
    // manage verifier registration
    function addVerifier(address user) public {
        require(user != address(0), 'address is invalid');
        if(registry[user] == true) return;
        // if not registered yet
        registry[user] = true;
         nVoters = nVoters + 1;
        emit verifierAdded(user, true);
    }
    
    ...
    // quest por verification
    function requestPOR(uint256 did) public {
        // // if challenge of the same did exists AND it is not finished yet, do not allow new challenge
        if(challenges[did].quorum != 0 && challenges[did].finish != true) return;
        // create new challenge for the did
        challenges[did] = Challenge({
            nPos: 0,
            nNeg: 0,
            quorum: 50,
            result: false,
            finish: false
        });
        emit verificationRequested(did);
    }
    ...
    function resolveChallenge(uint256 did) public {
        if(challenges[did].nPos + challenges[did].nNeg == nVoters && !challenges[did].finish ) {
                challenges[did].finish = true;
                uint256 cur = challenges[did].nPos * 100;
                uint256 target = nVoters * challenges[did].quorum;
                if( cur >= target){
                    challenges[did].result = true;
                    emit verificationFinished(did, true);
                } else {
                    challenges[did].result = false;
                    emit verificationFinished(did, false);
                }
        }
    }
	...
```

We use the local testnet to run the testing:

<img src="img/compile.jpg" width=700/>

In the same time, we need to generate ABI file that is needed in Rust code:

```
$ solc -o build --bin --abi contracts/*.sol --overwrite
```
It creates two files: `Verifier.abi` and `Verifier.bin` under the `build` directory.


## 3.3 Rust Coding

### 3.3.1 Interact with Smart Contract 

* **setup network and web3**

```Rust
let (_eloop, transport) = web3::transports::Http::new("http://localhost:8545").unwrap();
let web3 = web3::Web3::new(transport);
```

* **create contract interface using address and ABI**

Note: the contract address should not include prefix of "0x"!

```Rust
let contract_address: Address = "916f91fe8a60012bad9b7264680afd008ed4cfc9".parse().unwrap();
    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        include_bytes!("../truffle/build/Verifier.abi"),
    )
    .unwrap();

    println!("Contract deployed to: 0x{}", contract.address()); 
```

* **send transaction to smart contract**

```Rust
contract.call("addVerifier", (my_account,), my_account, Options::default());
println!("add := {} as a verifier", my_account);
```

* **query the state of smart conntract**

```Rust
let result = contract.query("queryVerifier", (my_account,), None, Options::default(), None);
let status: bool = result.wait().unwrap();
println!("updated status := {}", status);
```

The local testnet needs to be launched in order to run the test. Use `cargo run` in the workspace to run the test:

<img src="img/test1.jpg" />

### 3.3.2 Subscribe to Event Message

* **create event loop to monitor events**

```Rust
let mut eloop = tokio_core::reactor::Core::new().unwrap();
let web3 = web3::Web3::new(web3::transports::Http::with_event_loop("http://localhost:8545", &eloop.handle(), 1).unwrap());
```

* **create eloop futures**

```Rust
eloop.run(web3.eth().accounts().then(|accounts| {
	...
	event_future.join(call_future)

    })).unwrap();    
```

* **define parameters of event filter**

the event signature is needed. For example, the event has signature (i.e., hash value) generated as:

```
> keccak('Pregnant(address,uint256,uint256,uint256)')
241ea03ca20251805084d27d4440371c34a0b85ff108f6bb5611248f73818b80

> keccak('Transfer(address,address,uint256)')
ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

It can be generated from online site: [Keccak256 online](https://emn178.github.io/online-tools/keccak_256.html)

Similarly, the hash string should not have prefix of "0x"!

In this step, the contract address and specificed event signature are defined so Rust code can listen to.

```Rust
let filter = FilterBuilder::default()
            .address(vec![contract.address()])
            .topics(
                Some(vec![
                    "dfe43d96a5e6e1b03e2e6d96aca2d45267ccc5929508587683bb45bddfae3bde" // verificationRequested event signature
                    .parse()
                    .unwrap(),
                ]),
                None,
                None,
                None,
            )
            .build();
        println!("filer has been defined");
```

* **build event filter**

It creates an event filter based on the definition in last step and sets the duration of monitoring.

```Rust
let event_future = web3
            .eth_filter()
            .create_logs_filter(filter)
            .then(|filter| {
                filter.unwrap().stream(time::Duration::from_secs(0)).for_each(|log| {
                    println!("got log: {:?}", log);
                    Ok(())
                })
            })
            .map_err(|_| ());
        println!("event_future has been built");
```


* **send transaction to trigger the event log**


```Rust
let call_future = contract.call("requestPOR", (2,), accounts[0], Options::default()).then(|tx| {
            println!("got tx: {:?}", tx);
            Ok(())
        });
        println!("call_future send tx");
```

<img src="img/msg.jpg" width=700/>

## 3.4 JS POC

The POC using Javascript is located in `js-poc` folder. It has following structure:

* **client**: the frontend code using React
* **server**: the api server as backend using express
* **truffle**: the smart contract deployed on blockchain using Solidity

### 3.4.1 Instruction

### Install Packages

```
$ cd server
$ npm install

$ cd ../client/por
$ npm install
```

### Migrate Contract

```
$ ganache-cli 

$ cd truffle
$ truffle migrate --network <network>
```

### Launch API Server

change config file: `server/config/index.js` including contract_address, abi and boolean `runGo` (it switches off the go-lang function)

```
const config = {
    // ethereum settings
    provider: 'http://localhost:8545',
    contract_address: '0x511c6De67C4d0c3B6eb0AF693B226209E45e025A',
    abi: [{"constant":true,"inputs":..."name":"verificationFinished","type":"event"}],

    // por settings
    runGo: false,
    goPath: "/usr/local/bin",
    filePath: "/Users/fancy/go/por/por.go",
}

module.exports = config
```

Launch the api server as:

```
$ node server/api.server.js
api.server listening on port  8000
```

### Launch Client 

change config file: `client/por/src/config/config.js` includes the contract address and api server url.

```
const config = {
    apiUrl: "http://localhost:8000",
    contract_address: "0x2345d5788C876878a020a57526f1D1C9c6f753B6"
  };
  
  export default config;
```

Launch the client page with: `npm start` and it opens the frontend page at `http://localhost:3000/`


### 3.4.2 Demo

### Step 1: register as verifier

User needs to provide his own account address and private key to send tx to blockchain. The wallet must be well funded.

<img src="img/step1.jpg" width=500 />

### Step 2: request por verification

In this step, user request por verification against dataset with id = 20

<img src="img/step2.jpg" width=500/>

### Step 3: verifier run por and submit signature

At this moment, the challenge against dataset is not resolved yet, therefore, it shows `False` as status.

<img src="img/step3.jpg" width=500/>

### Step 4: resolve a challenge

Click the button to resolve a challenge, where smart contract evaluates the received signatures and close challenge as requested.

<img src="img/step4.jpg" width=500/>

### Step 5: check status of challenge

It query the state of smart contarct in blockchain to find out the status of resolved challenge.

<img src="img/step5.jpg" width=500/>

### Step 6: finish

After the `check status` transaction finish, the status of challenge is updated in the webpage. It is `success` indicating the challenge is resolved and por proves to be true.

<img src="img/step6.jpg" width=500/>

### API calls history

```
[nodemon] starting `node server/api.server.js`
api.server listening on port  8000
add a new verifier
POST /api/v1/verifier 200 128.593 ms - 29
request a por verification
POST /api/v1/request 200 51.589 ms - 29
cd /usr/local/bin
./go run /Users/fancy/go/por/por.go
exit
bash-3.2$ cd /usr/local/bin
bash-3.2$ ./go run /Users/fancy/go/por/por.go
Generating RSA keys...
Generated!
2019-08-07 15:08:43.929549 -0700 PDT m=+0.015428014
Signing file /Users/fancy/go/por/data.txt

Signed!
Signing time is: 19.07447ms
Generating challenge...
Generated!
Generating challenge time is: 133.637µs
Issuing proof...
Issued!
Issuing proof time is: 251.018µs
Verifying proof...
Result: true!
Verifying proof time is: 874.06µs
Total time is: 20.336573ms
submit signature as por is successful
exit
exit
bash-3.2$ exit
exit
POST /api/v1/submit 200 697.646 ms - 29
resolve a challenge
POST /api/v1/resolve 200 39.783 ms - 29
query status of a challenge
POST /api/v1/check 200 30.026 ms - 109
```