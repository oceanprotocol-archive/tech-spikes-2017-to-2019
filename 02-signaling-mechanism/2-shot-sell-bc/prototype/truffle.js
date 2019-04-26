const HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = process.env.NMEMORIC

const rpcHost = process.env.KEEPER_RPC_HOST
const rpcPort = process.env.KEEPER_RPC_PORT
const url = process.env.KEEPER_RPC_URL

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: rpcHost || 'localhost',
            port: rpcPort || 8545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6000000
        },
        // local network for generate coverage
        coverage: {
            host: 'localhost',
            // has to be '*' because this is usually ganache
            network_id: '*',
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        // spree from docker
        spree_wallet: {
            provider: () => new HDWalletProvider(process.env.NMEMORIC, url || `http://localhost:8545`),
            network_id: 0x2324,
            gas: 4500000
        },
        // spree from docker
        spree: {
            host: rpcHost || 'localhost',
            port: rpcPort || 8545,
            network_id: 0x2324,
            gas: 4500000,
            from: '0x00bd138abd70e2f00903268f3db08f2d25677c9e'
        },
        // nile the ocean testnet
        nile: {
            provider: () => new HDWalletProvider(process.env.NMEMORIC, url || `http://52.1.94.55:8545`),
            network_id: 0x2323,
            gas: 6000000,
            gasPrice: 10000,
            from: '0x90eE7A30339D05E07d9c6e65747132933ff6e624'
        },
        // kovan testnet
        kovan: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://kovan.infura.io/Kuo1lxDBsFtMnaw6GiN2")
            },
            network_id: '42',
            gas: 6000000,
            gasPrice: 10000000000 // 10 Gwei
        },
        ropsten: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://ropsten.infura.io/Kuo1lxDBsFtMnaw6GiN2")
            },
            gas: 6000000,
            gasPrice: 10000000000, // 10 Gwei
            network_id: 3
        },
    },
    compilers: {
        solc: {
            version: '0.4.25'
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
}
