const mongoose = require("mongoose");

const personalProtectiveEquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "File",
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

personalProtectiveEquipmentSchema.index({_id:1, isDeleted:1, businessUnit:1})
personalProtectiveEquipmentSchema.index({isDeleted:1, businessUnit:1, name:1})
personalProtectiveEquipmentSchema.index({isDeleted:1, businessUnit:1, createdAt:-1})


const PersonalProtectiveEquipment = mongoose.model("PersonalProtectiveEquipment", personalProtectiveEquipmentSchema, "personalProtectiveEquipments");
module.exports = { PersonalProtectiveEquipment };