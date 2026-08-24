const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	shiftHours: {
		// Example of renaming timing to shiftHours
		start: {
			type: String,
			required: true,
			match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
		},
		end: {
			type: String,
			required: true,
			match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
		}
	},
	businessUnit: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "BusinessUnit",
		required: true
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	createdBy: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
		required: true
	},
	updatedBy: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

shiftSchema.index({isDeleted:1, businessUnit:1})
shiftSchema.index({isDeleted:1, name:1})
shiftSchema.index({isDeleted:1, description:1})
shiftSchema.index({isDeleted:1, createdAt:-1})


const Shift = mongoose.model("Shift", shiftSchema, "shifts");
module.exports = { Shift };
