[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# Decentralizing Web2.0 Data Availability Proof (Part 1)

```
name: decentralizing proof of data availability (web 2.0) - Part 1
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 03/04/2019
```

## 1. Introduction

We had investigated the web2.0 data availability proof, which is a centralized solution. In this research, we try to explore an decentralized approach to do so. [research issue](https://github.com/oceanprotocol/ocean/issues/282)

There are many different approaches, such as:

* **POA authority nodes**:
	* each POA node interacts with the storage (i.e., cloud provider such as AWS S3 or Azure) and submit the checksum along with its signature to the smart contract in Ocean network. 
	* signatures from multiple POA nodes should reach a consensus to prove the data availability.
	* Pro:
		* straightforward to implement; 
		* use POA nodes in the network;
		* no need to stake as POA nodes are trusted.
	* Con:
		* need to trust POA nodes and create certain centralization. 
	
	<img src="img/poa.jpg" width=600 />

* **Verifier network**:
	* any node can register as a verifier; all verifier nodes form a verifier network;
	* each verifier node should interact with the storage and submit the checksum along with its signature to the smart contract in Ocean network. 
	* in the same time, each verifier node should put in stake (i.e.,Ocean tokens or Ethers) on their submission.
	* majority of the submissions from verifier nodes determine whether the data availability can be confirmed or not (similar to TCR).
	* smart contract in Ocean network will send rewards to winner party and slash stakes of the other party. 
	* Pro:
		* more decentralized and flexible (anyone  can join the verifier network and serve as a verifier)
		* all verifier nodes can use Ocean tokens as stakes which is more convenient in Ocean network. 
	* Con:
		* build verifier network and handles the staking.
		* need to handle attack vectors such as malicious nodes try to manipulate the result;
	<img src="img/vn.jpg" width=600 />

* leverage the decentralized oracle network, such as Chainlink, Oraclize, etc.
	* Oracle network interact with storage to verify the data availability for Ocean;
	* Ocean only needs to pay Chainlink tokens to the Chainlink network for its service;
	* Pro:
		* leverage the established work such as Chainlink.
		* more flexible and decentralized approach due to Oracle network.
	* Con:
		* need to have Chainlink tokens to pay for service (i.e., a Chainlink/Ocean exchange pair)
		
	<img src="img/chainlink.jpg" width=600 />

In this article, we will investigate the possibility of running verification in each POA authority node, which is the most straightfoward approach.


## 2. Architecture

<img src="img/arch.jpg" width=1000 />

* POA nodes register as verifiers on-chain;
* each POA node retrieves the files that need to be verified;
* POA node will query the Etag of files from the storage (i.e., S3, Azure);
* POA node will submit Etag to on-chain in order to verify the data availability;
* if the submitted Etag matches on-chain record, the file is available in the storage;
* if enough number of confirmations (i.e., > 3) are received, the data availability of file can be confirmed.

## 3. Proof of Concept

In this poc, we use AWS S3 as the example to demo. Similar methodology can be implemented in other storage providers such as Azure. 

### 3.1 Query Etag from JS

To query file etag fom Javascript, the [AWS Javascript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html) should be used. 

First, install the SDK `aws-sdk@2.412.0` using `npm`:

```
$ npm install aws-sdk
```

Setup the Access Keys (example keys in the below):

```
$ export AWS_ACCESS_KEY_ID=JHxfV6y^rl@qdEm^5'PM
$ export AWS_SECRET_ACCESS_KEY=AKIAJVO3K6ONEF3Y56FA
```

Then, write a JS file "aws.test.js" as:

```javascript
// import entire SDK
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
// import individual service
//var S3 = require('aws-sdk/clients/s3');
// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

var params = {
  Bucket: "spectrexps",
  Key: "data.csv"
 };
 
s3.headObject(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 });
```

The output of command `node aws.test.js` is

```
$ node da.test.js
{ AcceptRanges: 'bytes',
  LastModified: 2019-02-28T22:58:57.000Z,
  ContentLength: 16,
  ETag: '"fa3dc03fc4f1a2196783a326afeec4b9"',
  ContentType: 'text/csv',
  Metadata: {} }
```

The Etag can be accessed using `data.ETag` as:

```
$ node aws.test.js
etag : "fa3dc03fc4f1a2196783a326afeec4b9"
```

The etag was `string` type returned from AWS. It can be hashed into bytes32 type and submitted to DIDRegistry contract:

```
const checksum = web3.utils.sha3(etag)
```

The checksum has bytes32 type as: `0x38da7fe5406587ec0222a0d3b85cd7062ce839fae59cf717aefdd900f4144cc8`

### 3.2  getObject vs headObject

To verify the data availability, we do not need to download the whole dataset for verification purpose. Instead, we only need to query the metadata of an object, in particular, the checksum or etag information. 



* **getObject**: Retrieves objects from Amazon S3.

```
{ AcceptRanges: 'bytes',
  LastModified: 2019-02-28T22:58:57.000Z,
  ContentLength: 16,
  ETag: '"fa3dc03fc4f1a2196783a326afeec4b9"',
  ContentType: 'text/csv',
  Metadata: {},
  Body: <Buffer 70 61 72 69 73 2c 62 65 72 6c 69 6e 2c 73 66 0a> }
```

Note that the data is retreived in the `Body` section from the getObject request.

* **headObject**: retrieves metadata from an object without returning the object itself. 

This operation is useful if you're only interested in an object's metadata. To use HEAD, you must have READ access to the object.

```
{ AcceptRanges: 'bytes',
  LastModified: 2019-02-28T22:58:57.000Z,
  ContentLength: 16,
  ETag: '"fa3dc03fc4f1a2196783a326afeec4b9"',
  ContentType: 'text/csv',
  Metadata: {} }
```

### 3.3 POC workflow

* Step 1: register POA authority node as verifier in smart contract

	<img src="img/register.jpg" width=600 />

	```
		/**
	     * @dev owner add a new verifier
	     */
	     function addVerifier(address _verifier)
	     external onlyOwner
	     {
	        require(_verifier != address(0));
	        require(verifiers[_verifier] == false);
	        verifiers[_verifier] = true;
	        verifierCount = verifierCount.add(1);
	        emit VerifierAdded(_verifier);
	    }
	```

* Step 2: setup the required signatures to confirm data availability

	For example, contract owner can set minimum number of (i.e., >= 2) signatures from POA nodes must be collected to confirm the data availability:

	```
	function setRequiredSignatures(uint256 requiredSignatures)
    external onlyOwner
    {
        require(verifierCount >= requiredSignatures);
        require(requiredSignatures != 0);
        _requiredSignatures = requiredSignatures;
        emit RequiredSignaturesChanged(_requiredSignatures);
    }
	```

* Step 3: Challenge of data availability for a specific DID is created:

	It will emit event message including DID, which can be resolved into DDO for the list of files in the storage.

	```
	function createChallenge(bytes32 _did)
     external onlyOwner
     {
         require(didRegisterList.didRegisters[_did].owner != address(0), 'did is not valid');
         require(did2challenge[_did].owner == address(0) || did2challenge[_did].finished == true, 'allow to challenge');
         did2challenge[_did] = challenge({
             owner: msg.sender,
             confirms : 0,
             finished : false
             });
         emit challengeCreated(_did);
     }
	```

* Step 4: Each POA node query the storage for Etag in the local.

	<img src="img/query.jpg" width=800 />
	
* Step 5: Each POA node submit its signature of Etag message to On-chain

	<img src="img/signature.jpg" width=800 />

* Step 6: Smart Contract verify signature and count the confirms from POA nodes:
	* verify the signature is signed by the POA authority node;
	* compare the submitted Etag against the on-chain record;
	* if matched, the POA node confirms the data availability of this DID;
	* when enough confirmations are collected, data availability is confirmed.

	<img src="img/collect.jpg" width=800 />
	

* This POC is a rough prototype for demo of the workflow and should be improved in many aspects for production in the future.

	<img src="img/test.jpg" width=800 />

## 6. Reference

* [AWS Javascript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html) 
* [AWS SDK for JS in Node.js](https://aws.amazon.com/sdk-for-node-js/)
* [JS Developer Document for AWS](https://aws.amazon.com/developer/language/javascript/)
* [Github: AWS SDK for JS in Node.js](https://github.com/aws/aws-sdk-js)
* [getting started guid](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/welcome.html)
* [AWS S3 SDK API reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

## 7. License

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

