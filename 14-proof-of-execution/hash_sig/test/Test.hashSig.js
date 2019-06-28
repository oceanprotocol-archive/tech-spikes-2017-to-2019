
let fs = require("fs");
let crypto = require('crypto')
const HashSig = artifacts.require("HashSig");
const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0'))


function fileHash(filename, algorithm = 'sha1') {
  return new Promise((resolve, reject) => {
    // Algorithm depends on availability of OpenSSL on platform
    // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
    let shasum = crypto.createHash(algorithm);
    try {
      let s = fs.ReadStream(filename)
      s.on('data', function (data) {
        shasum.update(data)
      })
      // making digest
      s.on('end', function () {
        const hash = shasum.digest('hex')
        return resolve(hash);
      })
    } catch (error) {
      return reject('calc fail');
    }
  });
}

contract("HashSig", (accounts) => {
  let sig
  let filename = web3.utils.keccak256('mnist_cnn.py')


  describe("should add signature", () => {
    it("add and query", async () => {
      sig = await HashSig.deployed()
      let hash = await fileHash('mnist_cnn.py')
      let bytes32Hash = web3.utils.keccak256(hash)
      console.log(bytes32Hash)
      // add hash signature to on-chain
      await sig.addSig(filename, bytes32Hash, { from: accounts[0]})
      // query the hash signature from smart contract
      let res = await sig.getSig(filename, { from: accounts[0]})
      console.log("hash :=" + res)
    });
  });

});
