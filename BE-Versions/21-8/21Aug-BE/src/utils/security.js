const crypto = require("crypto");

// Function to encrypt text using AES-256-CBC
const encryptCBC = (textToEncrypt, secretKey) => {
	try {
		// Ensure key length is 32 bytes (256 bits)
		const paddedKey = Buffer.from(secretKey.padEnd(32, "0"), "utf8");
		// Generate a random 16-byte IV
		const iv = crypto.randomBytes(16);

		// Create the cipher using AES-256-CBC
		const cipher = crypto.createCipheriv("aes-256-cbc", paddedKey, iv);
		let encrypted = cipher.update(textToEncrypt, "utf8", "base64");
		encrypted += cipher.final("base64");

		// Concatenate IV and ciphertext
		const result = Buffer.concat([iv, Buffer.from(encrypted, "base64")]).toString("base64");

		return result;
	} catch (error) {
		return error.message;
	}
};

// Function to decrypt text encrypted with AES-256-CBC
const decryptCBC = (encryptedText, secretKey) => {
	try {
		// Ensure key length is 32 bytes (256 bits)
		const paddedKey = Buffer.from(secretKey.padEnd(32, "0"), "utf8");
		// Decode the base64 encoded string
		const fullCipher = Buffer.from(encryptedText, "base64");

		// Extract IV from the first 16 bytes
		const iv = fullCipher.slice(0, 16);
		const ciphertext = fullCipher.slice(16);

		// Create the decipher using AES-256-CBC
		const decipher = crypto.createDecipheriv("aes-256-cbc", paddedKey, iv);
		let decrypted = decipher.update(ciphertext, "base64", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		return error.message;
	}
};

module.exports = {
	encryptCBC,
	decryptCBC
};