const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

var abi = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_hash","type":"bytes32"}],"name":"addSig","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xfa3d1325"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getSig","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x893182ff"}]';

let web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/"));
const addressFrom = '0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c'
const privKey = process.env.privateKey
const addressTo = '0x0f2c3e140F8EC039785b3631F3C7c282ceb9c12e'
const contract = new web3.eth.Contract(
  JSON.parse(abi),
  addressTo
);

// change this to whatever contract method you are trying to call, E.G. SimpleStore("Hello World")
let filename = web3.utils.keccak256('mnist_cnn.py')
let filehash = '0xbadd11443db8a4074339c73a77141eded30b41422b6d4afa9d20e5389b1978af'
const tx = contract.methods.addSig(filename, filehash);
const encodedABI = tx.encodeABI();

function sendSigned(txData, cb) {
  const privateKey = new Buffer(privKey, 'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}

// get the number of transactions sent so far so we can create a fresh nonce
web3.eth.getTransactionCount(addressFrom).then(txCount => {

  // construct the transaction data
  const txData = {
    nonce: web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(6000000),
    gasPrice: web3.utils.toHex(10000000000), // 10 Gwei
    to: addressTo,
    from: addressFrom,
    data: encodedABI
  }

  // fire away!
  sendSigned(txData, function(err, result) {
    if (err) return console.log('error', err)
    console.log('sent', result)
  })

})
