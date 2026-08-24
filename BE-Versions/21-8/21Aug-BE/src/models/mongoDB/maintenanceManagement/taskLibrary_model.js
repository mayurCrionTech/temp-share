/*
date              cr/qid      comments
24-march-2026     CR0001      ref of asset category removed for - dropdown api
*/

const mongoose = require("mongoose");

const taskLibrarySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        maxlength: [50, 'Name cannot exceed 1000 characters']
	},
    number: {
        type: String
    },
    description:{
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // CR0001
    assetCategory: {
        type: mongoose.SchemaTypes.ObjectId,
        // ref: "AssetCategory",
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

taskLibrarySchema.index({isDeleted:1, businessUnit:1, createdAt:-1})
taskLibrarySchema.index({isDeleted:1, name:1, businessUnit:1, createdAt:-1 })


const TaskLibrary = mongoose.model("TaskLibrary", taskLibrarySchema, "taskLibraries");
module.exports = { TaskLibrary };
