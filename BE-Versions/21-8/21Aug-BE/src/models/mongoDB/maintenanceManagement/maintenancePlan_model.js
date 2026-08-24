const mongoose = require("mongoose");

const maintenancePlan = maintenancePlanConstants();
const priorityEnum = Object.values(maintenancePlan.priority)

const timePeriod = {
    HOUR: "hour",
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
  };
  const days = {
    SUNDAY: "sunday",
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THRUSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
  }; 
const recurrOn = {
  All_DAYS: "allDays",
  ONLY_ON_WEEK_DAYS: "onlyOnWeekDays",
  CUSTOM: "custom",
};
  const recurrenceDetailsSchema = new mongoose.Schema({
    frequency: {
      type: Number,
      required: true,
    },
    timePeriod: {
      type: String,
      enum: {
        values: Object.values(timePeriod),
        message: "{VALUE} is not a valid timePeriod.",
      },      
      required: true,
    },
    recurrOn: {
      type: String,
      enum: {
        values: Object.values(recurrOn),
        message: "{VALUE} is not a valid recurrOn",
      },       
    },
    occurDays: {
      type: [String],
      enum: {
        values: Object.values(days),
        message: "{VALUE} is not a valid occurDays"
      },  
      default: [],
    },
    specificDay: {
      type: String,
      default: null,
    },
  });

const maintenancePlanSchema = new mongoose.Schema({
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
  departments:[{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Department"
  }],
  priority:{
    type: String,
    enum: priorityEnum,   
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
    enum:["scheduled","draft","expired","completed"],
    required: true,
    default: "scheduled"
  },
  addToAssetHistory:{
    type: Boolean,
    default: false
  },
  addedToAssetHistory:{
    type: Boolean,
    default: false
  },
  isRecurrence: {
    type: Boolean,
    default: false,
  },
  recurrenceDetails: {
    type: recurrenceDetailsSchema,
    default: null,
  },
  scheduledTime:{
    type:Date
  },
  isWorkOrderCreated: {
    type: Boolean,
    default: false,
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
}, { timestamps: true });


maintenancePlanSchema.index({isDeleted:1, businessUnit:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, name:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, department:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, asset:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, asset:1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, status:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, priority:1, createdAt:-1})
maintenancePlanSchema.index({isDeleted:1, businessUnit:1, createdBy:1, status:1, startAt:1, createdAt: -1})
maintenancePlanSchema.index({isDeleted:1, endAt:1, status:1})


const MaintenancePlan = mongoose.model("MaintenancePlan", maintenancePlanSchema, "maintenancePlans");

function maintenancePlanConstants (){
  return {
      priority: {
        High_P1: "High-P1",
        Medium_P2: "Medium-P2",
        Low_P3: "Low-P3",
      }
    }
  }


  module.exports ={
    maintenancePlan,
    MaintenancePlan,
    timePeriod,
    days,
    recurrOn
  }



