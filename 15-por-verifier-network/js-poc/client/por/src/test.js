const fetch = require('node-fetch');

const apiUrl = "http://localhost:8000"
const contract_address = "0x511c6De67C4d0c3B6eb0AF693B226209E45e025A"
const user_address = "0xd829a30ef7f5778b0f09f4fe6508d31b56cd40db"
const privateKey = "8d8ef98e5ce2cea2422e39d906595e18af2f2d676ca89e4322efcf03a4595a72"
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
