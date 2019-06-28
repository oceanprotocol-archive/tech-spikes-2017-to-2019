let fs = require("fs");
let crypto = require('crypto')
const Web3 = require('web3')

let web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/Kuo1lxDBsFtMnaw6GiN2"));

const account = '0x0E364EB0Ad6EB5a4fC30FC3D2C2aE8EBe75F245c';

var abi = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_hash","type":"bytes32"}],"name":"addSig","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xfa3d1325"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getSig","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x893182ff"}]';
const addressTo = '0x0f2c3e140F8EC039785b3631F3C7c282ceb9c12e'
const contract = new web3.eth.Contract(
  JSON.parse(abi),
  addressTo
);

async function call(transaction) {
    return await transaction.call({from: account});
}

async function checkHash(name) {
    let val = await call(contract.methods.getSig(name));
    console.log("the hash of model file :=" + val)
    return val;
}

async function fileHash(filename, algorithm = 'sha1') {
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

// check hash of file and compare with local calculation
async function verify() {
  let localHash = await fileHash("mnist_cnn.py")
  let bytes32Hash = web3.utils.keccak256(localHash)
  console.log("local hash of model file :=" + bytes32Hash)

  let filehash = web3.utils.keccak256('mnist_cnn.py')
  let res = await checkHash(filehash)
  if(bytes32Hash === res)
    console.log("matched")
  else {
    console.log("unmatched")
  }
}

verify()
