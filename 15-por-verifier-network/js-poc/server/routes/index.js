const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const models = require('../model')

router.get('/', function (req, res, next) {
    res.status(400)
    next(null, req, res, next)
  })
  
// register a specific user as the verifier
router.post('/api/v1/verifier', bodyParser.json(), models.addVerifier)

// check status of a specific verifier
router.get('/api/v1/verifier', bodyParser.json(), models.queryVerifier)

// request por challenge
router.post('/api/v1/request', bodyParser.json(), models.requestPOR)

// get tx event - request por event
router.get('/api/v1/tx', bodyParser.json(), models.getRequestTx)

// submit signature
router.post('/api/v1/submit', bodyParser.json(), models.submitSig)

// resolve challenge
router.post('/api/v1/resolve', bodyParser.json(), models.resolve)

// check status of challenge using did
router.post('/api/v1/check', bodyParser.json(), models.queryStatus)

module.exports = router