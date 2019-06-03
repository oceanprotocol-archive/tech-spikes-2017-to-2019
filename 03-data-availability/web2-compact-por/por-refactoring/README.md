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
data3.txt
Signing file 
>>filesize (bytes) :=214138
>>splitted blocks :=2141
>>each block size (bytes) :=100
Signed!
Generating challenge...
Generated!
Issuing proof...

>>filesize (bytes) :=214138
>>splitted blocks :=2141
>>each block size (bytes) :=100
Issued!
Verifying proof...
Result: true!
```



	
 