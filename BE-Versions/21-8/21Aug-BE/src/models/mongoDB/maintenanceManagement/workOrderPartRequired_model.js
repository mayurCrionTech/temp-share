
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusEnum = ["pendingForApproval","approved","resubmit"]

const workorderPartRequiredSchema = new Schema({
  workOrder: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrder",
    required: true
  },
  spare: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Spare",
    required: true
  },
  requestedQuantity:{
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
  utilisedCount: {
    type: Number,
    default: 0
  },
  remarks:{
    type: String
  },
  status:{
    type: String,
    enum: {
      values: statusEnum,
      message: "{VALUE} is not a valid Status",
    },
    default: "pendingForApproval"
  },
    businessUnit: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "BusinessUnit",
          required: true
        },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required:true
  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required:true
    
  },
  createdAt: {
		type: Date,
		required: true,
    default: Date.now()
	},
  updatedAt: {
		type: Date,
		required: true,
    default: Date.now()
	},
  isActive:{
    type: Boolean,
    required: true,
    default: true
  }


});

workorderPartRequiredSchema.index({isDeleted:1, businessUnit:1, workOrder:1, createdAt:-1 })


module.exports = mongoose.model('WorkOrderPartsRequired', workorderPartRequiredSchema, "workOrderPartsRequired");




