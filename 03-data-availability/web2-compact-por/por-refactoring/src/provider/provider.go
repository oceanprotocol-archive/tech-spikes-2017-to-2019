
package provider;

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha512"
	"encoding/binary"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	"os"
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

type Sample struct {
	Szblock int64				`json:"blocksize"`
	NumBytes  int64			`json:"NumBytes"`
	Idx    []int64			`json:"bytesindex"`
}

// split file into blocks
// input: "s": blocksize
// output: "M": data blocks, "S": blocksize, "N": number of blocks
func Split(file *os.File, s int64) (M [][]byte, S int64, N int64) {
	file.Seek(0, 0)

	fileInfo, err := file.Stat()
	if err != nil {
		panic(err)
	}
	size := fileInfo.Size()
	n := int64 (math.Ceil(float64 (size / s)))

	fmt.Print("\n")
	fmt.Print(">>filesize (bytes) :=")
	fmt.Print(size)
	fmt.Print("\n")
	fmt.Print(">>splitted blocks :=")
	fmt.Print(n)
	fmt.Print("\n")
	fmt.Print(">>each block size (bytes) :=")
	fmt.Print(s)
	fmt.Print("\n")
	// matrix is indexed as m_ij, so the first dimension has n items and the second has s.
	matrix := make([][]byte, n)
	for i := int64 (0); i < n; i++ {
		piece := make([]byte, s)
		_, err := file.Read(piece)
		if err != nil {
			panic(err)
		}
		matrix[i] = piece
	}
	return matrix, s, n
}

// generate a string as the name
func hashNameI(name []byte, i int64) *big.Int {
	i_bytes := make([]byte, 4)
	binary.PutVarint(i_bytes, i)
	hashArgument := append(name, i_bytes...)
	hash_array := sha512.Sum512(hashArgument)
	return new(big.Int).SetBytes(hash_array[:])
}

// provider generate authenticators as the extra info along with raw data
// storage needs authenticators to generate proofs
func GenerateAuthenticator(sample Sample, tau Tau, i int64, s int64, tau_zero Tau_zero, piece []byte, ssk *rsa.PrivateKey) *big.Int {
	hash_bigint := hashNameI(tau_zero.Name, i + 1)

	productory := big.NewInt(1)
	for j := int64 (0); j < sample.NumBytes; j++ {
		k := sample.Idx[j]
		piece_bigint := new(big.Int).SetBytes([]byte{piece[k]})
		productory.Mul(productory, new(big.Int).Exp(&tau_zero.U[k], piece_bigint, nil))
	}

	innerProduct := new(big.Int).Mul(hash_bigint, productory)
	return new(big.Int).Exp(innerProduct, ssk.D, ssk.PublicKey.N)
}

// provider sign the data and generate authenticators
func St(ssk *rsa.PrivateKey, file *os.File, S int64, N int64, tau_file string, auth_file string, sample_file string) (_tau Tau, _sigma []*big.Int) {
	matrix, s, n := Split(file, S)
	tau_zero := Tau_zero{N: n}

	tau_zero.Name = make([]byte, 512)
	_, err := rand.Read(tau_zero.Name)
	if err != nil {
		panic(err)
	}

	tau_zero.U = make([]big.Int, s)
	for i := int64 (0); i < s; i++ {
		result, err := rand.Int(rand.Reader, ssk.PublicKey.N)
		if err != nil {
			panic(err)
		}
		tau_zero.U[i] = *result
	}

	var tau_zero_bytes bytes.Buffer
	enc := gob.NewEncoder(&tau_zero_bytes)
	err = enc.Encode(tau_zero.U)
	if err != nil {
		panic(err)
	}

	hashed_t_0 := sha512.Sum512(tau_zero_bytes.Bytes())
	t_0_signature, err := rsa.SignPKCS1v15(nil, ssk, crypto.SHA512, hashed_t_0[:])
	if err != nil {
		panic(err)
	}
	tau := Tau{Tau_zero: tau_zero, Signature: t_0_signature}


	// generate random index of bytes inside data block to be checked
	sample := Sample{Szblock: s, NumBytes: N}
	sample.Idx = make([]int64, N)
	for i := int64 (0); i < N; i++ {
		idx, err := rand.Int(rand.Reader, big.NewInt(s))
		if err != nil {
			panic(err)
		}
		sample.Idx[i] = idx.Int64()
	}

	sigmas := make([]*big.Int, n)
	sem := make(chan byte, n);
	for i := int64 (0); i < n; i++ {
		go func(i int64) {
			sigmas[i] = GenerateAuthenticator(sample,tau, i, s, tau_zero, matrix[i], ssk)
			sem <- 0;
		} (i)
	}
	for i := int64 (0); i < n; i++ {
		<- sem
	}
	// write tau into JSON file
	jsonFile, err := os.Create(tau_file)
  if err != nil {
  		panic(err)
  }
	defer jsonFile.Close()

	tauData, err := json.Marshal(tau)
  jsonFile.Write(tauData)
  jsonFile.Close()

	// write sigma into JSON files
	sigmaFile, err := os.Create(auth_file)
	if err != nil {
  		panic(err)
  }
	defer sigmaFile.Close()
	sigmasData, err := json.Marshal(sigmas)
	sigmaFile.Write(sigmasData)
	sigmaFile.Close()

	// write sample index into sample_file
	sampleFile, err := os.Create(sample_file)
  if err != nil {
  		panic(err)
  }
	defer sampleFile.Close()

	sampleData, err := json.Marshal(sample)
  sampleFile.Write(sampleData)
  sampleFile.Close()

	return tau, sigmas
}
