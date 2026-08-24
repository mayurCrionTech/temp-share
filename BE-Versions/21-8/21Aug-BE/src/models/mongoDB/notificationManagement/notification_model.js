const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  activity: {
    type: String,
    enum: [
      "create",
      "edit",
      "delete",
      "decommission",
      "restore",
      "statusChange",
      "scheduled",
      "remarks",
      "assign",
      "unAssigned",
      "revise",
      "approve",
      "setLimitBreached",
      "minimumLevelReached",
      "dataEntryUpdate",
      "expired",
      "requested",
    ],
    required: true,
  },
  message: { type: String, required: true },
  moduleDetails: { id: { type: mongoose.ObjectId }, name: { type: String } },
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
      "spares",
      "auditAndInspection",
      "users",
      "teams",
      "documents",
    ],
    required: true,
  },
  sender: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    index: -1,
    required: true,
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
  },
  isRead: { type: String, default: false, required: true },
  createdAt: { type: Date, default: () => {
      return Date.now();
    }, required: true },
});

notificationSchema.index({receiver:1, businessUnit:1})
notificationSchema.index({isread:1, receiver:1, businessUnit:1})


module.exports = mongoose.model("Notification", notificationSchema);
