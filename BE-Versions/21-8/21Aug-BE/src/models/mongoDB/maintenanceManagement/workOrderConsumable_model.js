
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workorderConsumableSchema = new Schema({
  workOrder: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrder",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity:{
    type: Number,  
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
  isDeleted:{
    type: Boolean,
    required: true,
    default: false
  }


});

workorderConsumableSchema.index({isDeleted:1, businessUnit:1, workOrder:1, createdAt:-1})


module.exports = mongoose.model('WorkOrderConsumables', workorderConsumableSchema, "workOrderConsumables");




