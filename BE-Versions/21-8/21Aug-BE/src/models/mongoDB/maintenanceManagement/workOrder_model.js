/*
date              cr/qid      comments
21-march-2026     CR0001      Updated for Dropdowns api - seleced options id's added
*/

const mongoose = require("mongoose");

const workOrder = workOrderConstants();
const wOStatusEnum = Object.values(workOrder.status)
const wOPriorityEnum = Object.values(workOrder.priority)


const workorderSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  asset: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Asset",
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
  },
  departments:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Department"
  }],
  priority:{
    type: String,
    enum: wOPriorityEnum,   
  },
  // CR0001
  // priority:{
  //   type: String, 
  // },
  // priorityId:{
  //   type: mongoose.Schema.Types.ObjectId,
  // },
  startAt: {
    type: Date,
  },
  endAt: {
    type: Date
  },
  estimatedDays: {
    type: Number,
  },
  estimatedHours: {
    type: Number,
  },
  assignees: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  }],
  existingTeams:[{
      id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Team",
      },
      noOfMembersRequired:{
        type: Number
      },
      _id: false
    }],
  localTeams:[{
        name:{
          type: String
        },
        noOfMembersRequired:{
          type:Number
        },
        _id: false
    }],
  tasks: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref:"WorkOrderTask"
  }],
  addToAssetHistory:{
    type: Boolean,
    default: false
  },
  isWorkPermitRequired:{
    type: Boolean,
    default: false
  },
  isMaintenanceScheduled:{
    type: Boolean,
    default: false
  },
  images:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref:"File",
    default: []
  }],
  documents:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File"
  }],
  lastStatus: {
    type: String,
    default: null,
  },
  status: {
    type: String, 
    enum: wOStatusEnum,
    required: true,
    default: "scheduled"
  },
  acceptTime: {
    type: Date,
    default: null,
  },
  completeTime: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",

  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
 },
 requestExtensionCount: {
  type: Number,
  default: 0,
},
workOrderCreatedAt:{
  type: Date
}, 
  maintenanceId: {
  type: mongoose.SchemaTypes.ObjectId,
  ref: "MaintenancePlan",
}
// createdAt: {
//   type: Date,
//   required: true,
//   default: Date.now()
// },
// updatedAt: {
//   type: Date,
//   required: true,
//   default: Date.now()
// }
},
{
  versionKey: false,
  timestamps: true,
});


workorderSchema.index({isDeleted:1, businessUnit:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, maintenanceId:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, name:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, departments:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, asset:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, status:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, priority:1, createdAt:-1})
workorderSchema.index({isDeleted:1, businessUnit:1, createdBy:1, createdAt: -1})
workorderSchema.index({isDeleted:1, businessUnit:1, assignees:1, status:1, startAt:1, createdAt: -1})
workorderSchema.index({isDeleted:1, endAt:1, status:1})

const workOrders = mongoose.model("WorkOrder", workorderSchema, "workOrders");

function workOrderConstants (){
  return {
      status: {
        draft: "draft",
        scheduled: "scheduled",
        accepted: "accepted",
        onHold: "onHold",
        completed: "completed",
        expired: "expired",
      },
      priority: {
        High_P1: "High-P1",
        Medium_P2: "Medium-P2",
        Low_P3: "Low-P3",
      }
    }
  }


  module.exports ={
    workOrder,
    workOrders
  }



