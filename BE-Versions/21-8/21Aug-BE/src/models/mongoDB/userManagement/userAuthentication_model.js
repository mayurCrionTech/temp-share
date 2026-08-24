const mongoose = require("mongoose");

const userAuthenticationSchema = new mongoose.Schema({
	user: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User"
	},
	email: {
		type: String,
		lowercase: true, // it will convert the email into the lower case and then store in the db,
		minLength: 10, // anything less than 10 will fail
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	passwordExpireAt: {
		type: Date,
		required: true
	},
	isSuperAdmin:{
		type: Boolean,
		default: false
	},
	businessUnitToken: {
		type: String,
		default: null
	},
	businessUnitTokenCreatedAt: {
		type: Date,
		default: null
	},
	isEnabled: {
		type: Boolean,
		default: true
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	createdAt: {
		// I want to default to a new date
		type: Date,
		immutable: true, // This will ensure the createdAt column is never updated but once in the start
		default: () => {
			return Date.now();
		}
	},
	updatedAt: {
		type: Date,
		default: () => {
			return Date.now();
		}
	}
});
userAuthenticationSchema.index({ email: 1 }, { unique: true });
userAuthenticationSchema.index({isEnabled:1,isDeleted:1,email:1})
userAuthenticationSchema.index({isDeleted:1})
userAuthenticationSchema.index({isEnabled:1})
userAuthenticationSchema.index({isEnabled:1,isDeleted:1})


module.exports = mongoose.model(
	"UserAuthentication",
	userAuthenticationSchema,
	"userAuthentications"
);
