const Web3 = require('web3');
const config = require('../config')

// web3 provider
var web3 = new Web3(new Web3.providers.HttpProvider(config.provider));

// abi file of smart contract
var abi = config.abi

const eth = {
  // get history events  
  getRequestTx(contractAddress, callback) {
    let myContract = new web3.eth.Contract(abi, contractAddress)

    myContract.getPastEvents('verificationRequested', {
      fromBlock: 0,
      toBlock: 'latest',
      //filter: { _to: depositAddress }
    })
    .then((events) => {
      const returnEvents = events.map((event) => {
        return event.returnValues._did
      })
      return callback(null, returnEvents)
    })
    .catch((err) => {
      console.log(err)
      // callback(err)
    });
  },

  getFinishTx(contractAddress, callback) {
    let myContract = new web3.eth.Contract(config.erc20ABI, contractAddress)

    myContract.getPastEvents('verificationFinished', {
      fromBlock: 0,
      toBlock: 'latest',
    //   filter: { _to: depositAddress, _from: accountAddress }
    })
    .then((events) => {
        const returnEvents = events.map((event) => {
          return {
            did: event.returnValues._did,
            state: event.returnValues._state,
          }
        })
        return callback(null, returnEvents)
      })
      .catch((err) => {
        console.log(err)
        // callback(err)
      });

  },

  // get state info from blockchain
  queryVerifier(contractAddress, user, callback) {
    let myContract = new web3.eth.Contract(abi, contractAddress)

    myContract.methods.queryVerifier(user).call({ from: user })
    .then((status) => {
      callback(null, status)
    })
    .catch(callback)
  },

  // get state info from blockchain
  queryChallengeStatus(contractAddress, did, callback) {
    let myContract = new web3.eth.Contract(abi, contractAddress)
    
    myContract.methods.queryVerification(did).call({ from: address })
    .then((status) => {
      callback(null, status)
    })
    .catch(callback)
  },

  // add a verifier
  async addVerifier(contractAddress, privateKey, userAddress, callback) {
    const consumerContract = new web3.eth.Contract(abi, contractAddress);
    const encodedABI = consumerContract.methods.addVerifier(userAddress).encodeABI();
    
    const tx = {
        userAddress,
        to: contractAddress,
        value: '0',
        gasPrice: web3.utils.toWei('25', 'gwei'),
        gas: 800000,
        chainId: 1,
        nonce: await web3.eth.getTransactionCount(userAddress,'pending'),
        data: encodedABI
      }
  
      const signed = await web3.eth.accounts.signTransaction(tx, privateKey)
      const rawTx = signed.rawTransaction
  
      const sendRawTx = rawTx =>
        new Promise((resolve, reject) =>
          web3.eth
            .sendSignedTransaction(rawTx)
            .on('transactionHash', resolve)
            .on('error', reject)
        )
  
      const result = await sendRawTx(rawTx).catch((err) => {
        return err
      })
  
      if(result.toString().includes('error')) {
        callback(result, null)
      } else {
        callback(null, result.toString())
      }
  },

  // add a verifier
  async requestPOR(contractAddress, privateKey, from, did, callback) {
    const consumerContract = new web3.eth.Contract(abi, contractAddress);
    const encodedABI = consumerContract.methods.requestPOR(did).encodeABI();
    
    const tx = {
        from,
        to: contractAddress,
        value: '0',
        gasPrice: web3.utils.toWei('25', 'gwei'),
        gas: 800000,
        chainId: 1,
        nonce: await web3.eth.getTransactionCount(from,'pending'),
        data: encodedABI
      }
  
      const signed = await web3.eth.accounts.signTransaction(tx, privateKey)
      const rawTx = signed.rawTransaction
  
      const sendRawTx = rawTx =>
        new Promise((resolve, reject) =>
          web3.eth
            .sendSignedTransaction(rawTx)
            .on('transactionHash', resolve)
            .on('error', reject)
        )
  
      const result = await sendRawTx(rawTx).catch((err) => {
        return err
      })
  
      if(result.toString().includes('error')) {
        callback(result, null)
      } else {
        callback(null, result.toString())
      }
  },
  

  // submit signature
  async submitSig(contractAddress, privateKey, from, did, callback) {
    const consumerContract = new web3.eth.Contract(abi, contractAddress);
    const encodedABI = consumerContract.methods.submitSignature(did).encodeABI();
    
    const tx = {
        from,
        to: contractAddress,
        value: '0',
        gasPrice: web3.utils.toWei('25', 'gwei'),
        gas: 800000,
        chainId: 1,
        nonce: await web3.eth.getTransactionCount(from,'pending'),
        data: encodedABI
      }
  
      const signed = await web3.eth.accounts.signTransaction(tx, privateKey)
      const rawTx = signed.rawTransaction
  
      const sendRawTx = rawTx =>
        new Promise((resolve, reject) =>
          web3.eth
            .sendSignedTransaction(rawTx)
            .on('transactionHash', resolve)
            .on('error', reject)
        )
  
      const result = await sendRawTx(rawTx).catch((err) => {
        return err
      })
  
      if(result.toString().includes('error')) {
        callback(result, null)
      } else {
        callback(null, result.toString())
      }
  },

  // resolve a challenge
  async resolve(contractAddress, privateKey, from, did, callback) {
    const consumerContract = new web3.eth.Contract(abi, contractAddress);
    const encodedABI = consumerContract.methods.resolveChallenge(did).encodeABI();
    
    const tx = {
        from,
        to: contractAddress,
        value: '0',
        gasPrice: web3.utils.toWei('25', 'gwei'),
        gas: 800000,
        chainId: 1,
        nonce: await web3.eth.getTransactionCount(from,'pending'),
        data: encodedABI
      }
  
      const signed = await web3.eth.accounts.signTransaction(tx, privateKey)
      const rawTx = signed.rawTransaction
  
      const sendRawTx = rawTx =>
        new Promise((resolve, reject) =>
          web3.eth
            .sendSignedTransaction(rawTx)
            .on('transactionHash', resolve)
            .on('error', reject)
        )
  
      const result = await sendRawTx(rawTx).catch((err) => {
        return err
      })
  
      if(result.toString().includes('error')) {
        callback(result, null)
      } else {
        callback(null, result.toString())
      }
  },

  // get status of a challenge
  queryVerification(contractAddress, from, did, callback) {
    let myContract = new web3.eth.Contract(abi, contractAddress)

    myContract.methods.queryVerification(did).call({ from: from })
    .then((status) => {
      callback(null, status)
    })
    .catch(callback)
  },

}

module.exports = eth
