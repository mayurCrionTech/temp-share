const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  message: { type: String, required: true },
  moduleDetails: { id:{type:mongoose.ObjectId },name:{type:String}},
  moduleName: {
    type: String,
    enum: [
      "assets",
      "dashboard",
      "workOrders",
      "checklists",
      "logs",
      "plant3D",
      "reports",
      "taskLibrary",
      "maintenancePlans",
      "plant3D",
      "3DLibrary",
      "sparesAndInventory",
      "auditAndInspection",
      "users",
      "teams",
      "documents"
    ],
    required: true,
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
  },
  updateDoneBy:{ type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: new Date(), required: true },
  isActive:{ type: Boolean, default: true, required: true}
});

activitySchema.index({businessUnit:1,updateDoneBy:1,isActive:1})

module.exports = mongoose.model("Activity", activitySchema);
