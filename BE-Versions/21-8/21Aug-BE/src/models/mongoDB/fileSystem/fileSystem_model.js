const mongoose = require("mongoose");

const fileExtensionAndSizeConfigs = {
	"jpg": { maxSize: 5 * 1024 * 1024 },
	"jpeg": { maxSize: 5 * 1024 * 1024 },
	"png": { maxSize: 5 * 1024 * 1024 },
	"fbx": { maxSize: 20 * 1024 * 1024 },
	"pdf": { maxSize: 40 * 1024 * 1024 },
	"doc": { maxSize: 40 * 1024 * 1024 },
	"xlsx": { maxSize: 40 * 1024 * 1024 },
	"csv": { maxSize: 10 * 1024 * 1024 },
	"wav": { maxSize: 10 * 1024 * 1024 },
	"mp3": { maxSize: 10 * 1024 * 1024 },
	"mov": { maxSize: 500 * 1024 * 1024 }
};

const fileSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	extension: {
		type: String,
		required: true,
		enum: Object.keys(fileExtensionAndSizeConfigs) 
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
	businessUnit: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "BusinessUnit",
		required: true
	},
	createdBy: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
	},
	updatedBy: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
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

fileSchema.statics.fileExtensionAndSizeConfigs = fileExtensionAndSizeConfigs;

fileSchema.index({isDeleted:1, businessUnit:1})

const File = mongoose.model("File", fileSchema, "files");

module.exports = File;
