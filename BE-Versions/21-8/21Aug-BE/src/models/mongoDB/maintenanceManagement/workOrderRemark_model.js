const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const workorderRemarksSchema = new Schema({
  workOrderId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrder",
    required: true
  },
  remark:{
    type: String,
    default: null,
    required: true
  },
    businessUnit: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "BusinessUnit",
      required: true
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

workorderRemarksSchema.index({isDeleted:1, businessUnit:1, workOrderId:1, createdAt:-1 })


const WorkOrderRemarks = mongoose.model('WorkOrderRemark', workorderRemarksSchema, "workOrderRemarks");


module.exports = {
  WorkOrderRemarks
}