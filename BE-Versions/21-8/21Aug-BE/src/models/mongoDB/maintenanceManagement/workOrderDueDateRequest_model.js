const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workorderDueDateSchema = new Schema({
  workOrderId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrder",
    required: true
  },
  reason: {
    type: String,
    required: true,
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
  approvedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  requestedDate: {
    type: Date,
    required: true
  },
  approvedDate: {
    type: Date,
    
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
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
	}


});

workorderDueDateSchema.index({isDeleted:1, businessUnit:1, workOrderId:1, createdAt:-1 })

module.exports = mongoose.model('WorkOrderDueDateRequest', workorderDueDateSchema, "workOrderDueDateRequests");
