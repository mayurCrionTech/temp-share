const mongoose = require("mongoose");
const { countDocuments } = require("../userManagement/user_model");
const schema = mongoose.Schema;

const sparesAndInventory = {
  cycleFrequencyType: {
    Cycle: "Cycle",
  },
  replacementFrequencyType: {
    Months: "Months",
    Years: "Years",
  },
  quantityType:{
    mm:"mm",
    Litres:"Litres",
    "No's":"No's"
  }
};
const cycleFrequencyEnum = Object.values(sparesAndInventory.cycleFrequencyType);
const replacementFrequencyEnum = Object.values(
  sparesAndInventory.replacementFrequencyType
);
const quantityEnum = Object.values(sparesAndInventory.quantityType)

const sparesAndInventoriesSchema = new schema(
  {
    name: {
      type: String,
      maxLength: [
        50,
        "Name exceeds the maximum allowed length of 50 characters",
      ],
      required: [true, "please provide spare name"],
    },
    description:{
      type: String,
    },
    quantity: {
      type:Object,
      value: {
        type: Number,
        validate: [
          {
            validator: function (v) {
              // Check if the number has a maximum of 8 digits
              return v.toString().length <= 8;
            },
            message: (props) =>
              `Count for Quantity exceeds the maximum allowed length of 8 digits: ${props.value}`,
          },
          {
            validator: function (v) {
              // Regex to ensure only numeric values (positive numbers)
              return /^[0-9]+$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid quantity! Only positive integers are allowed.`,
          }
        ],
        required: true,
      }, 
    "type": {
      type: String,
      enum: {
        values: quantityEnum,
        message: "{VALUE} is not a valid type",
      },
    },
    },
    totalQuantity: {
      type: Number,
    },
    cost:{
      type: Number,
      default: null
    },
    minimumRequirement:{
      type: Number
    },
    // partNumber:{
    //   type: String,
    //   unique: true
    // },
    cycleFrequency: {
      value: {
        type: Number,
        validate: {
          validator: function (v) {
            // Convert the number to a string and check its length
            return v.toString().length <= 8;
          },
          message: (props) =>
            `Count exceeds the maximum allowed length of 8 digits: ${props.value}`,
        },
      },
      type: {
        type: String,
        enum: {
          values: cycleFrequencyEnum,
          message: "{VALUE} is not a valid type",
        },
      },
    },
    replacementFrequency: {
      value: {
        type: Number,
        validate: {
          validator: function (v) {
            // Convert the number to a string and check its length
            return v.toString().length <= 2;
          },
          message: (props) =>
            `Count exceeds the maximum allowed length of 2 digits: ${props.value}`,
        },
      },
      type: {
        type: String,
        enum: {
          values: replacementFrequencyEnum,
          message: "{VALUE} is not a valid type",
        },
      },
    },
    asset: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Asset",
      index: true,
    },
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

sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, name:1,asset:1, createdAt:-1})
sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, asset:1, createdAt:-1})
sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, asset:1})
sparesAndInventoriesSchema.index({isActive:1, businessUnit:1, createdAt:-1})
sparesAndInventoriesSchema.index({isActive:1, name:1})


const SparesAndInventories = mongoose.model(
  "SpareAndInventory",
  sparesAndInventoriesSchema, 
  "spareAndInventories"
);
module.exports = { SparesAndInventories, sparesAndInventory };