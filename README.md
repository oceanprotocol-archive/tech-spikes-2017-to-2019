[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# Research Work 

```
name: repository of research work what we are interested.
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
```

## Introduction

Research work includes investigation, PoC and Implementation of various topics that are interesting to Ocean and transferred to production in the later stage.

This repository maintains on-going research work and will be updated frequently over the time. 

***Disclaimer*** this repository is missing a code audit and should still be considered to be PoC. We can't rule out that there are bugs that might cause loss.

## List of Research Work

Folder Name   |  Description | Issue |
--- | ---| ---|
0-enigma-mpc |  investigation of Enigma MPC to identify issues of integration with Ocean. | 
1-fitchain-analysis | 	analysis of Ocean/Fitchain integration; identify "gaps" of integration. | [257](https://github.com/oceanprotocol/ocean/issues/257) |
2-signaling-mechanism  | research on token mechanism for signaling | [258](https://github.com/oceanprotocol/ocean/issues/258)|
3-data-availability | investigate how to retreive proof of data availability | [244](https://github.com/oceanprotocol/ocean/issues/244) [281](https://github.com/oceanprotocol/ocean/issues/281) [294](https://github.com/oceanprotocol/ocean/issues/294) [334](https://github.com/oceanprotocol/ocean/issues/334) |
4-uniswap | research of adding Ocean to Uniswap | [286](https://github.com/oceanprotocol/ocean/issues/286) |
5-token-migration | research of migrating tokens | [287](https://github.com/oceanprotocol/ocean/issues/287) [310](https://github.com/oceanprotocol/ocean/issues/310)
6-random-number | integration of Uniswap + Chainlink to import off-chain random numbers | [288](https://github.com/oceanprotocol/ocean/issues/288)
7-arbitrage-bot | build an arbitrage bot between Uniswap and Exchange | 
8-pricing | research and development of a data pricing framework | |
9-arweave | investigate ARWeave for data availability proof | [305](https://github.com/oceanprotocol/ocean/issues/305) |
10-zk-pedersen | Investigating zero-knowledge Pedersen scheme for whitelisting condition|[306](https://github.com/oceanprotocol/ocean/issues/306)|
11-meta-tx | research meta transaction for better UX experience | [308](https://github.com/oceanprotocol/ocean/issues/308)
12-tf-encrypted | investigate tf-encrypted for private ML computing | [333](https://github.com/oceanprotocol/ocean/issues/333)
13-data-provenance | research data provenance | [245](https://github.com/oceanprotocol/ocean/issues/245) |

## Updates

* [06/05/2019] data provenance ([245](https://github.com/oceanprotocol/ocean/issues/245))

* [06/03/2019] refactoring por and [POC](03-data-availability/web2-compact-por/por-refactoring) ([334](https://github.com/oceanprotocol/ocean/issues/334))

* [05/25/2019] investigate tf-encrypted for private ML computing  ([333](https://github.com/oceanprotocol/ocean/issues/333))

* [05/20/2019] governance of token migration ([310](https://github.com/oceanprotocol/ocean/issues/310)) 

* [05/14/2019] meta transaction [308](https://github.com/oceanprotocol/ocean/issues/308)

* [05/01/2019] proof of data retrievability (PoR) [294](https://github.com/oceanprotocol/ocean/issues/294)

* [04/26/2019] ZK based Pederson Scheme [306](https://github.com/oceanprotocol/ocean/issues/306)

* [04/25/2019] arweave investigation ([305](https://github.com/oceanprotocol/ocean/issues/305))

* [04/10/2019] data pricing research

* [04/04/2019] arbitrage bot

* [03/19/2019] token migration ([287](https://github.com/oceanprotocol/ocean/issues/287)) & Chainlink<>Uniswap integration ([288](https://github.com/oceanprotocol/ocean/issues/288))

* [03/07/2019] integration of Chainlink and Ocean ([281](https://github.com/oceanprotocol/ocean/issues/281) data availability folder)

* [03/04/2019] Uniswap research [286](https://github.com/oceanprotocol/ocean/issues/286)

* [02/11/2019] research of short selling in bonding curves (in signaling mechanism folder)

* [01/31/2019] update data availability (web 2.0)

* [01/28/2019] enigma analysis

* [01/26/2019] ocean/fitchain analysis

* [01/16/2019] setup framework of repository


## License

```
Copyright 2019 Ocean Protocol Foundation

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

