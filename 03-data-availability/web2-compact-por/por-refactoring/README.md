[![banner](https://raw.githubusercontent.com/oceanprotocol/art/master/github/repo-banner%402x.png)](https://oceanprotocol.com)

# POR refactoring
```
name: PoC of POR
type: research
status: updated draft
editor: Fang Gong <fang@oceanprotocol.com>
date: 06/03/2019
```



## 1. Folder Structure

* "pkg": library files for `provider`, `verifier`, `storage` roles;
* "src": 
	* source code of libraries in sub folders
	* `main.go` is the driver function including all actions from different roles.

**Go Version**

```
$ go version
go version go1.12.5 darwin/amd64
```

## 2. Import Library

import library files in the `pkg` folder into the code:

```go
import (
	provider "provider"
	verifier "verifier"
	storage  "storage"
)
```

invoke functions of different roles as:

```
	// step 1: provider sign and generate authenticators
	provider.St(ssk, file, s, n, tau_file, auth_file, sample_file)

	// step 2: verifier generate the challenge
	verifier.Challenge(l, tau_file, spk_file, challenge_file)

	// Step 3: storage generates the proof
	storage.Prove(sample_file, challenge_file, auth_file, spk_file, proof_file, fileName)

	// Step 4: verifier needs to verify the proof
	yes := verifier.Verify(sample_file, tau_file, challenge_file, proof_file, spk_file)
```

## 3. How To Run

```
$ cd src
$ go run main.go
```

It should run like below:

```
$ go run main.go
Generating RSA keys...
key pair exsits!
Private Key Loaded!
Generated!
data4.txt size = 111 MB and will be split into 11 blocks (blocksize := 10000000 bytes)
Step 1: (provider) Signing file...Signed!
Step 2: (verifier) Generating challenge...Generated!
Step 3: (storage) Issuing proof...Issued!
Step 4: (verifier) Verifying proof...Verified!
Result: true!
Total runtime is: 14.097049579s
```


## 4. Optimization

* `provider.go`: Read blocks from data file concurrently to save time and space (rather than load entire file at one time)

```go
// setup buffer chucks for reading file
	chunksizes := make([]chunk, n)

	// All buffer sizes are the same in the normal case. Offsets depend on the
	// index. Second go routine should start at 100, for example, given our
	// buffer size of 100.
	for i := int64 (0); i < n; i++ {
		chunksizes[i].bufsize = s
		chunksizes[i].offset = int64(s * i)
	}

	sigmas := make([]*big.Int, n)
	sem := make(chan byte, n);
	for i := int64 (0); i < n; i++ {
		go func(chunksizes []chunk, i int64) {
			// read data block into local buffer
			chunk := chunksizes[i]
	    	buffer := make([]byte, s)
	    	file.ReadAt(buffer, chunk.offset)
			// calculate authenticator
			sigmas[i] = GenerateAuthenticator(sample, tau, i, s, tau_zero, buffer, ssk)
			sem <- 0;
		} (chunksizes, i)
	}
```

* `provider.go`: Compute `tau_zero.U` only for randomly chosen bytes

```go
tau_zero.U = make([]big.Int, s)
	for i := int64 (0); i < sample.NumBytes; i++ {
		k := sample.Idx[i]
		result, err := rand.Int(rand.Reader, ssk.PublicKey.N)
		if err != nil {
			panic(err)
		}
		tau_zero.U[k] = *result
	}
```

* `storage.go`: only read blocks from raw data file that were chosen to be checked

```go
for j := int64 (0); j < sample.NumBytes; j++ {
	k := sample.Idx[j]
	mu_k := big.NewInt(0)
    for _, qelem := range q {
      	// read data block into buffer
	   buffer := make([]byte, s)
	   file.ReadAt(buffer, int64(s * (qelem.I - 1)))
      	// calculate proof
		char := new(big.Int).SetBytes([]byte{buffer[k]})
		product := new(big.Int).Mul(new(big.Int).SetInt64(qelem.V), char)
		mu_k.Add(mu_k, product)
	}
	proof.Mu[k] = *mu_k
}
```





	
 