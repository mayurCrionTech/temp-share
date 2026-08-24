const mongoose = require("mongoose");

const assetCategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
    defaultDocumentNames: [{
        type: String
    }],
    personalProtectiveEquipments: [{
        type: mongoose.SchemaTypes.ObjectId,
    }],
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

assetCategorySchema.index({isDeleted:1, businessUnit:1, createdAt:-1});
assetCategorySchema.index({isDeleted:1, businessUnit:1, name:1});
assetCategorySchema.index({isDeleted:1, businessUnit:1, updatedAt:1});
assetCategorySchema.index({_id:1, isDeleted:1});


const AssetCategory = mongoose.model("AssetCategory", assetCategorySchema, "assetCategories");
module.exports = { AssetCategory };
