[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

#   Interplanetary File System (IPFS) investigation

```
name: research on IPFS
type: research
status: initial draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 10/06/2019
```


## 1. Introduction

Ocean allows providers to upload dataset into IPFS and publish in Ocean marketplace. As such, IPFS provides a distributed & permanent storage and enables easy access to the published dataset, which can be downloaded on the demand. 

In the meantime, it is critical to incentivize providers who serve the public dataset in Ocean. To this purpose, Ocean needs to track the providers of the public dataset and distribute network rewards to those providers. 

We investigate the IPFS and resolve some related issues for Ocean network. 

## 2. Location addressing vs. Content addressing

* **Location addressing**

At this time we access data over the Internet via a link or url, which specifies the content by its **location**. Such as: `http://192.168.10.20/images/cat.jpg` 

In this model, each data (i.e., image, html file, spreadsheet, dataset or tweet...) has its own address that identifies its location in the web, served from a particular server over a particular port at a particular location. 

When these data is requested, the browser asks DNS to resolve the domain name into IP address and initiates a connection to that IP address over a specific port. Once the request arrives at the web server, it process the request and check the permission before it returns the data via the HTTP connection.

As such, it is clear that the data is controlled by the owner of the location.

<img src="img/internet.png" />


* **Content addressing**

The alternative approach is to identify data by its **content** rather than its location, which is the fundamental idea behind IPFS. 

In the world of IPFS, each data is identified by its cryptographic hash or `CID (Content IDentifier)`, which is a alphanumeric string calculated by running data through a hash function (`Digest`) and further encoded with `base58` method. This `CID` serves as a content-addressed identifier that is cryptographically unique in the global IPFS system. 

<img src="img/1_CsNzyMTjpZGUOqV7NAT-mg.png" />

`> ipfs object get QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ`

Note that all hashes begin with “**Qm**”. This is because the hash is in actuality a **multihash**, meaning that the hash itself specifies the **hash function (i.e., SHA256) and length of the hash (i.e., 32 bytes)** in the first two bytes of the multihash.

As such, users can request data from IPFS network with the exact `CID`, therefore, the network will find the nodes that store the data, retrieve and verify the data. Literally, users can access data efficiently from its peer that has the data they want at different locations. 

<img src="img/IPFS-addressing-process-flow.png" />

Some benefits of content addressing:

1. content-addressing links are permanent pointing to exactly that data;
2. allow peers to store data together and share the responsibility;
3. cryptographical hash guarantees the data integration;
4. data can be distributed to multiple peers for high availability.


## 3. IPFS Distributed HashTable (DHT) API

The complete IPFS CLI commands can be found in the [API page](https://docs.ipfs.io/reference/api/cli/). Here, we focus on the [DHT API](https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/DHT.md) that can be very helpful to Ocean use case.

### 3.1 find providers of a specific data in IPFS

The most urgently sought functionality is to track providers of a specific data in the IPFS network, which can be fulfilled by below command:

* `ipfs dht findprovs <multihash>`: Retrieve the providers for content that is addressed by an multihash.

	It accepts the hash of a specific data in IPFS and interact with the DHT to output a list of newline-delimited provider Peer IDs.
	
	`options`: an optional object with the following properties
	- **timeout** - a maximum timeout in milliseconds
	- **maxNumProviders** - a maximum number of providers to find

	Here is an [example](https://github.com/ipfs/interface-js-ipfs-core/blob/master/src/dht/find-provs.js) that use this API to retrieve the list in a testing.

### 3.2 serve a specific data in IPFS

The other important functionality is to serve a specific data and announce to the network that you are providing the data. As such, the network can route the accessing request correctly.

* `ipfs dht provide <multihash>`: Announce to the network that you are providing a specific data.

	It accepts the multihash of a specific data in IPFS and add the routing information into the DHT. To successfully announce it, provider must have the data in their local where IPFS node is running. Otherwise, the command will error out with `block not found locally`.
	
	The [example](https://github.com/ipfs/interface-js-ipfs-core/blob/master/src/dht/provide.js) test case can be helpful.

### 3.3 request data from a specific peer

Unfortuantely, IPFS does not support this option at this time. When request a data from IPFS, it will automatically retrieve data blocks from neighboring peers for fast delivery. Here, the blocks of the same file could be download from different peers at various locations.

Since IPFS is a **content-addressing** network, users can request `which data` they need without knowing `where those data locate`. So, they do not need to know which peer have the data but only request the data from IPFS using the multihash as the key.

### 3.4 find out who serve the data request

* `ipfs bitswap ledger <peer>`: Show the current ledger for a peer.

	it accepts a peer identifier and display if any data blocks had been pulled from the peer. **This command only shows the stats between provider and downloader**. As such, Brizo can download data from IPFS peers and get information about its providers.
	
	Some [extended features](https://github.com/ipfs/go-bitswap/issues/186) are requested for IPFS bitswap protocol.

	1. `$ ipfs get <multihash>` to download data from peers;
	2. `$ ipfs dht findprovs <multihash>` to get list of providers
	3. `$ ipfs bitswap ledger <peer>` to find out the amount of blocks download from this peer. For example:
	
	```
	$ ipfs bitswap ledger QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3
	Ledger for QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3
	Debt ratio: 0.000000
	Exchanges:  11
	Bytes sent: 0
	Bytes received: 2883738
	```

### 3.5 Experiment

* Initialize a IPFS node and create a new peer ID: `QmSDACfhmkn53kq6NCciQswu3oJV3gbrY25KDh1gh15vcW`

```
$ ipfs init
initializing IPFS node at /Users/fancy/.ipfs
generating 2048-bit RSA keypair...done
peer identity: QmSDACfhmkn53kq6NCciQswu3oJV3gbrY25KDh1gh15vcW
to get started, enter:

	ipfs cat /ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme
```

* Verify the IPFS node work properly:

```
$ ipfs cat /ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme
Hello and Welcome to IPFS!

██╗██████╗ ███████╗███████╗
██║██╔══██╗██╔════╝██╔════╝
██║██████╔╝█████╗  ███████╗
██║██╔═══╝ ██╔══╝  ╚════██║
██║██║     ██║     ███████║
╚═╝╚═╝     ╚═╝     ╚══════╝

If you're seeing this, you have successfully installed
IPFS and are now interfacing with the ipfs merkledag!

 -------------------------------------------------------
| Warning:                                              |
|   This is alpha software. Use at your own discretion! |
|   Much is missing or lacking polish. There are bugs.  |
|   Not yet secure. Read the security notes for more.   |
 -------------------------------------------------------

Check out some of the other files in this directory:

  ./about
  ./help
  ./quick-start     <-- usage examples
  ./readme          <-- this file
  ./security-notes
```

* Upload a file into IPFS

```
$ ipfs add truffle-config.js 
added QmbcYU2qnXtc8Wowgqo7NygFvnuWVw9EBr6DkvBRiJAQZi truffle-config.js
 354 B / 354 B [=================================================================] 100.00%
```

* launch the IPFS daemon to run online mode in order to call DHT API

```
$ ipfs daemon
Initializing daemon...
go-ipfs version: 0.4.22-
Repo version: 7
System version: amd64/darwin
Golang version: go1.12.7
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/192.168.86.111/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
Swarm listening on /p2p-circuit
Swarm announcing /ip4/127.0.0.1/tcp/4001
Swarm announcing /ip4/192.168.86.111/tcp/4001
Swarm announcing /ip6/::1/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
WebUI: http://127.0.0.1:5001/webui
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready
```

* find providers of a specific data using DHT API

We can query the provider list of the data that was uploaded to IPFS just now.

```
$ ipfs dht findprovs QmbcYU2qnXtc8Wowgqo7NygFvnuWVw9EBr6DkvBRiJAQZi
QmSDACfhmkn53kq6NCciQswu3oJV3gbrY25KDh1gh15vcW
```

1.  `QmbcYU2qnXtc8Wowgqo7NygFvnuWVw9EBr6DkvBRiJAQZi` is the multihash of the file `truffle-config.js` that I just added to IPFS. 

2. the output provider `QmSDACfhmkn53kq6NCciQswu3oJV3gbrY25KDh1gh15vcW` is local IPFS node since it is the only node that serves the data. 

* Similarly, we can query provider list of other dataset that includes many providers. For example:

```
$ ipfs dht findprovs QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u
QmTGfEbUM1xz5Po6sVNj2KcMP6HjmrivRB9PLE13GxFZFG
QmQVricDKJeFWFvvyD3E7WwwRBkum54jmjdj5yv3NpdqAs
QmQayCUCyEMpg2tgs9PKCHgaAYs4rYbYSWEAPmqSeFciBj
QmW4m2XzAmSb7GsXMk1FKjyUkPvYQHmj1EyPxWbZWv9paY
```

## 4. Outstanding Issues

### 4.1 Where IPFS Peer ID comes from?

When provider initialize a new IPFS node, a new key pairs will be automatically generated using [RSA cryptographical algorithm](https://en.wikipedia.org/wiki/RSA_(cryptosystem)). The `public key` can be shared to verify the signature and `private key` can be used to decrypt the message. 

The workflow that generates the key pairs is shown as below. Note that the **peer's ID is a cryptographic SHA-256 multihash of its [protobuf-encoded](https://developers.google.com/protocol-buffers/) public key**, which is unique in the IPFS network and enables peers to find each other and facilitate the authentication.

<img src="img/ipfs_node_id.jpg" />

### 4.2 Potential Free-Riding Attack

From the above description, it is obvious that IPFS identity is different from the wallet account in Ethereum. Therefore, Ocean cannot directly distribute reward tokens to the IPFS nodes that serve a specific dataset. 

To receive the reward tokens, **IPFS nodes must register themselves with Ocean and provide an Ethereum wallet** since they are dealing with two different networks. 

The registration information shall include:

* **Ethereum wallet address**: the wallet can hold the Ocean tokens;
* **IPFS identity ID**: the unique peer ID in the IPFS network, which can be used to verify that the node is serving a particular dataset.

In this scenario, one potential **free-riding attack** is following: 

* the attacker may use `ipfs dht findprovs <cid>` to get the provider list of a particular dataset;
* if the dataset is popular and many people download it, Ocean is more likely to distribute network rewards to the providers of this dataset;
* attacker may search for the provider peer ID of this dataset, which is not registered with Ocean yet;
* attacker claims himself as the provider in IPFS network and register with Ocean using his own Ethereum wallet along with other person's peer ID in IPFS;
* as such, the attacker do not need to serve the dataset but receive the network rewards from Ocean network for free.

**solution**: require the provider in IPFS network to submit a signature when registering the Ethereum wallet with Ocean network. The signature can be a customized message signed by the private key. As such, Ocean network can validate his identity by decrypting the message with the public key and verifying the signature.

<img src="img/risk.jpg" />

## 5. Integration with Ocean

* **registration**:
	* IPFS peers who serve the data must register their Ethereum wallets with Ocean keeper, so network rewards can be distributed to their wallets;
	* IPFS peers must prove their identity to Ocean:
		* sign message using private key and pass the signature along with public key to Ocean;
		* Ocean will verify the signature and validate their IPFS peer identity by hashing their public keys;
* **access data**:
	* consumer come into Ocean data marketplace to request public data;
	* a service agreement is fulfilled and Brizo download the requested dataset from IPFS peers;
	* Brizo delivers the dataset to consumer;
* **distribute rewards**:
	* every period of time, Ocean will distribute reward tokens to providers of public data that had been downloaded in the same time period;
	* Ocean will pull out the provider list of download dataset from IPFS;
		* data integration and availability is guaranteed by IPFS network;
	* Ocean randomly choose one provider from the candidate list and distribute available network reward to him;
		* Ocean can request provider to put in Ocean tokens as the stake inside Ocean network in order to receive the reward tokens;
		* as such, the actual amount of network rewards is calculated by formula considering the staking amount.

 