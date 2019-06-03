
package storage;

import (
  "crypto/x509"
	"crypto/rsa"
  "encoding/json"
  "encoding/pem"
	"math/big"
  "io/ioutil"
  "math"
  "os"
  "fmt"
  "bufio"
)


type Sample struct {
	Szblock int64				`json:"blocksize"`
	NumBytes  int64			`json:"NumBytes"`
	Idx    []int64			`json:"bytesindex"`
}

type QElement struct {
	I int64   `json:"I"`
	V int64   `json:"V"`
}

type ProofData struct {
  Mu    []big.Int 	`json:"mu"`
  Sigma *big.Int     `json:"sigma"`
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

// load provider's public key from PEM file to generate proofs
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

// storage generates the proofs based on the challenge from the verifier
func Prove(sample_file string, challenge_file string, auth_file string, spk_file string, proof_file string, fileName string) {
  // read sample data struct
  sampleFile, _ := ioutil.ReadFile(sample_file)
  sample := Sample{}
  _ = json.Unmarshal([]byte(sampleFile), &sample)
  // read challenge file
  challengeFile, _ := ioutil.ReadFile(challenge_file)
  q := []QElement{}
  _ = json.Unmarshal([]byte(challengeFile), &q)
  // read public key from file
  spk := LoadSpk(spk_file)

  // open data file and pass in blocksize to split file
  file, err := os.Open(fileName)
	if err != nil {
		panic(err)
	}
  matrix, s, n := Split(file, sample.Szblock)

  // load authenticators from file
  authFile, _ := ioutil.ReadFile(auth_file)
  authenticators := make([]*big.Int, n)
  _ = json.Unmarshal([]byte(authFile), &authenticators)

  // create proof data
  proof := ProofData{}
	proof.Mu = make([]big.Int, s)

	for j := int64 (0); j < sample.NumBytes; j++ {
		k := sample.Idx[j]
		mu_k := big.NewInt(0)
    for _, qelem := range q {
			char := new(big.Int).SetBytes([]byte{matrix[qelem.I - 1][k]})
			product := new(big.Int).Mul(new(big.Int).SetInt64(qelem.V), char)
			mu_k.Add(mu_k, product)
		}
		proof.Mu[k] = *mu_k
	}

	sigma := new(big.Int).SetInt64(1)
  for _, qelem := range q {
		sigma.Mul(sigma, new(big.Int).Exp(authenticators[qelem.I - 1], new(big.Int).SetInt64(qelem.V), spk.N))
	}
	sigma.Mod(sigma, spk.N)
  proof.Sigma = sigma
  // save proof into file
  jsonFile, err := os.Create(proof_file)
  if err != nil {
  		panic(err)
  }
	defer jsonFile.Close()

	proofData, err := json.Marshal(proof)
  jsonFile.Write(proofData)
  jsonFile.Close()
}
