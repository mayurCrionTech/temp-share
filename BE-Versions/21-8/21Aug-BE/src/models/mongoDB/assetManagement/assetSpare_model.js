/*
date              cr/qid      comments
21-march-2026     CR0001      Updated for Dropdowns api - options id's added
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;

// const statusEnum = ["draft","active"];
const replacementFrequencyEnum = ["months","years","weeks"]
const quantityEnum = ["mm","Litres","No's"];

const assetSpareSchema = new schema(
  {
    spare:{
        type: mongoose.Types.ObjectId,
        ref: "Spare",
        required: true
    },
    asset:{
        type: mongoose.Types.ObjectId,
        ref: "Asset",
        required: true
    },
    minimumRequiredQuantity:{
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
              return /^[0-9]+(\.[0-9]+)?$/.test(v.toString());
            },
            message: (props) =>
              `${props.value} is not a valid quantity! Only positive integers are allowed.`,
          }
        ],
        required: true, 
    },
    unit: {
      type: String,
      enum: {
        values: quantityEnum,
        message: "{VALUE} is not a valid unit",
      }
    },
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
          values: ["cycle"],
          message: "{VALUE} is not a valid type",
        },
      },
    },
  // CR0001
  // cycleFrequency: {
  //   id:{
  //     type: mongoose.Schema.Types.ObjectId,
  //   },
  //     value: {
  //       type: Number,
  //       validate: {
  //         validator: function (v) {
  //           // Convert the number to a string and check its length
  //           return v.toString().length <= 8;
  //         },
  //         message: (props) =>
  //           `Count exceeds the maximum allowed length of 8 digits: ${props.value}`,
  //       },
  //     },
  //     type: {
  //       type: String, 
  //   },
  // },
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
    // status:{
    //     type: String,
    //     enum: {
    //     values: statusEnum,
    //     message: "{VALUE} is not a valid status",
    //   },
    // },
    // CR0001
    // replacementFrequency: {
    //   id:{
    //     type: mongoose.Schema.Types.ObjectId,
    //   },
    //   value: {
    //     type: Number,
    //     validate: {
    //       validator: function (v) {
    //         // Convert the number to a string and check its length
    //         return v.toString().length <= 2;
    //       },
    //       message: (props) =>
    //         `Count exceeds the maximum allowed length of 2 digits: ${props.value}`,
    //     },
    //   },
    //   // CR0001
    //   type: {
    //     type: String,
    //   },
    // },
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

const AssetSpare = mongoose.model(
  "AssetSpare",
  assetSpareSchema,
  "assetSpares"
);

module.exports = { AssetSpare };