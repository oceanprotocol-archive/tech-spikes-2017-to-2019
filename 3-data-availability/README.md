[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# Research on Data Availability 

```
name: investigate how to obtain proofs of data availability.
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 01/31/2019
```

## Introduction


## Folder Structure

Folder Name   |  Description |
--- | ---|
web-2.0 | solutions in web-2.0 framework (centralized scenario) |
web-3.0 | solutions in web-3.0 framework (decentralized scenario) |

## Web 2.0 Solutions

* Big Data lakes (HDFS mainly)
* Ad-hoc solutions SAN or NAS

Both options are given mainly by cloud providers (Amazon S3, Azure) and on-premise solutions.

## Web 3.0 Solutions

* Retrieveability (High level background):
	- proof-of-retrievability, PoR (RSA labs, 2007-8 or so)
	- Truebit's data availability (paper from Jason Teutsch)

* Oracles for bringing off-chain data > on-chain:
	- Witnet
	- Oraclize (TLSNotary)
	- Chainlink

* Challenge-Response:
	- Filecoin Proof-of-Spacetime 

* Gdrive: [link](https://drive.google.com/drive/u/0/folders/15iAehOmBG7mKIf7QyQPumJq0wJZUAxhU)
	- scheme 3.0 (i.e., erasure coding)
	- scheme 3.1

* Teusch

* Filecoin retrieval miners

* Approach as "Secure Certified Mail" protocol problem

* arweave.

* Directions:
	- verify signed receipts of cloud providers, OPTIONS calls
	- verify HTTP request information, like TLS session, keys, etc (verification of the certificate authorities)

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

