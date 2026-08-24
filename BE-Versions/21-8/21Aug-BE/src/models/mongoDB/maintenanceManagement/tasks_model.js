const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
	taskLibrary: {
		type: mongoose.SchemaTypes.ObjectId,
        ref: "TaskLibrary",
		// required: true,      
	},
    maintenancePlan:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:"MaintenancePlan",
        default: null
    },
    description: {
        type: String,
        maxLength: [1000, 'tasks cannot exceed 1000 characters']
    },
    order: {
        type: Number,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    businessUnit: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "BusinessUnit",
        required: true
    },    
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

tasksSchema.index({isDeleted:1, businessUnit:1, maintenancePlan:1, taskLibrary:1})
tasksSchema.index({isDeleted:1, taskLibrary: 1 })
tasksSchema.index({isDeleted:1, maintenancePlan: 1 })

const Task = mongoose.model("Task", tasksSchema, "tasks");
module.exports = { Task };
