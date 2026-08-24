const mongoose = require("mongoose");
  
const recurrenceDetailsSchema = new mongoose.Schema({
    frequency: {
      type: Number,
      required: true,
    },
    timePeriod: {
      type: String,
      required: true,
    },
    recurrOn: {
      type: String,      
    },
    occurDays: {
      type: [String], 
      default: [],
    },
    specificDay: {
      type: String,
      default: null,
    },
  });

const maintenancePlanVersionSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
    required: true,
  },
  maintenanceId:{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "MaintenancePlan",
  },
  version:{
    type :String,
    required: true,
    default: 1
  },
  description: {
    type: String,
  },
  asset: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Asset",
  },
  departments:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Department"
  }],
  priority:{
    type: String, 
  },
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
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
   },
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
    ref:"Task"
  }],
  images:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref:"File",
    default: []
  }],
  documents:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File"
  }],
  status:{
    type: String,
    required: true,
    default: "scheduled"
  },
  isRecurrence: {
    type: Boolean,
    default: false,
  },
  recurrenceDetails: {
    type: recurrenceDetailsSchema,
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


maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, maintenanceId:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, name:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, department:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, asset:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, asset:1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, status:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, priority:1, createdAt:-1})
maintenancePlanVersionSchema.index({isDeleted:1, businessUnit:1, createdBy:1, status:1, startAt:1, createdAt: -1})

const MaintenancePlanVersion = mongoose.model("MaintenancePlanVersion", maintenancePlanVersionSchema, "maintenancePlanVersions");

module.exports = MaintenancePlanVersion