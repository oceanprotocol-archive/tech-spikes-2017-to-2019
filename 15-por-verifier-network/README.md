[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

#  Verifier Network Design (WORK IN PROGRESS)

```
name: research on verifier network for Proof of Retrieveability
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 07/02/2019
```


More information about PoR can be found in [report](../03-data-availability/web2-compact-por/README.md). In this research, we investigate the design of verifier network, which generates challenges and verifies the proofs from the storage in a decentralized way.

In each design of the verifier network, there are some critical modules in the below:

* **selection of verifiers**: there are a verifier pool, which may include POA authority nodes or registered entities. 
* **consensus mechanism**: the way that verifiers reach an agreement or conclude a verification task.
* **incentive mechanism**: when verifier pool is open to the public and any node can join, it is important to have a proper incentive mechanism in place to reward or punish participants.

We will investigate different designs from these three perspectives and compare their pros & cons in the below. They are sorted by the implementation difficulty from low to high.


# 1. All-hands POA Authorities

The most straightforward design is to have POA authority nodes in Ocean network to be verifiers. The identity of node operator is known to us. 

* **Selection**: all POA authority nodes are required to participate in the verification task. Each node can generate his own challenge, send it to the storage and verify the proof on its own. 

* **Consensus**:
	* since the number of authority nodes is limited, it is possible to *request all of them to agree* on the verification result; it fails to conclude if there is any single verifier cannot verify the challenge. 
	* alternatively, a *M-out-of-N signature* can be used to reach an agreement. For example, more than 3 signatures from POA authority nodes can verify the data availability.

* **Incentive**: it is not needed to give rewards to POA authority nodes since they are known and trustworthy entities.

* **Pro**:
	* simple to implement and manage;

* **Con**:
	* limited scalability as each verifier needs to be a POA node;

# 1.1. Variant: Randomly Selected POA Authorities

Based on above design, we can further introduce randomness to the verification game. 

* **Selection**: for each verification task, a few POA authority nodes will be randomly selected from the pool to serve as the verifiers, therefore, making it difficult to predict the verifiers for a specific task.

Other apsects includinng Consensus, Incentive are the same as previous design.

* **Pro**:
	* simple to manage verifiers;
	* random selection makes it difficult to predict verifiers and prevents potential attacks;

* **Con**:
	* limited scalability as each verifier needs to be a POA node;
	* it requires a reliable way to generate random numbers (i.e., Chainlink can be used to import random numbers into smart contract)



# 3. Open Verifier Network

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

