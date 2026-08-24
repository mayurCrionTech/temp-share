/*
date              cr/qid      comments
22-march-2026     CR0001      Ids for selected dropdowns are added
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

const quantityEnum = ["mm","Litres","No's"];
const statusEnum = ["pendingForApproval","approved","draft","resubmit"]

const sparesSchema = new schema(
  {
    name: {
      type: String,
    },
    specification:{
      type: String,
    },
    description:{
      type: String,
    },
    partNumber:{
      type: String,
    },
    quantity: {
      type: Number,
    },
    units:{
        type: String,
        enum: {
        values: quantityEnum,
        message: "{VALUE} is not a valid Unit",
      },
    },
    // CR0001
    // units:{
    //     type: String,
    // },
    // unitsId:{
    //   type: mongoose.Schema.Types.ObjectId,
    // },
    recommendedQuantity: {
      type: Number,
      default:0
    },
    cost:{
      type: Number,
    },
    // CR0001
    costUnits:{
      type: String,
    },
    costUnitsId:{
      type: mongoose.Schema.Types.ObjectId,
    },
    expiryDate:{
        type: Date,
    },
    minimumRequiredQuantity:{
      type: Number,
    },
    approver: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      // required: true,
    },
    category: {
        type: String
    },
    status:{
        type: String,
        enum: {
        values: statusEnum,
        message: "{VALUE} is not a valid Status",
      },
    },
    isSupplierDetails: {
      type: Boolean,
      default: false,
    },
    supplierDetails:{
        type: Object,
        name:{
            type: String,

        },
        contactNumber:{
            type:String
        },
        email: {
        type: String,
        lowercase: true, // it will convert the email into the lower case and then store in the db,
        minLength: 10, // anything less than 10 will fail
        // unique: true,
        },
        vendorCode:{
            type:String,
        }
    },
images: {
  type: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "File"
    }
  ],
  default: []
},
    assets: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Asset",
    }],
    businessUnit: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "BusinessUnit",
        required: true
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, name:1,asset:1, createdAt:-1})
// sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, asset:1, createdAt:-1})
// sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, asset:1})
// sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, createdAt:-1})
// sparesAndInventoriesSchema.index({isActive:1, name:1})


const Spares = mongoose.model(
  "Spare",
  sparesSchema,
  "spares"
);
module.exports = { Spares, statusEnum, quantityEnum };