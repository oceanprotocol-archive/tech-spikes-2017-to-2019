# Decentralized Proxy Re-encryption


## Introduction

we don't want OPF to run a (centralized) provider that is holding custody of the keys that encrypt/decrypt each url for Ocean Market.

The question in this tech spike is to answer if we can solve this by somehow storing the secret (private key) on-chain or there's a third-party network that interfaces well, that's fine (ideally interfaces with Eth mainnet, but perhaps also via JS in browser.)

Possible tools:

- [nucypher]()
- [keep.network]()
- [Enigma / Secret Network]()
- [enzypt.io]()

If we can't find a simple/fast solution in the near term, then here's a path forward for V3.0:

In Ocean Market, ensure there's an option for people to provide an endpoint of the Provider. (Therefore they can retain decentralization.)
In Ocean Market, if the user chooses to use the OPF-run Provider, set the expectation that this Provider will only be run until some specific cut-off date (e.g. Dec 31, 2021). This ensures that OPF is not bound to some weird long-term commitment that it didn't mean to make.


## Enzypt

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