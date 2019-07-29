[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

#  BNB token bridge

```
name: research on token bridge for Binance Chain
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 07/23/2019
```

In this research, we investigate the issuance of BEP-2 token in binance chain and the token bridge converts ERC20 token in Ethereum into the BEP-2 token.

The poc can be found in the `poc` folder inside the workspace.

## 1. Issue New Token in Binance Chain

As the first step, Ocean needs to **issue a new type of token** compatible with the **BEP-2 standard** in Binance chain. In this research, we use [Binance testnet](https://testnet.binance.org/en/) for demonstration and POC. 

Note that `issue token` is different from `list token` in binance chain. `list token` must go through a voting period in the community to add trading pairs into the [DEX](https://www.binance.org/en), which is decentralized and out of token owner's control. We will discuss it in more details later. 

### 1.1 Create Wallet

As described in [tutorial](https://www.binance.vision/tutorials/binance-dex-creating-a-wallet), user needs to create new account in Binance chain. The most convenient approach is the [webpage](https://www.binance.org/en/create). It is recommended to download the Keystore file to unlock the BNB wallet in the future.

<img src="img/wallet1.jpg" width=500 />

Next, it displays the private key and 24-word nmemoric. Remember to write it down and keep it private for backup. 

<img src="img/wallet2.jpg" width=500 />

Now, the wallet is ready to be used and accessed from [Unlock Wallet in Mainnet](https://www.binance.org/en/unlock) or [Unlock Wallet in Testnet](https://testnet.binance.org/en/unlock)

<img src="img/wallet3.jpg" width=500 />

After unlock the wallet, the Binance DEX shows up and the wallet address can be found in the account info. In my case, it is `tbnb1ajtgj6c4v5m8npt47yrrxevfkp0qgke0n8zafz`, which starts with `t` to indicate it is wallet address in the testnet.

The same keystore file can be used in the mainnet of Binance chainn as well, but the wallet address is different. For example, use the same keystore file to unlock the wallet in the mainnet and wallet address becomes `bnb1ajtgj6c4v5m8npt47yrrxevfkp0qgke0ajtefn`.

### 1.2 Get test BNB

BNB tokens are required to interact with the Binance chain. For testing purpose, we can request 200 BNB for each wallet from the [faucet](https://www.binance.com/en/dex/testnet/address) but it requires 500 BNB to issue an new BEP-2 token. Listing token costs more than 2000 BNB.

To get enough amount of BNB for testing, we create more wallets and transfer all BNB into one wallet.

<img src="img/faucet.jpg" width=500 />

After a few minutes, the test BNB tokens can be found in the wallet:

<img src="img/balance.jpg" width=600 />

We transfer BNB tokens from other wallet into one wallet:

<img src="img/transfer.jpg" width=500 />

### 1.3 Install Commannd Line Interface

To implemennt more complicated functionalities such as issuing tokens, Binance Chain requires an utility toolkit [`bnbcli`](https://github.com/binance-chain/node-binary), which is a command line interface. Note that the tool for **testnet** is `tbnbcli` that starts with `t`.

```
$ git clone git@github.com:binance-chain/node-binary.git
$ cd ./node-binary/cli/testnet/0.5.8/mac
$ ./tbnbcli 
BNBChain light-client

Usage:
  bnbcli [command]

Available Commands:
  init                  Initialize light client
  status                Query remote node for status
              
  txs                   Search for all transactions that match the given tags.
  tx                    Matches this txhash over all committed blocks
              
  account               Query account balance
  send                  Create and sign a send tx
  sign                  Sign transactions generated offline
              
  api-server            Start the API server daemon
  keys                  Add or view local private keys
              
  version               Print the app version
  token                 issue or view tokens
  dex                   dex commands
  params                params commands
  create-validator      create new validator initialized with a self-delegation to it
  remove-validator      remove validator
  validators            Query for all validators
  unbonding-delegations Query all unbonding-delegations records for one delegator
  gov                   gov commands
  admin                 admin commands
  help                  Help about any command

Flags:
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
  -h, --help              help for bnbcli
      --home string       directory for config and data (default "/Users/fancy/.bnbcli")
  -o, --output string     Output format (text|json) (default "text")
      --trace             print out full stack trace on errors

Use "bnbcli [command] --help" for more information about a command.
```

As such, we can import our wallet to send transactions to the Binance testnet. Here `myWallet` is the alias of local wallet. 

<img src="img/recover.jpg" />

This keystore now exists in `~/.bnbcli/keys` that is the same as the keystore file downloaded previously during the “create wallet” steps. It is encrypted using the selected passphrase.

We can verify our wallet account with cli as:

```
$ ./tbnbcli account tbnb1ajtgj6c4v5m8npt47yrrxevfkp0qgke0n8zafz --chain-id Binance-Chain-Nile  --node=data-seed-pre-2-s1.binance.org:80
{"type":"bnbchain/Account","value":{"base":{"address":"tbnb1ajtgj6c4v5m8npt47yrrxevfkp0qgke0n8zafz","coins":[{"denom":"BNB","amount":"59999925000"}],"public_key":null,"account_number":"690656","sequence":"0"},"name":"","frozen":null,"locked":null}}
```

Now we are ready to issue a new BEP-2 token in Binance chain.

### 1.4 Issue BEP-2 Token

The commandline `$ ./tbnbcli token issue` is used to issue a new BEP-2 token with following specifications in Binance Chain:

* readable token name: `--token-name “Fang” `
* total supply is 1.4 Billion: ` --total-supply 140000000000000000`
* token symbol: `--symbol FANG`
* mintable token: `--mintable=true/false`
* token owner: `--from myWallet` (myWallet is my local alias of wallet address)
* Binance network: `--chain-id Binance-Chain-Nile`

The complete command and transaction are following:

```
$ ./tbnbcli token issue --token-name “Fang” --total-supply 140000000000000000 --symbol FANG --mintable --from myWallet --chain-id Binance-Chain-Nile  --node=data-seed-pre-2-s1.binance.org:80
```

<img src="img/issue.jpg" />

The tx hash is `EE56C7AF0C8785AEF9D3CDAF2D7FDE18A8A3DB919D6F2F094394B379CEBB7C86`. Tx details can be found [here](https://testnet-explorer.binance.org/tx/EE56C7AF0C8785AEF9D3CDAF2D7FDE18A8A3DB919D6F2F094394B379CEBB7C86).

<img src="img/tx.jpg" width=700/>

From the explorer, we can see it creates a new token `FANG-EE5`. To avoid the uniqueness issue, Binance append the first three letters of tx hash to the token symbol (`EE5` in this case). Also, this tx costs 500 BNB. 


Moreover, the token details can be verified from [https://testnet-explorer.binance.org/asset/FANG-EE5](https://testnet-explorer.binance.org/asset/FANG-EE5):

<img src="img/info.jpg" width=700/>

From now on, the token can be transfered to other users. 

### 1.5 List Token 

While anyone can issue their tokens on Binance Chain, the listing of trading pairs on Binance DEX involves 4 steps: Proposal, Deposit, Vote, and List. This process is detailed in the [tutorial](https://community.binance.org/topic/18/guidelines-on-how-to-list-your-token-on-binance-dex) from Binance.

<img src="img/list.jpg" width=500/>

In short, token owner needs to submit Listing proposal and deposit at least 1,000 BNB tokens to make it eligible for voting. In this process, listing application, project information, vote results and all community interaction will be public on the [Binance Chain Community Forum](https://community.binance.org/). The Validators will vote purely based on public information in the forum.

At least half of the voting power is required to vote “Yes” for the proposal to be accepted. Denied proposals will lose all the funds deposited. If the vote is passed, the Token Issuer will need to initiate a “List” transaction on-chain (1,000 BNB fee), while the previous 1,000 BNB deposit will be refunded back to the proposing user.


## 2. POC of BNB Bridge 

The overall architecture of BNB bridge can be illustrated as below, which includes three components:

* **frontend**: the webpage that interact with users to issue and swap BEP-2 tokens;
* **sdk**: the backend server that listens to the request from the frontend and interacts with the DB and blockchain (both Ethereum and Binance Chain);
* **DB**: the PostgreSQL database that stores the account and token information, which contains sensitive info and should be kept in high security.

<img src="img/bnbridge__arch.jpg" />

It worth mentioning that the bridge will NOT mint BEP-2 tokens every time it receives the swap request due to the high minting cost. In fact, **minting tokens in Binance chain was extremely expensive**, which was originally cost 200 BNB (worth several thousands dollars) for each minting transaction. Recently, Binance had cut it to be 5 BNB per mint, which implies a cost of \$140 for each swap. Instead, the bridge mints all tokens up to the total supply and locked in an escrow account. As such, it only needs to transfer BEP-2 token from escrow account to the usr's wallet for each swap, which has much lower cost.

Moreover, since the ERC20 token must be locked inside the escrow account before any BEP-2 can be unlocked, the total supply of token remains the same all the time. The key is to keep the PostgreSQL DB safe, since it includes all credentials of escrow accounts.

The workspace has a structure as belows:

<img src="img/structure.jpg" width=300 />

The "bnbridge" folder is the frontend part while "sdk" folder is the backend.


### 2.1 Install PostgreSQL database

The poc demonstrates the workflow in MacOS but the similar procedure can be applied to Linux system as well.

Use the command below to install the [PostgreSQL database](https://www.postgresql.org/):

```bash
$ brew install postgresql
$ postgres -V
postgres (PostgreSQL) 11.4
```

Start the database service with command:

```bash
$ pg_ctl -D /usr/local/var/postgres start
waiting for server to start....2019-07-23 17:54:23.573 PDT [42781] LOG:  listening on IPv6 address "::1", port 5432
2019-07-23 17:54:23.573 PDT [42781] LOG:  listening on IPv4 address "127.0.0.1", port 5432
2019-07-23 17:54:23.573 PDT [42781] LOG:  listening on Unix socket "/tmp/.s.PGSQL.5432"
2019-07-23 17:54:23.585 PDT [42782] LOG:  database system was shut down at 2019-07-23 17:52:08 PDT
2019-07-23 17:54:23.589 PDT [42781] LOG:  database system is ready to accept connections
 done
server started
```

Enter the interactive mode and check accounts (or update password). 

```bash
$ psql postgres
psql (11.4)
Type "help" for help.

postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of 
-----------+------------------------------------------------------------+-----------
 fancy     | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
 postgres  | Superuser, Create role, Create DB                          | {}
 
postgres=# \password postgres
Enter new password: 
Enter it again:
```

At this time, the database is up and running. We can further initialize the Tables in DB with the SQL script in `sdk/sql/setup.sql`:

```bash
$ psql -f ./sql/setup.sql  postgres
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
DROP TABLE
CREATE TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
```

To visualize the tables in the database, a GUI can be used such as [DBeaver](https://dbeaver.io/download/). At the first time, we need to setup the connection information as:

<img src="img/db_gui.jpg" width=700 />

So we can check each table schema and values:
<img src="img/dbtable.jpg" width=700 />

### 2.2 Install BNB CLI

BNB CLI is used to issue and transfer BEP-2 tokens. It can be installed to any place and set the path to it in bridge settings. In my case, it was installed in `/Users/fancy/bnbcli/cli/testnet/0.5.8/mac`.


```bash
$ git clone https://github.com/binance-chain/node-binary.git
Cloning into 'node-binary'...
remote: Enumerating objects: 1067, done.
remote: Total 1067 (delta 0), reused 0 (delta 0), pack-reused 1067
Receiving objects: 100% (1067/1067), 848.28 MiB | 10.46 MiB/s, done.
Resolving deltas: 100% (268/268), done.
git-lfs filter-process: git-lfs: command not found
fatal: The remote end hung up unexpectedly
warning: Clone succeeded, but checkout failed.
You can inspect what was checked out with 'git statu

$ chmod +x ./node-binary/cli/prod/0.5.8/mac/bnbcli 

$ ./node-binary/cli/prod/0.5.8/mac/bnbcli version
Binance Chain Release: 0.5.8;Binance Chain Commit: 91044e2; Cosmos Release: =v0.25.0-binance.17; Tendermint Release: =v0.30.1-binance.6;
```

### 2.3 Deploy ERC20 Token to Ethereum (Testing Purpose)

For demonstration purpose, we deploy an ERC20 token into Ropsten testnet. If we work on Ocean token, this step can be skipped. 

The token contract is a simple ERC20 token, which can be found in folder `erc20` in the workspace. The token contract address is `0xADB63653B588096C8584F3e89c6bE58e664F53f9`.
 
```
$ truffle migrate --network ropsten

Starting migrations...
======================
> Network name:    'ropsten'
> Network id:      3
> Block gas limit: 8000029

...


2_erc20_token.js
================

   Deploying 'ERC20Token'
   ----------------------
   > transaction hash:    0xb444f2210f7705ed973f424b98bf28cce3b31ed739b166d7f065719d3c8d368b
   > Blocks: 1            Seconds: 12
   > contract address:    0xADB63653B588096C8584F3e89c6bE58e664F53f9
   > account:             0x0E364EB0Ad6EB5a4fC30FC3D2C2aE8EBe75F245c
   > balance:             1.028029306744727814
   > gas used:            1214459
   > gas price:           10 gwei
   > value sent:          0 ETH
   > total cost:          0.01214459 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:          0.01214459 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.0143563 ETH
```

### 2.3 Launch Backend Server

the backend server must be started so that it can listen to the frontend activities and interact with both blockchains.

```
$ cd sdk
$ npm install
$ cp config/example.config.js config/config.js
```

In this `config.js` file, there are many settings need to be modified:

* **DB connection**: it should match the account info in PostgreSQL database:

```
host: "localhost",
database: "postgres",
user: "fancy",
password: "123123123",
```

* **Binance Chain settings**: update the api, filePath, chainID accordingly. In this POC, we use Binance testnet and test bnbcli. But production version shall be used in real deployment.

```
api: "https://testnet-dex.binance.org/",
filePath: "/Users/fancy/bnbcli/cli/testnet/0.5.8/mac",
fileName: "tbnbcli",
chainID: "Binance-Chain-Nile",
nodeData: "data-seed-pre-2-s1.binance.org:80",
nodeHTTPS: "https://seed-pre-s3.binance.org:443",
keyPrepend: "TEST10_",
list_proposal_deposit: "200000000000",
prefix: 'tbnb',
network: 'testnet',
```

* **Ethereum Web3 provoider**: it shall match the Ethereum network that ERC20 token contract has deployed to.

```
provider: 'https://ropsten.infura.io/v3/2b1dbb61817f4ae6ac90d9b41662993b',
```

After the settings are updated, the server can be launched as:

```bash
$ node api.bnbridge.exchange.js 
api.bnbridge.exchange 8000
GET /api/v1/tokens 200 31.226 ms - 41
GET /api/v1/fees 200 702.330 ms - 265
```

At this time, the backend is listening to `http://localhost:8000` for any request.


### 2.4 Launch Frontend

The fronend component is located in `bnbridge` folder. First, install the packages and libraries that are required:

```
$ cd bnbridge
$ npm install
```

The config file at `bnbridge/src/config/config.js` needs to be updated:

```
apiUrl: "http://localhost:8000",
apiToken: "ZTgwMTY1NjkzZjAyOTk1N2VjNDQ4MjBhNGRiODJiMGI1NjI5YjM2YjJkNjc1YjVhYjE0YmEwNTBhMDFiNDk3ZDpmYmM3MWMyOTRmOWE4N2VlM2QzMmVkZDVkNjExNTE4MTFlNDRmNzc0NDgzNzY4OWVmYWRkYmJiOWY3NjgxYzA5",
explorerURL: "https://testnet-explorer.binance.org/tx/",
etherscanURL: "https://ropsten.etherscan.io/tx/",
bnbAddressLength: 43,
erc20addressLength: 42,
```

The frontend service can be started now:

```
$ npm run start
Compiled successfully!

You can now view bnbridge in the browser.

  Local:            http://localhost:3000/
  On Your Network:  http://192.168.86.109:3000/

Note that the development build is not optimized.
To create a production build, use yarn build.
```

The webpage should be opened at `http://localhost:3000/` that looks similar as below:

<img src="img/frontend.jpg" width=700 />


### 2.5 Issue BEP-2 Token

We need to issue the BEP-2 token through bnbridge so that the PostgreSQL database can have all the required information.

* **Step 1**: fill the ERC20 token address and type the desired BEP-2 token name & supply:

<img src="img/issue1.jpg" width=700 />

* **Step 2**: the bridge creates a new escrow account `tbnb19mjkv6ew9w9tu7eqrfq8yz4rgkxfpld3rx3f0r` which is the owner of BEP-2 token in Binance Chain. Its credentials are stored in PostgreSQL DB. We need to transfer 500 BNB into the escrow account to cover the cost.

<img src="img/issue2.jpg" width=700 />

* **Step 3**: When the 500 BNB has been transfered (e.g., [tx](https://testnet-explorer.binance.org/tx/740243D3487BD188C1619E3ABBFE9200D09301DC6704FF32A61626E591FF804D) is complete), move forward in the frontend. 

<img src="img/issue3.jpg" width=700 />


From the Binance Chain explorer, the `Issue` transaction creates a new BEP-2 token with name `ERC20-2D3`:

<img src="img/issueToken.jpg" width=700 />

The balance of `ERC20-2D3` is verified:

<img src="img/issue4.jpg" width=700 />

### 2.5 Swap ERC20 to BEP-2 Token

Now the BEP-2 token is ready to be swapped for corresponding ERC20 token. Switch to the `Swap` tab in the frontend. At this time, the ERC20 token should be able to be found in the token selection list. 

* **Step 1**: choose the ERC20 token from the list and type in the receiver BEP-2 token wallet address:

<img src="img/swap1.jpg" width=700 />

* **Step 2**: an escrow account for ERC20 token is created and user need to transfer to-be-swapped ERC20 tokens into it:

<img src="img/swap2.jpg" width=700 />

* **Step 3**: send 1000 ERC20 token into the escrow account in Ethereum network:

<img src="img/swap3.jpg" width=700 />

* **Step 4**: after the transaction is complete, mvoe forward in the frontend:

<img src="img/swap6.jpg" width=700 />

* **Step 5**: check the BEP-2 token in the receiver wallet in Binance Chain

<img src="img/swap7.jpg" width=800 />

The token swap is complete at this time using the bnbridge service.
