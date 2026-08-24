const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  permissionGroup: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "PermissionGroup",
    required: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => {
      return Date.now();
    },
  },
  updatedAt: {
    type: Date,
    default: () => {
      return Date.now();
    },
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
});

permissionSchema.index({isDeleted:1, businessUnit:1, isEnabled:1, name:1, permissionGroup:1})
permissionSchema.index({isDeleted:1, name:1, permissionGroup:1, businessUnit:1})
permissionSchema.index({isDeleted:1, businessUnit:1, permissionGroup:1,})


const Permission = mongoose.model(
  "Permission",
  permissionSchema,
  "permissions"
);

module.exports = Permission;
