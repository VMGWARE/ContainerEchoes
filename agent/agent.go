package main

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

// Agent represents the client that will communicate with the server
type Agent struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  []byte
	Token      string
}

// NewAgent creates a new Agent instance
func NewAgent() *Agent {
	return &Agent{}
}

// Initialize sets up the Agent by generating RSA keys
func (a *Agent) Initialize() {
	// TODO: Only allow 1 agent per server

	// Check if the files /etc/echoes/agent/private_key and /etc/echoes/agent/public_key exist
	if _, err := os.Stat("/etc/echoes/agent/private_key"); os.IsNotExist(err) {
		// Generate RSA Keys
		var err error
		a.PrivateKey, err = rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			panic(err) // In production, handle this error properly
		}

		// Extract the public key
		pubKeyBytes, err := x509.MarshalPKIXPublicKey(&a.PrivateKey.PublicKey)
		if err != nil {
			panic(err) // Handle error
		}
		a.PublicKey = pem.EncodeToMemory(&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: pubKeyBytes,
		})

		Logger.Info(Logger{}, "agent", "Generated RSA keys")

		// Store the RSA keys in /etc/echoes/agent
		os.MkdirAll("/etc/echoes/agent", os.ModePerm)
		ioutil.WriteFile("/etc/echoes/agent/private_key", x509.MarshalPKCS1PrivateKey(a.PrivateKey), 0644)
		ioutil.WriteFile("/etc/echoes/agent/public_key", a.PublicKey, 0644)

		Logger.Info(Logger{}, "agent", "Stored RSA keys in /etc/echoes/agent")
	} else {
		// Read the private key from the file
		privateKeyBytes, err := ioutil.ReadFile("/etc/echoes/agent/private_key")
		if err != nil {
			panic(err) // Handle error
		}

		// Decode the private key
		a.PrivateKey, err = x509.ParsePKCS1PrivateKey(privateKeyBytes)
		if err != nil {
			panic(err) // Handle error
		}

		// Read the public key from the file
		a.PublicKey, err = ioutil.ReadFile("/etc/echoes/agent/public_key")
		if err != nil {
			panic(err) // Handle error
		}

		Logger.Info(Logger{}, "agent", "Loaded RSA keys from disk")
	}
}

// PerformHandshake performs the E2E encryption handshake with the server
func (a *Agent) PerformHandshake(url string) error {
	Logger.Info(Logger{}, "agent", "Performing handshake with server...")

	// Send agent token and public key to the server as JSON
	jsonData := map[string]string{
		"agent_token": string(a.Token),
		"public_key":  string(a.PublicKey),
	}
	jsonValue, _ := json.Marshal(jsonData)

	response, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		return err // In production, handle this error properly
	}
	defer response.Body.Close()

	// Check if the server responded with an error
	if response.StatusCode != 200 {
		return fmt.Errorf("Handshake with server failed: %s", response.Status)
	}

	// Read the server's public key
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return err // Handle error
	}

	// Here you might store the server's public key for further communication
	// For now, we'll just print it to the console
	Logger.Info(Logger{}, "agent", "Handshake with server successful")
	Logger.Info(Logger{}, "agent", "Server's Public Key: "+string(body))

	return nil
}
