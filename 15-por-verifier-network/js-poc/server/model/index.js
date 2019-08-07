const eth = require('../util/eth.js');
const async = require('async');
const crypto = require('crypto');
const sha256 = require('sha256');
const Web3 = require('web3');
const config = require('../config')
const pty = require('node-pty');
const os = require('os');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

var contract_address = config.contract_address

const models = {
    spawnProcess() {
        return pty.spawn(shell, [], {
          name: 'xterm-color',
          cols: 8000,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });
      },

    // query getRequestTx events 
    getRequestTx(req, res, next) {
        console.log("query event message of por request")

        eth.getRequestTx(contract_address, (err, did) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true, 'result': did }
            return next(null, req, res, next)
        })
    },

    // query status of a verifier
    queryVerifier(req, res, next) {
        console.log("query status of a verifier")
        const {
            user_address
        } = req.body

        eth.queryVerifier(contract_address, user_address, (err, state) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }

            const returnObj = {
                state: state,
                address: user_address
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true, 'result': returnObj }
            return next(null, req, res, next)
        })
    },

    // add status of a verifier
    addVerifier(req, res, next) {
        console.log("add a new verifier")
        const {
            user_address,
            privateKey
            } = req.body
 
        eth.addVerifier(contract_address, privateKey, user_address, (err, state) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true }
            return next(null, req, res, next)
        })
    },

    // request a por verification
    requestPOR(req, res, next) {
        console.log("request a por verification")
        const {
            user_address,
            privateKey,
            did
            } = req.body

        eth.requestPOR(contract_address, privateKey, user_address, did, (err, state) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true }
            return next(null, req, res, next)
        })
    },

    verifyPOR(callback) {
        const ptyProcess = models.spawnProcess()
    
        ptyProcess.on('data', function(data) {
            process.stdout.write(data);

            if(data.includes("true")) {
                callback(null, true)
                ptyProcess.write('exit\r');
            }
            
            if(data.includes("false")) {
                callback(data)
                ptyProcess.write('exit\r');
            }

        });
    
        ptyProcess.write('cd '+config.goPath+'\r');
        ptyProcess.write('./go run '+config.filePath+'\r');
        ptyProcess.write('exit\r');
      },

    // submit signature
    submitSig(req, res, next) {
        // run go function to test the por before submit signature
        models.verifyPOR((err, result) => {
            if(err) {
              console.log(err)
              res.status(500)
              res.body = { 'status': 500, 'success': false, 'result': err }
              return next(null, req, res, next)
            }

            // res.status(205)
            // res.body = { 'status': 200, 'success': true }
            // return next(null, req, res, next)
            
            console.log("submit signature as por is successful")
            const {
                user_address,
                privateKey,
                did
                } = req.body

            eth.submitSig(contract_address, privateKey, user_address, did, (err, state) => {
                if(err) {
                    console.log(err)
                    res.status(500)
                    res.body = { 'status': 500, 'success': false, 'result': err }
                    return next(null, req, res, next)
                }
        
                res.status(205)
                res.body = { 'status': 200, 'success': true }
                return next(null, req, res, next)
            })
        })
    },

    // resolve a challenge
    resolve(req, res, next) {
        console.log("resolve a challenge")
        const {
            user_address,
            privateKey,
            did
            } = req.body

        eth.resolve(contract_address, privateKey, user_address, did, (err, state) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true }
            return next(null, req, res, next)
        })
    },

    // query status of a challenge
    queryStatus(req, res, next) {
        console.log("query status of a challenge")
        const {
            user_address,
            did
        } = req.body

        eth.queryVerification(contract_address, user_address, did, (err, state) => {
            if(err) {
                console.log(err)
                res.status(500)
                res.body = { 'status': 500, 'success': false, 'result': err }
                return next(null, req, res, next)
            }

            const returnObj = {
                state: state,
                address: user_address
            }
    
            res.status(205)
            res.body = { 'status': 200, 'success': true, 'result': returnObj }
            return next(null, req, res, next)
        })
    },

}

module.exports = models