
package verifier;

import (
	"bytes"
	"crypto"
  "crypto/x509"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"encoding/gob"
  "encoding/binary"
  "encoding/json"
  "encoding/pem"
	"math/big"
  "io/ioutil"
  "os"
  "fmt"
  "bufio"
)

type Tau_zero struct {
	Name []byte 		`json:"hashname"`
	N    int64			`json:"nblocks"`
	U    []big.Int 	`json:"random"`
}

type Tau struct {
	Tau_zero					`json:"tau0"`
	Signature []byte	`json:"signature"`
}

type QElement struct {
	I int64   `json:"I"`
	V int64   `json:"V"`
}

type Sample struct {
	Szblock int64				`json:"blocksize"`
	NumBytes  int64				`json:"NumBytes"`
	Idx    []int64			`json:"bytesindex"`
}

type ProofData struct {
  Mu    []big.Int 	`json:"mu"`
  Sigma big.Int     `json:"sigma"`
}

// load public key from the PEM file
func LoadSpk(spk_file string) (*rsa.PublicKey) {

  spkFile, err := os.Open(spk_file)
  if err != nil {
    fmt.Println(err)
    os.Exit(1)
  }
  // read data into buffer
  pemfileinfo, _ := spkFile.Stat()
  var size int64 = pemfileinfo.Size()
  pembytes := make([]byte, size)
  buffer := bufio.NewReader(spkFile)
  _, err = buffer.Read(pembytes)
  data, _ := pem.Decode([]byte(pembytes))
  spkFile.Close()
  // load public key
  spk, err := x509.ParsePKCS1PublicKey(data.Bytes)
  if err != nil {
      fmt.Println(err)
      os.Exit(1)
  }
  return spk
}

// verifier generates a challenge and send it to storage for verification
func Challenge(l int64, tau_file string, spk_file string, challenge_file string) {
  // read tau data struct
  tauFile, _ := ioutil.ReadFile(tau_file)
  tau := Tau{}
  _ = json.Unmarshal([]byte(tauFile), &tau)
  // read public key from file
  spk := LoadSpk(spk_file)

	// sign the tau information
	var tau_zero_bytes bytes.Buffer
	enc := gob.NewEncoder(&tau_zero_bytes)
	err := enc.Encode(tau.Tau_zero.U)
	if err != nil {
		panic(err)
	}
	hashed_t_0 := sha512.Sum512(tau_zero_bytes.Bytes())
	err = rsa.VerifyPKCS1v15(spk, crypto.SHA512, hashed_t_0[:], tau.Signature)
	if err != nil {
		panic(err)
	}

	// l := int64 (2)
	n_bigint := big.NewInt(tau.Tau_zero.N)
  ret := make([]QElement, l)
	for i := int64 (0); i < l; i++ {
		I_bignum := new(big.Int)
		for {
			I_bignum, err = rand.Int(rand.Reader, n_bigint)
			if err != nil {
				panic(err)
			}
			if I_bignum.Cmp(big.NewInt(0)) == +1 {
				break
			}
		}
		ret[i].I = I_bignum.Int64()

		Q_bignum := new(big.Int)
		for {
			Q_bytes := make([]byte, 4)
			_, err = rand.Read(Q_bytes)
			if err != nil {
				panic(err)
			}
			Q_bignum = new(big.Int).SetBytes(Q_bytes)
			if Q_bignum.Cmp(big.NewInt(0)) == +1 {
				break
			}
		}
		ret[i].V = Q_bignum.Int64()
	}
  // write challenge into JSON file
	jsonFile, err := os.Create(challenge_file)
  if err != nil {
  		panic(err)
  }
	defer jsonFile.Close()

	retData, err := json.Marshal(ret)
  jsonFile.Write(retData)
  jsonFile.Close()
}

// generate hash of name
func hashNameI(name []byte, i int64) *big.Int {
	i_bytes := make([]byte, 4)
	binary.PutVarint(i_bytes, i)
	hashArgument := append(name, i_bytes...)
	hash_array := sha512.Sum512(hashArgument)
	return new(big.Int).SetBytes(hash_array[:])
}

// verifier validates the proofs from the storage to verify the por
func Verify(sample_file string, tau_file string, challenge_file string, proof_file string, spk_file string) bool {
  // read sample data struct
  sampleFile, _ := ioutil.ReadFile(sample_file)
  sample := Sample{}
  _ = json.Unmarshal([]byte(sampleFile), &sample)
  // read tau data struct
  tauFile, _ := ioutil.ReadFile(tau_file)
  tau := Tau{}
  _ = json.Unmarshal([]byte(tauFile), &tau)
  // read challenge file
  challengeFile, _ := ioutil.ReadFile(challenge_file)
  q := []QElement{}
  _ = json.Unmarshal([]byte(challengeFile), &q)
  // load proof from file
  proofFile, _ := ioutil.ReadFile(proof_file)
  proof := ProofData{}
  _ = json.Unmarshal([]byte(proofFile), &proof)
  // read public key from file
  spk := LoadSpk(spk_file)

	first := new(big.Int).SetInt64(1)
  for _, qelem := range q {
		hash := hashNameI(tau.Tau_zero.Name, qelem.I)
		hash.Exp(hash, new(big.Int).SetInt64(qelem.V), spk.N)
		first.Mul(first, hash)
	}
	first.Mod(first, spk.N)

	second := new(big.Int).SetInt64(1)
	for j := int64 (0); j < sample.NumBytes; j++ {
		k := sample.Idx[j]
		second.Mul(second, new(big.Int).Exp(&tau.Tau_zero.U[k], &proof.Mu[k], spk.N))
	}
	second.Mod(second, spk.N)

	return new(big.Int).Mod(new(big.Int).Mul(first, second), spk.N).Cmp(new(big.Int).Exp(&proof.Sigma, new(big.Int).SetInt64(int64 (spk.E)), spk.N)) == 0
}
