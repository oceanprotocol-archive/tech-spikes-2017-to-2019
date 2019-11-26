let Web3 = require("web3");
const Tx = require('ethereumjs-tx').Transaction

var abi = '[{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_did","type":"bytes32"},{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"nftMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_did","type":"bytes32"},{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"nftBurnt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_did","type":"bytes32"},{"indexed":true,"name":"_erc20Token","type":"address"}],"name":"erc20Created","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_did","type":"bytes32"},{"indexed":true,"name":"_amount","type":"uint256"}],"name":"erc20Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_did","type":"bytes32"},{"indexed":true,"name":"_amount","type":"uint256"}],"name":"erc20Burnt","type":"event"},{"constant":false,"inputs":[{"name":"_did","type":"bytes32"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"}],"name":"mintNFT","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_did","type":"bytes32"}],"name":"burnNFT","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_did","type":"bytes32"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_price","type":"uint256"}],"name":"createERC20","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_did","type":"bytes32"}],"name":"mintERC20","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_did","type":"bytes32"},{"name":"_amount","type":"uint256"}],"name":"burnERC20","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_did","type":"bytes32"}],"name":"getNFTaddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_did","type":"bytes32"}],"name":"getERC20address","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]'

let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0"));
// the address that will send the test transaction
const addressFrom = '0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c'
const privKey = process.env.privateKey
// the destination address
const addressTo = '0x207C549Dc8f7Da40BAb3f2FfD7Bb16c0e5e34809'
const contract = new web3.eth.Contract(
  JSON.parse(abi),
  addressTo
);

async function call(transaction) {
    return await transaction.call({from: addressFrom});
}

async function checkNFTAddress() {
    let tokenAddress = await call(contract.methods.getNFTaddress('0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'));
    console.log("NFT token address is :=" + tokenAddress)
}

checkNFTAddress()