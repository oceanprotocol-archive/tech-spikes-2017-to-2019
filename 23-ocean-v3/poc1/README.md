# Ocean protol v3 | poc 1

The purpose of this repo is to act as a demonstration of the basic functionality of Ocean protocol v3 which includes ERC721 DataToken, ERC20 OceanToken, UniswapExchange contracts, etc.

In this proof of concept we have several key elements that the protocol is build of:

`OceanFactory.sol` - is a "gateway" contract to the Ocean protocol as it unites together all of the parts of the protocol such as `DataToken`, `UniswapExchange` etc. It also allows to create new `ERC20 -> DataToken` markets where users and data providers can exchange ERC20 token of their choice ERC721 tokens that represent off-chain digital assets.

`OceanMarket.sol` - is a template for `ERC20 -> DataToken` markets. For each individual ERC20 token a new market is being created and deployed. If ERC20 is OCEAN token then users do not pay any fees. If ERC20 is not OCEAN then a 5% fee(in this implementation) should be paid. The fees are being accumulated in the token being used as a mean of exchange and after reaching a certain threshold they are being automatically swapped to OCEAN through `Uniswap` protocol and transferred to `OceanProxy` contract.

`OceanProxy.sol` - currently just an empty placeholder contract where fees are being sent. In the future, it could be a DAO contract, fees redistribution contract, etc. 


Test:

Install vyper: https://vyper.readthedocs.io/en/v0.1.0-beta.7/installing-vyper.html

in `vyper`:

```
git reset --hard 35038d20bd9946a35261c4c4fbcb27fe61e65f78

make
```

```
source ~/vyper-venv/bin/activate
```

In project folder:

```
npm install
npm install web3
npm install truffle-assertions
npm install @openzeppelin/contracts
```

```
truffle develop
```

```
compile
migrate
test
```