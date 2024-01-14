const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

/**
 * Check if the given email is valid or not.
 * @param email - The email to be validated.
 * @returns True if the email is valid, false otherwise.
 */
function validateEmail(email) {
	// Regular expression to check for valid email addresses
	var re =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

/**
 * Check if the given string is empty.
 * @param str - The string to be checked.
 * @returns True if the string is empty, false otherwise.
 */
function isStringEmpty(str) {
	return !str || str.length === 0 || /^\s*$/.test(str);
}

/**
 * Generate a random string of the given length.
 * @param length - The length of the string to be generated.
 * @returns The generated string.
 */
function generateRandomString(length) {
	return crypto.randomBytes(length).toString("hex");
}

/**
 * Get the current version of the application
 * @returns {string} The current version of the application
 */
function getVersion() {
	var version = "unknown";
	try {
		const currentPath = path.dirname(__filename);
		version = fs.readFileSync(path.join(currentPath, "../version")).toString();
		version = version.replace("v", "").trim();
	} catch {
		const { execSync } = require("child_process");
		try {
			version = execSync("git describe --always --tags --dirty").toString();
			version = version.replace("v", "").trim();
		} catch {
			return process.env.npm_package_version;
		}
		fs.writeFileSync("version", version);
		return version;
	}

	return version;
}

/**
 * Extract the domain of the given email address.
 * @param email - The email address.
 * @returns The domain of the email address.
 */
function extractEmailDomain(email) {
	// Validate email format
	if (!email || typeof email !== "string" || !email.includes("@")) {
		throw new Error("Invalid email format.");
	}

	// Split on the '@' symbol and take the second part
	const domain = email.split("@")[1];

	return domain;
}

/**
 * Generates a unique ID with customizable options.
 * @description Generates a unique ID with customizable options. The ID is generated using a random character set.
 * @param {number} [length=8] - The length of the ID. Defaults to 8 if not provided.
 * @param {number} [characterSetOption=3] - The character set option for the ID. Defaults to 3 if not provided.
 * @returns {string} The unique ID generated.
 * @throws Will throw if an invalid character set option is provided.
 */
async function generateUniqueId(length = 8, characterSetOption = 3) {
	let characterSet = "";

	switch (characterSetOption) {
		case 1:
			characterSet = "abcdefghijklmnopqrstuvwxyz";
			break;
		case 2:
			characterSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
			break;
		case 3:
			characterSet =
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			break;
		case 4:
			characterSet =
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
			break;
		default:
			throw new Error("Invalid character set option");
	}

	let id = "";

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characterSet.length);
		id += characterSet.charAt(randomIndex);
	}

	var hexstring = crypto.randomBytes(16).toString("hex");

	id = id + hexstring;

	// Perform random shuffling of the ID while also ensuring that the length of the ID is the same
	// This is done to ensure that the ID is unique
	const idArray = id.split("");
	const shuffledIdArray = idArray.sort(() => Math.random() - 0.5);
	id = shuffledIdArray.join("");

	// Cut down the ID to the specified length
	id = id.substring(0, length);

	return id;
}

/**
 * Hashes the given password using bcrypt.
 * @param {string} password - The password to be hashed.
 * @returns {string} The hashed password.
 */
function hashPassword(password) {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}

// Export the functions
module.exports = {
	validateEmail,
	isStringEmpty,
	generateRandomString,
	getVersion,
	extractEmailDomain,
	generateUniqueId,
	hashPassword,
};
