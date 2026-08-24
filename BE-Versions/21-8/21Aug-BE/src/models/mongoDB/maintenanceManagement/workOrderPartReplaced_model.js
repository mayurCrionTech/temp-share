
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workorderPartReplacedSchema = new Schema({
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
  replacedQuantity:{
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
  spareRequested: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrderPartsRequired",
    required: true
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
  remarks:{
    type: String,
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
  },
  quantityReturned:{
    type: Number,
  },
  quantityReturnedAt: {
    type: Date,
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

workorderPartReplacedSchema.index({isDeleted:1, businessUnit:1, workOrder:1, createdAt:-1 })

module.exports = mongoose.model('WorkOrderPartsReplaced', workorderPartReplacedSchema, "workOrderPartsReplaced");




