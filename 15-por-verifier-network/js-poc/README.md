## Get Started

### Install Packages

```
$ cd server
$ npm install

$ cd ../client/por
$ npm install
```

### Migrate Contract

```
$ ganache-cli 

$ cd truffle
$ truffle migrate --network <network>
```

### Launch API Server

change config file: `server/config/index.js` including contract_address, abi and boolean `runGo` (it switches off the go-lang function)

```
const config = {
    // ethereum settings
    provider: 'http://localhost:8545',
    contract_address: '0x511c6De67C4d0c3B6eb0AF693B226209E45e025A',
    abi: [{"constant":true,"inputs":..."name":"verificationFinished","type":"event"}],

    // por settings
    runGo: false,
    goPath: "/usr/local/bin",
    filePath: "/Users/fancy/go/por/por.go",
}

module.exports = config
```

Launch the api server as:

```
$ node server/api.server.js
api.server listening on port  8000
```

### Launch Client 

change config file: `client/por/src/config/config.js` includes the contract address and api server url.

```
const config = {
    apiUrl: "http://localhost:8000",
    contract_address: "0x2345d5788C876878a020a57526f1D1C9c6f753B6"
  };
  
  export default config;
```

Launch the client page as: `npm start`


