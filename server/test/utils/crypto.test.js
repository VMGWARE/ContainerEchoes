const chai = require("chai");
const assert = chai.assert;

const crypto = require("../../utils/crypto");

describe("Crypto Utils Tests", function () {
	describe("Key Generation", function () {
		it("should generate a random key", function () {
			const key = crypto.getRandomKey();
			assert.equal(key.length, crypto.ALGORITHM.KEY_BYTE_LEN);
		});

		it("should generate a salt", function () {
			const salt = crypto.getSalt();
			assert.equal(salt.length, crypto.ALGORITHM.SALT_BYTE_LEN);
		});

		it("should generate a key from password and salt", function () {
			const password = Buffer.from("testPassword");
			const salt = crypto.getSalt();
			const key = crypto.getKeyFromPassword(password, salt);
			assert.equal(key.length, crypto.ALGORITHM.KEY_BYTE_LEN);
		});
	});

	describe("Encryption & Decryption", function () {
		it("should successfully encrypt and decrypt a message", function () {
			const key = crypto.getRandomKey();
			const originalMessage = Buffer.from("Hello World!");
			const encrypted = crypto.encrypt(originalMessage, key);
			const decrypted = crypto.decrypt(encrypted, key);
			assert.deepEqual(decrypted, originalMessage);
		});

		// Add more cases like handling wrong keys, corrupted ciphertexts, etc.
	});
});
