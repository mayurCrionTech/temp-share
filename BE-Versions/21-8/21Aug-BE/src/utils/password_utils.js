const bcrypt = require("bcryptjs");

function passwordHashCompareSync(data, hash) {
	return bcrypt.compareSync(data, hash);
}

function hashPassword(password) {
	const saltRounds = 10;
	return bcrypt.hashSync(password, saltRounds);
}

function generateRandomPasswordString (length = 8){
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

module.exports = {
	passwordHashCompareSync,
	hashPassword,
	generateRandomPasswordString
};
