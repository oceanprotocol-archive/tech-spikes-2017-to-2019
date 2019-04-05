//import Binance from 'binance-api-node'
const Binance = require('binance-api-node').default
let Web3 = require("web3");
const Tx = require('ethereumjs-tx')

// global variables
var linkPrice, ethPrice, simulatedGain, iter, status


var linkABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]'

var uniswapABI = '[{"name": "TokenPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "eth_sold", "indexed": true}, {"type": "uint256", "name": "tokens_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "EthPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "tokens_sold", "indexed": true}, {"type": "uint256", "name": "eth_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "AddLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "RemoveLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "Transfer", "inputs": [{"type": "address", "name": "_from", "indexed": true}, {"type": "address", "name": "_to", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "Approval", "inputs": [{"type": "address", "name": "_owner", "indexed": true}, {"type": "address", "name": "_spender", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "setup", "outputs": [], "inputs": [{"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 175875}, {"name": "addLiquidity", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_liquidity"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 82605}, {"name": "removeLiquidity", "outputs": [{"type": "uint256", "name": "out"}, {"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "amount"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 116814}, {"name": "__default__", "outputs": [], "inputs": [], "constant": false, "payable": true, "type": "function"}, {"name": "ethToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 12757}, {"name": "ethToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 12965}, {"name": "ethToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 50463}, {"name": "ethToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 50671}, {"name": "tokenToEthSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 47503}, {"name": "tokenToEthTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 47712}, {"name": "tokenToEthSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 50175}, {"name": "tokenToEthTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 50384}, {"name": "tokenToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51007}, {"name": "tokenToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51098}, {"name": "tokenToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 54928}, {"name": "tokenToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 55019}, {"name": "tokenToExchangeSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49342}, {"name": "tokenToExchangeTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49532}, {"name": "tokenToExchangeSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53233}, {"name": "tokenToExchangeTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53423}, {"name": "getEthToTokenInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5542}, {"name": "getEthToTokenOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6872}, {"name": "getTokenToEthInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5637}, {"name": "getTokenToEthOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6897}, {"name": "tokenAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413}, {"name": "factoryAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1443}, {"name": "balanceOf", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}], "constant": true, "payable": false, "type": "function", "gas": 1645}, {"name": "transfer", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 75034}, {"name": "transferFrom", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 110907}, {"name": "approve", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_spender"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 38769}, {"name": "allowance", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}, {"type": "address", "name": "_spender"}], "constant": true, "payable": false, "type": "function", "gas": 1925}, {"name": "name", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1623}, {"name": "symbol", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1653}, {"name": "decimals", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1683}, {"name": "totalSupply", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1713}]'

let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/Kuo1lxDBsFtMnaw6GiN2"));
const addressFrom = '0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c'
const privKey = process.env.privateKey
const DEADLINE = 1742680400
// the exchange contract address of LINK token
const uniswapAddr = '0x094AeF967D361E2aE3Af472718e231DC9134724F'
const linkTokenAddr ='0x01BE23585060835E02B77ef475b0Cc51aA1e0709'
const uniswapContract = new web3.eth.Contract(JSON.parse(uniswapABI), uniswapAddr);
const linkContract = new web3.eth.Contract(JSON.parse(linkABI), linkTokenAddr);

const client = Binance()
// Authenticated client, can make signed calls
const client2 = Binance({
  apiKey: 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A',
  apiSecret: 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j',
})

function wait(ms) {
    const start = new Date().getTime()
    let end = start
    while (end < start + ms) {
        end = new Date().getTime()
    }
}

function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
}

/*
 @notice Convert ETH to Tokens.
 @dev User specifies exact input (msg.value) and minimum output.
 @param min_tokens Minimum Tokens bought.
 @param deadline Time after which this transaction can no longer be executed.
 @return Amount of Tokens bought.
*/
function ethToTokenSwapInputTx(minTokenOut){
  let tx = uniswapContract.methods.ethToTokenSwapInput(minTokenOut, DEADLINE)
  let encodedABI = tx.encodeABI();
  return encodedABI
}

/*
# @notice Convert ETH to Tokens.
# @dev User specifies maximum input (msg.value) and exact output.
# @param tokens_bought Amount of tokens bought.
# @param deadline Time after which this transaction can no longer be executed.
# @return Amount of ETH sold.
*/
function ethToTokenSwapOutput(tokens_bought){
  let tx = uniswapContract.methods.ethToTokenSwapOutput(tokens_bought, DEADLINE)
  let encodedABI = tx.encodeABI();
  return encodedABI
}

/*
# @notice Convert Tokens to ETH.
# @dev User specifies exact input and minimum output.
# @param tokens_sold Amount of Tokens sold.
# @param min_eth Minimum ETH purchased.
# @param deadline Time after which this transaction can no longer be executed.
# @return Amount of ETH bought.
*/
function tokenToEthSwapInput(tokens_sold, min_eth){
  let tx = uniswapContract.methods.tokenToEthSwapInput(tokens_sold, min_eth, DEADLINE)
  let encodedABI = tx.encodeABI();
  return encodedABI
}

/*
# @notice Convert Tokens to ETH.
# @dev User specifies maximum input and exact output.
# @param eth_bought Amount of ETH purchased.
# @param max_tokens Maximum Tokens sold.
# @param deadline Time after which this transaction can no longer be executed.
# @return Amount of Tokens sold.
*/
function tokenToEthSwapOutput(eth_bought, max_tokens){
  let tx = uniswapContract.methods.tokenToEthSwapOutput(eth_bought, max_tokens, DEADLINE)
  let encodedABI = tx.encodeABI();
  return encodedABI
}



// Signs the given transaction data and sends it.
function sendSigned(txData, cb) {
  const privateKey = new Buffer(privKey, 'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}


function swapSellPrice(input_amount, input_reserve, output_reserve) {
  let input_amount_with_fee = input_amount * 997
  let numerator = input_amount_with_fee * output_reserve
  let denominator = input_reserve * 1000 + input_amount_with_fee
  return numerator / denominator
}

function swapBuyPrice(output_amount, input_reserve, output_reserve){
  let numerator = input_reserve * output_amount * 1000
  let denominator = (output_reserve - output_amount) * 997
  return numerator / denominator + 1
}


async function getLINKPrice() {
  let link = await client.avgPrice({ symbol: 'LINKUSDT' })
  //console.log(link)
  return link
}

async function getETHPrice() {
  eth = await client.avgPrice({ symbol: 'ETHUSDT' })
  //console.log(eth)
  return eth
}

async function fireUniswapEtherTx(encodedABI, eth_sold) {
  // get the number of transactions sent so far so we can create a fresh nonce
  let txCount = await web3.eth.getTransactionCount(addressFrom)
  console.log('fireUniswapEtherTx get txCount := ' + txCount)

  // construct the transaction data
  const txData = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(6000000),
      gasPrice: web3.utils.toHex(10000000000),
      to: uniswapAddr,
      from: addressFrom,
      data: encodedABI,
      value: eth_sold
  }

  // fire away!
  sendSigned(txData, function(err, result) {
      if (err) return console.log('error', err)
      console.log('sent', result)
  })
}

async function fireTx(encodedABI, toAddress) {
  // get the number of transactions sent so far so we can create a fresh nonce
  let txCount = await web3.eth.getTransactionCount(addressFrom)
  //console.log('fireTx get txCount := ' + txCount)

  // construct the transaction data
  const txData = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(6000000),
      gasPrice: web3.utils.toHex(10000000000),
      to: toAddress,
      from: addressFrom,
      data: encodedABI
  }

  // fire away!
  sendSigned(txData, function(err, result) {
      if (err) return console.log('error', err)
      console.log('sent', result)
  })
  //return new Promise(resolve => {})
}

async function sellToken(token_sold) {
  // approve exchange contract to withdraw erc20 tokens
  let tx = linkContract.methods.approve(uniswapAddr, token_sold);
  await fireTx(tx.encodeABI(), linkContract.address)
  // fire the exchange tx to uniswap
  let encodedABI = tokenToEthSwapInput(token_sold, 1)
  await fireTx(encodedABI, uniswapContract.address)
}

async function buyToken(eth_sold){
  let encodedABI = ethToTokenSwapInputTx(1)
  await fireUniswapEtherTx(encodedABI, eth_sold)
  //return new Promise(resolve => {})
}


async function run() {
  iter = 0
  simulatedGain = 0
  status = 0
  while(iter < 1) {
  console.log('\nIteration ' + iter + ' at Time: ' + getFormattedDate())

  console.log('Step 1: get quote of LINK token price from Binance')
  // step 1: get LINK price (in unit of USDT) from Binance Exchange
  let linkObject= await getLINKPrice();
  linkPrice = linkObject[Object.keys(linkObject)[1]];

  // step 2: get ETH price (in unit of USDT)
  let ethObject = await getETHPrice();
  ethPrice = ethObject[Object.keys(ethObject)[1]];

  // step 3: calculate LINK token price in ETH quoted from Binance
  let binanceLinkEth =  linkPrice / ethPrice
  console.log('LINK token price :=' + binanceLinkEth + ' Ether in Binance')

  console.log('\nStep 2: get quote of LINK token price from Uniswap')
  // step 4: get LINK token reservce of Uniswap
  let linkReserve = await linkContract.methods.balanceOf(uniswapAddr).call()
  console.log('Uniswap LINK exchange contract has LINK token reserve := ' + linkReserve/1e18)

  // step 5: get ETH token reserve of Uniswap
  let etherReserve = await web3.eth.getBalance(uniswapAddr)
  console.log('Uniswap LINK exchange contract has ETH reserve := ' + etherReserve/1e18)

  // quote the sell price of 1 LINK token (put in LINK, get Ether out)
  let sellPrice = swapSellPrice(1 * 1e18, linkReserve, etherReserve) / 1e18
  //let reserve = await linkContract.methods.balanceOf(addressFrom).call()
  console.log('Uniswap exchange offers SELL price of LINK token := ' + sellPrice)

  let buyPrice = swapBuyPrice(1 * 1e18, etherReserve, linkReserve) / 1e18
  console.log('Uniswap exchange offers BUY price of LINK token := ' + buyPrice)
  //wait(1000)

  // Trading Engine
  // Step 6: if Binance has higher price -> buy from Uniswap and sell into Binance
  if(binanceLinkEth > buyPrice){
    console.log('\nStep3: It is time to buy from Uniswap and sell into Binance...')
    // convert ETH to LINK token
    let amount = Math.round(10 * buyPrice * 1e18)
    const eth_sold = web3.utils.toHex(amount) // each time buy 10 LINK token from Uniswap
    await buyToken(eth_sold)
    console.log('buy 10 LINK token from Uniswap with ETH cost :=' + amount / 1e18)

    /*
    // deposit LINK token address
    let depositAddress = await client2.depositAddress({ asset: 'LINK' })
    await linkContract.methods.transfer(depositAddress, 10)
    await client2.order({symbol: 'LINKUSDT', side: 'SELL', quantity: 10})
    let eth_bought = 10 * linkPrice / ethPrice
    await client2.order({symbol: 'USDTETH', side: 'BUY', quantity: eth_bought,})
    await client2.withdraw({ asset: 'ETH', address: addressFrom, amount: eth_bought })
    */
    console.log('Sell 10 LINK tokens into Binance to get ETH := ' + binanceLinkEth * 10)

    simulatedGain = simulatedGain + binanceLinkEth * 10 - 10 * buyPrice
    console.log('tradingbot makes a profit :=' + simulatedGain + ' ETH')
  }

  // Step 7: if Binance has lower price -> buy from Binance and sell into Uniswap
  // each time sell 10 LINK tokens into Uniswap
  if (binanceLinkEth < sellPrice){
    console.log('\nStep 3: It is time to buy from Binance and sell into Uniswap...')
    /*
    // deposit ETH in Binance for purchase
    let depositAddress = await client2.depositAddress({ asset: 'ETH' })
    await web3.sendTransaction({to: depositAddress, from: addressFrom, value:web3.toWei(binanceLinkEth * 10 * 1e18, "ether")})
    await client2.order({symbol: 'ETHUSDT', side: 'SELL', quantity: binanceLinkEth * 10 * 1e18})
    await client2.order({symbol: 'USDTLINK', side: 'BUY', quantity: 10})
    await client2.withdraw({ asset: 'LINK', address: addressFrom, amount: 10 })
    */
    console.log('buy 10 LINK tokens from Binance with ETH cost:= ' + binanceLinkEth * 10);

    // convert LINK token to ETH
    let etherBefore = await web3.eth.getBalance(addressFrom)
    let token_sold = web3.utils.toHex(10*10**18)
    await sellToken(token_sold)
    let etherAfter = await web3.eth.getBalance(addressFrom)
    let proceeds = etherAfter - etherBefore
    console.log('sell 10 LINK tokens into Uniswap to ETH proceeds:= ' + sellPrice * 10)

    simulatedGain = simulatedGain + sellPrice * 10 - binanceLinkEth * 10
    console.log('tradingbot makes a profit: ' + simulatedGain + ' ETH')
  }
  iter++
  console.log('---------------------------------------------------')
} // end of while

}

run()
