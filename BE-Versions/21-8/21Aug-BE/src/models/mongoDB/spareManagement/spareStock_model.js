const mongoose = require("mongoose");
const schema = mongoose.Schema;

const quantityStockEnum = ["mm","Litres","No's"];
const statusEnum = ["pendingForApproval","approved","resubmit"]

const spareStockSchema = new schema(
  {
    spare:{
        type: mongoose.Types.ObjectId,
        ref: "Spare",
        required: true
    },
    quantity: {
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
    units:{
        type: String,
        enum: {
        values: quantityStockEnum,
        message: "{VALUE} is not a valid Unit",
      },
    },
    cost:{
      type: Number,
      validate: [
          {
            validator: function (v) {
              // Check if the number has a maximum of 8 digits
              return v.toString().length <= 8;
            },
            message: (props) =>
              `Count for Quantity exceeds the maximum allowed length of 8 digits: ${props.value}`,
          }],
      default: null
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
    status:{
        type: String,
        enum: {
        values: statusEnum,
        message: "{VALUE} is not a valid Status",
      },
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

const SpareStock = mongoose.model(
  "SpareStock",
  spareStockSchema,
  "spareStocks"
);

module.exports = { SpareStock, statusEnum, quantityStockEnum };