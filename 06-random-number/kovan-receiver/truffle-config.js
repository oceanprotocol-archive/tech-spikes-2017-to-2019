const HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = process.env.NMEMORIC
const url = process.env.KEEPER_RPC_URL

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: 'localhost',
            port: 8545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6000000
        },
        // kovan testnet
        kovan: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://kovan.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            network_id: '42',
            websockets: true,
            gas: 6000000,
            gasPrice: 10000000000 // 10 Gwei
        },
        // Rinkeby testnet
        rinkeby: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            network_id: '4',
            gas: 6000000,
            gasPrice: 10000000000 // 10 Gwei
        },
        ropsten: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://ropsten.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            gas: 6000000,
            gasPrice: 10000000000, // 10 Gwei
            network_id: 3
        },
        // nile the ocean testnet
        nile: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://nile.dev-ocean.com")
            },
            network_id: 0x2323, // 8995
            gas: 6000000,
            gasPrice: 10000000000,
            from: '0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c'
        },
    },
    compilers: {
        solc: {
            version: '0.4.24',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}
