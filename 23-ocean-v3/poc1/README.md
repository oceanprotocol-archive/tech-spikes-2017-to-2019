# Ocean protol v3 | poc 1

This repo is ment to demonstrate basic functionality of Ocean protocol v3 which includes ERC721 DataToken, ERC20 OceanToken, UniswapExchange contracts etc.

Contracts:

`OceanFactory.sol` - used to create new Ocean markets and stores data of main protocol components

`OceanMarket.sol` - manages ERC20 token escrow, ERC721 mint, and fees exchange to OCEAN and withdrawal

`OceanProxy.sol` -ntract for a placeholder for Ocean DAO, currently has only fallback function

`MessageSigned` - signature helper contract

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