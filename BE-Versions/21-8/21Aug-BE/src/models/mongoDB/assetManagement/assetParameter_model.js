const mongoose = require("mongoose");
const parameterConstant = parameterConstants();

const assetParameterSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			// required: true
		},
		value: {
			type: String,
			// required: true
		},
		unit: {
			type: String,
			// required: true
		},
		asset: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			ref: "Asset"
		},
		tagId: {
			type: mongoose.SchemaTypes.ObjectId,
			// ref: "liveData",
			ref:"Tag_mock", 
			required: true,
    	},
	    businessUnit: {
		    type: mongoose.SchemaTypes.ObjectId,
		    ref: "BusinessUnit",
		    required: true
	    },
		trackingStatus: {
			type: String,
			enum: {
				values: Object.values(parameterConstant.trackingStatus),
				message: "{VALUE} is not a valid trackingStatus"
			},
			default: parameterConstant.trackingStatus.UNLINKED
		},
		isComparable: {
			type: Boolean,
			default: false
		},
		createdBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "User"
			// required: true
		},
		updatedBy: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "User"
			// required: true
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);


assetParameterSchema.virtual('id').get(function () {
	return this._id.toHexString();
});


assetParameterSchema.set('toJSON', {
	virtuals: true,
	transform: function (doc, ret) {
		delete ret._id;
		delete ret.__v;
	}
});

assetParameterSchema.index({_id:1, isDeleted:1, businessUnit:1})
assetParameterSchema.index({isDeleted:1, businessUnit:1, asset:1})
assetParameterSchema.index({isDeleted:1, businessUnit:1, asset:1, createdAt:-1})
assetParameterSchema.index({isDeleted:1, businessUnit:1, name:1})


const AssetParameters = mongoose.model("AssetParameter", assetParameterSchema, "assetParameters");
module.exports = { AssetParameters, parameterConstant };
	
	
	
	
function parameterConstants() {
	return {
		trackingStatus: {
			ENABLED: "Active",
			DISABLED: "Disabled",
			REQUESTED: "Requested",
			UNLINKED: "Unlinked"
		}
	};
}