const mongoose = require("mongoose");

const assetHistorySchema =  new mongoose.Schema({
    name: {
		type: String,
		required: true
	},
    description:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ["planned","executed","missed"],
        required: true
    },
    moduleId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "WorkOrder",
        default: null
    },
    moduleName: {
        type: String,
        enum: ["workOrders","assets"],
        default:"assets"
    },
    asset:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Asset",
        required: true
    },
    businessUnit: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "BusinessUnit",
        required: true
    },
    eventDate:{
        type: Date,
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
})

assetHistorySchema.index({businessUnit:1,asset:1,eventDate:1 })
assetHistorySchema.index({_id:1, businessUnit:1})
assetHistorySchema.index({moduleName:1, name:1, eventDate:1})
assetHistorySchema.index({_id:1, businessUnit:1, status:1})

const AssetHistory = mongoose.model("AssetHistory",assetHistorySchema
    ,"assetHistories"
)
module.exports = {AssetHistory}