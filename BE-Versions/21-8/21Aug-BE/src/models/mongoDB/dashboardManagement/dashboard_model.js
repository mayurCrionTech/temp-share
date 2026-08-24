const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500, 
      default: null,
    },
    embedUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    businessUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);



const Dashboard = mongoose.model("Dashboard", dashboardSchema);
module.exports = Dashboard;
