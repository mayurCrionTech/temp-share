const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const workorderTasksSchema = new Schema({
  workOrderId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "WorkOrder",
    required: true
  },
  description:{
    type: String,
    default: null,
    required: true
  },
  order:{
    type: Number,
    // required: true,
    // unique:true,
  },
  isCompleted:{
    type: String,
    default: false,
    required: true
  },
  images:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File",
  }],
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

workorderTasksSchema.index({isDeleted:1, workOrderId:1, createdAt:-1 })


module.exports = mongoose.model('WorkOrderTask', workorderTasksSchema, "workOrderTasks");


