const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true,
  },
  userType: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "UserType",
    required: true,
  },
  permissions: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Permission",
    },
  ],
  isEnabled: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => {
      return Date.now();
    },
  },
  updatedAt: {
    type: Date,
    default: () => {
      return Date.now();
    },
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
});

designationSchema.index({isDeleted:1, businessUnit:1, userType:1, name:1})
designationSchema.index({isDeleted:1, businessUnit:1, name:1})



const Designation = mongoose.model(
  "Designation",
  designationSchema,
  "designations"
);

module.exports = Designation;
