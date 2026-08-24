const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema( {
	name: {
		type: String,
		required: true
	},
	extension: {
		type: String,
		required: true
	},
	contentType: {
		type: String,
		required: true
	},
	size: {
		type: Number,
		required: true
	},
	storageLocation: {
		provider: {
			type: String,
			required: true
		},
		path: {
			type: String,
			required: true
		},
	},
	moduleName: {
		type: String,
	},
	moduleId: {
		type: String,
	},
	createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
	createdAt: {
		type: Date,
		required: true
	},
	updatedAt: {
		type: Date,
		required: true
	},
	metadata: {
		type: Object,
		required: true
	},
	isSentToRecycleBin: {
		type: Boolean,
		default: false
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	clearRecycleBinAt: {
		type: Date,
	},
});

module.exports = mongoose.model("File", fileSchema, "files");




