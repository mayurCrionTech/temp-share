const mongoose = require("mongoose");

const businessUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique: true
    },
    shortName: {
        type: String,
        required: true,
        // unique: true
    },
    organization:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Organization",
        required: true
    },
    usersCount: {
        type: Number,
        default: 0
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
        type: Date,
        immutable: true,
        default: () => {
            return Date.now();
        }
    },
    logo1:{
        type: String,
    },
    logo2:{
        type: String,
    },
    updatedAt: {
        type: Date,
        default: () => {
            return Date.now();
        }
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
    organization: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Organization",
        required: true
    }
})

module.exports = mongoose.model("BusinessUnit", businessUnitSchema, "businessUnits");
