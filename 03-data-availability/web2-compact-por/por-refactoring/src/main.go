/*
Package main implements driver functions for all roles in POR process.
It import three libraries: "provider", "verifier", and "storage"
*/

package main;

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
  "encoding/pem"
	"fmt"
	"bufio"
	"os"
	"time"
	"math"
  provider "provider"
	verifier "verifier"
	storage  "storage"
)


// load private key from the PEM file
// input: private key PEM file
// output: private key variable "*rsa.PrivateKey"
func LoadSsk(ssk_file string) (*rsa.PrivateKey) {
  sskFile, err := os.Open(ssk_file)
  if err != nil {
    fmt.Println(err)
    os.Exit(1)
  }
  // read data into buffer
  pemfileinfo, _ := sskFile.Stat()
  var size int64 = pemfileinfo.Size()
  pembytes := make([]byte, size)
  buffer := bufio.NewReader(sskFile)
  _, err = buffer.Read(pembytes)
  data, _ := pem.Decode([]byte(pembytes))
  sskFile.Close()
  // load private key
  ssk, err := x509.ParsePKCS1PrivateKey(data.Bytes)
  if err != nil {
      fmt.Println(err)
      os.Exit(1)
  }
	fmt.Printf("Private Key Loaded!\n")
  return ssk
}

// generate new key pair if there is no PEM file exist
// input: PEM filenames of RSA key pairs
// output: new PEM files if there is no existing keys
func Keygen(ssk_file string, spk_file string) {
	if _, err := os.Stat(ssk_file); os.IsNotExist(err) {
		ssk, err := rsa.GenerateKey(rand.Reader, 1024)
		if err != nil {
			panic(err)
		}
		// save public key into PEM file
		pemPublicFile, err := os.Create(spk_file)
		if err != nil {
		    fmt.Println(err)
		    os.Exit(1)
		}
		var pemPublicBlock = &pem.Block{
	    Type:  "RSA PUBLIC KEY",
	    Bytes: x509.MarshalPKCS1PublicKey(&ssk.PublicKey),
		}
		err = pem.Encode(pemPublicFile, pemPublicBlock)
		if err != nil {
		    fmt.Println(err)
		    os.Exit(1)
		}
		pemPublicFile.Close()
		// save private key into PEM file
		pemPrivateFile, err := os.Create(ssk_file)
		if err != nil {
		    fmt.Println(err)
		    os.Exit(1)
		}
		var pemPrivateBlock = &pem.Block{
	    Type:  "RSA PRIVATE KEY",
	    Bytes: x509.MarshalPKCS1PrivateKey(ssk),
		}
		err = pem.Encode(pemPrivateFile, pemPrivateBlock)
		if err != nil {
		    fmt.Println(err)
		    os.Exit(1)
		}
		pemPrivateFile.Close()
		fmt.Printf("new key pair generated!\n")
	} else {
		fmt.Printf("key pair exsits!\n")
	}
}

// each role communicate with other participants with JSON files
// provider: sign the dataset
// verifier: (1) generate challenge; (2) verify the proof
// storage: generate proof using the received challenge
func main() {
	now := time.Now()
	// set file names
	fileName := "data3.txt"
	tau_file := "tau.json"
	auth_file := "auth.json"
	spk_file := "spk.pem"
	ssk_file := "ssk.pem"
	sample_file := "sample.json"

	// provider generate key pairs or load existing key pairs
	fmt.Printf("Generating RSA keys...\n")
	Keygen(ssk_file, spk_file)
	ssk := LoadSsk(ssk_file)
	fmt.Printf("Generated!\n")

	fmt.Printf(fileName)

	file, err := os.Open(fileName)
	if err != nil {
		panic(err)
	}
	fileInfo, err := file.Stat()
	size := fileInfo.Size()
	fmt.Printf(" size = %v MB", size / 1e6)

	// step 1: provider sign and generate authenticators
	// Parameters: "s": block-size, "n": number-bytes-to-check
	s := int64 (1000000)
	n := int64(1)
	fmt.Printf(" and will be split into %v blocks (blocksize := %v bytes)\n", int64 (math.Ceil(float64 (size / s))), s)
	fmt.Printf("Step 1: (provider) Signing file...")
	provider.St(ssk, file, s, n, tau_file, auth_file, sample_file)
	fmt.Printf("Signed!\n")

	// step 2: verifier generate the challenge
	fmt.Printf("Step 2: (verifier) Generating challenge...")
	challenge_file := "challenge.json"
	// number of blocks to check in one challenge (l < num_of_blocks)
	l := int64(2)
	verifier.Challenge(l, tau_file, spk_file, challenge_file)
	fmt.Printf("Generated!\n")

	// Step 3: storage generates the proof
	fmt.Printf("Step 3: (storage) Issuing proof...")
	proof_file := "proof.json"
	storage.Prove(sample_file, challenge_file, auth_file, spk_file, proof_file, fileName)
	fmt.Printf("Issued!\n")

	// Step 4: verifier needs to verify the proof
	fmt.Printf("Step 4: (verifier) Verifying proof...")
	yes := verifier.Verify(sample_file, tau_file, challenge_file, proof_file, spk_file)
	fmt.Printf("Verified!\n")

	// output the por verification result
	fmt.Printf("Result: %t!\n", yes)
	diff := "Total runtime is: "+time.Now().Sub(now).String()
  fmt.Printf(diff)
	fmt.Printf("\n")
	if yes {
		os.Exit(0)
	} else {
		os.Exit(1)
	}

}
