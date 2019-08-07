const fetch = require('node-fetch');

const apiUrl = "http://localhost:8000"
const contract_address = "0x2345d5788C876878a020a57526f1D1C9c6f753B6"
const user_address = "0x38b025b403871e95c2cc254374ee84fdad7ec2a9"
const privateKey = "8d6f328eab36bd8829c340868d72fb8c8f08b443e5fbfbdb365d8ca06c7ea6cb"
const did = 1

async function por(){
  // 1. add self to be verifier
  let body = {
    "contract_address" : contract_address,
	  "user_address" : user_address,
	  "privateKey" : privateKey
  };
  let response = await fetch(apiUrl + '/api/v1/verifier', {
    method: 'post',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
});
let res = await response.json();
if (res.status !== 200) 
  throw Error(res.message);
console.log("step 1: add self to be verifier: " + res.success)

// request por verification
body = { 
  "contract_address" : contract_address,
  "user_address" : user_address,
  "privateKey" : privateKey,
  "did" : did
};
response = await fetch(apiUrl + '/api/v1/request', {
  method: 'post',
  body:    JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});
res = await response.json();
if (res.status !== 200) 
throw Error(res.message);
console.log("step 2: request a por verification task: " + res.success)

// run go-lang code to verifiery por and submit signature
response = await fetch(apiUrl + '/api/v1/submit', {
  method: 'post',
  body:    JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});
res = await response.json();
if (res.status !== 200) 
throw Error(res.message);
console.log("step 3: run go function (por) and submit signature if success: " + res.success)

// resolv challenge
// run go-lang code to verifiery por and submit signature
response = await fetch(apiUrl + '/api/v1/resolve', {
  method: 'post',
  body:    JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});
res = await response.json();
if (res.status !== 200) 
throw Error(res.message);
console.log("step 4: resolve por challenge: " + res.success)

// check challenge status
body = { 
  "user_address" : user_address,
  "did" : did
};
response = await fetch(apiUrl + '/api/v1/check', {
  method: 'post',
  body:    JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});
res = await response.json();
if (res.status !== 200) 
throw Error(res.message);
console.log("step 5: check challenge status: " +  res.result.state)
}

por();
