const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true
  },
  users: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User"
    }
  ],
  department: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Department"
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => {
      return Date.now();
    }
  },
  updatedAt: {
    type: Date,
    default: () => {
      return Date.now();
    }
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
  }
});

teamSchema.index({isDeleted:1, isEnabled:1, businessUnit:1,department:1,name:1})
teamSchema.index({isEnabled:1, isDeleted:1,department:1,name:1})
teamSchema.index({isEnabled:1, isDeleted:1, name:1})
teamSchema.index({isDeleted:1, businessUnit:1})
teamSchema.index({isDeleted:1, department:1})





module.exports = mongoose.model("Team", teamSchema, "teams");
