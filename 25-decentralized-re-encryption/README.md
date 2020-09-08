# Decentralized Proxy Re-encryption


## Introduction

we don't want OPF to run a (centralized) provider that is holding custody of the keys that encrypt/decrypt each url for Ocean Market.

The question in this tech spike is to answer if we can solve this by somehow storing the secret (private key) on-chain or there's a third-party network that interfaces well, that's fine (ideally interfaces with Eth mainnet, but perhaps also via JS in browser.)

Possible tools:

- [Nucypher](#nucypher)
- [Keep Network](#keep-network)
- [Secret Network](#secret-network)
- [Enzypt.io](#enzypt)

If we can't find a simple/fast solution in the near term, then here's a path forward for V3.0:

In Ocean Market, ensure there's an option for people to provide an endpoint of the Provider. (Therefore they can retain decentralization.)
In Ocean Market, if the user chooses to use the OPF-run Provider, set the expectation that this Provider will only be run until some specific cut-off date (e.g. Dec 31, 2021). This ensures that OPF is not bound to some weird long-term commitment that it didn't mean to make.


# Nucypher

It provides a decentralized key management system (KMS) and cryptographic access control layer to distributed systems. There are extra services such as FHE secure computation, dynamic access management, and secret management but they are out-of-scope. Nucypher uses PoS as underlying protocol for decentralized proxy re-encryption. 

The decentralized proxy re-encryption uses an asymmetric non-interactive re-encryption key method that allows an untrusted proxy entity  to transform cipher-texts from one public key to another without learning anything about the underlying message.

![nucypher PRE scheme from nuchyper whitepaper](images/nucypher-pre-scheme.png)

NuCypher implements a [threshold split-key re-encryption scheme](https://arxiv.org/pdf/1707.06140.pdf) as follows:

- Alice broadcasts data (with a smart contract policy) and a re-encryption key to the network (proxies/nodes).
- The re-encryption key is splitted between different nodes. Splitting the key splits trust.
- The trust relies on how much a proxy's/node's nucypher token staked as a collateral.
- When Bob asks for re-encryption using his public key, proxies will use threshold re-encryption keys to re-encrypt the payload and send it back to Bob. 
- Finally, Bob decrypts and reads the message.

Nucypher implemented a new PRE librray called [pyUmbral](https://github.com/nucypher/pyUmbral) to do that. The demo below shows how to use PRE in Nuchyper:

[<img src="https://img.youtube.com/vi/M8IZ1MTOd24/maxresdefault.jpg" width="100%">](https://youtu.be/M8IZ1MTOd24)


## Tokenomics

Nodes are incentivized to continually provide re-encryption services by receiving fees from users (paid in ETH) and participation rewards (paid in NU tokens). Node operators must stake NU tokens to their node and will receive rewards which are earned in proportion to their stake. When the mainnet launches, incentives will mostly come in the form of rewards rather than fees. Eventually, when the network gains users, fees will become a large part of the financial incentive to run a node.

Staking rewards are automatically restaked after each period, unless the user has opted out or the period ends. At the end of the staking period, if the Ursula Node did it’s job providing re-encryption services, the stake plus rewards can be claimed.

## Integration

The NuCypher protocol requires access to an Ethereum node for the Ursula worker node to read and write to NuCypher’s smart contracts. 
Due to the complexity of running a node on the network, there are a variety of ways to participate depending on your comfort level:

- Delegate custody of NU and work to a third-party custodian.
- Delegate work via a staking pool or [Node-as-a-Service provider](https://github.com/nucypher/validator-profiles).
- Run your own node ([worker](https://docs.nucypher.com/en/latest/guides/network_node/staking_guide.html) + [staker](https://docs.nucypher.com/en/latest/guides/network_node/staking_guide.html))

![participatation in Nucypher network](images/running_a_node_decision.svg)

More details WorkLock Participation to be found [here](https://blog.nucypher.com/the-worklock/)
# Keep Network

TBD

# Secret Network

Enigma is the software company that developed the Secret newtork. The secret network mainnet is a proof-of-stake-based blockchain based on [Cosmos SDK/Tendermint](https://github.com/cosmos/cosmos-sdk). It is backed by a new native coin, Secret (SCRT), which is used for staking and transaction fees within the network.

The following process describes, step by step, how a secret contract is submitted and a computation performed on the Secret Network:

- Developers write and deploy Secret Contracts to the Secret Network
- **Validators run full nodes and execute Secret Contracts**
- Users submit transactions to Secret Contracts (on-chain), which can include encrypted data inputs.
- Validators receive encrypted data from users, and execute the Secret Contract.
- During Secret Contract execution:
   - Encrypted inputs are decrypted inside a Trusted Execution Environment.
   - Requested functions are executed inside a Trusted Execution Environment.
   - Read/Write state from Tendermint can be performed (state is always encrypted when at rest, and is only decrypted within the Trusted Execution Environment).
   - Outputs are encrypted.
   - In summary, at all times, data is carefully always encrypted when outside the Trusted Compute Base (TCB) of the TEE.
- The Block-proposing validator proposes a block containing the encrypted outputs and updated encrypted state.
- At least 2/3 participating validators achieve consensus on the encrypted output and state.
- The encrypted output and state is committed on-chain.


# Enzypt

Enzypt has the workflow for publish/sell data assets:

- Payload is zipped and encrypted [details below]()
- Metadata is encrypted
- Payload and metadata are uploaded to separate IPFS locations using ipfs.enzypt.io
- Payload and metadata hashes are posted to the API
- Unique payment link is returned to the seller
- Seller shares the link with buyers
- Buyer loads the metadata file from /:urlSlug
- Buyer requests a random string to sign from /rand
- Buyer posts a signed message to /msg
- Buyer sends the transaction with the data equal to the return from /msg
- Buyer sends the transaction hash to /buy
- API returns the IPFS hash of the payload
- Buyer downloads and decrypts the payload

The mysterious part here is about how enzypt does this p2p file sharing:

The encryption key is generated client-side, and only the initialisation vector is passed to the server. This IV is then sent to any buyer, but they must also have **the seller-generated key**.

The seller distributes this key by way of it being appended to the URL on the client side which they receive upon successful upload. You can clearly see the key portion of the URL (it's after the second forward slash) https://enzypt.io/some-server-reference/decryption-key. The buying client then parses that out of the URL and then only uses it to decrypt the file upon successful purchase.


Pros:
- It is just a single client/server app in which allow users to buy/sell their data

Cons:

- The seller has to re-generate and distribute the decryption key everytime someone asking for a download.
- It tightly coupled to IPFS 
- It is not clean when the seller sends the decryption key.