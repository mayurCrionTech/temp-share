/*
date              cr/qid      comments
20-march-2026     CR0001      Model updated for dropdown option - selected options ids added
*/

const mongoose = require("mongoose");

const assetDocumentConstant = assetDocumentConstants();

const assetDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  number: {
    type: String,
  },
  // status: {
  //     type: String,
  //     enum: {
  //         values: Object.values(assetDocumentConstant.status),
  //         message: "{VALUE} is not a valid status"
  //     }
  // },
  // CR0001 
  status: {
    type: String,
    // enum: {
    //     values: Object.values(assetDocumentConstant.status),
    //     message: "{VALUE} is not a valid status"
    // }
  },
  // CR0001 
  statusId: {
    type: mongoose.Schema.Types.ObjectId,
    // enum: {
    //     values: Object.values(assetDocumentConstant.status),
    //     message: "{VALUE} is not a valid status"
    // }
  },
  // type: {
  //     type: String,
  //     enum: {
  //         values: Object.values(assetDocumentConstant.types),
  //         message: "{VALUE} is not a valid type"
  //     }
  // },
  // CR0001 
  type: {
    type: String,
  },
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  revisionNumber: {
    type: String,
  },
  file: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File",
  },
  asset: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Asset",
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

assetDocumentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

assetDocumentSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, name: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, number: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, asset: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, status: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, type: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, revisionNumber: 1 });
assetDocumentSchema.index({ isDeleted: 1, businessUnit: 1, createdAt: -1 });

const AssetDocument = mongoose.model(
  "AssetDocument",
  assetDocumentSchema,
  "assetDocuments",
);
module.exports = { AssetDocument, assetDocumentConstant };

function assetDocumentConstants() {
  return {
    status: {
      APPROVED_WITH_COMMENTS: "Approved With Comments",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      AS_BUILT: "As Built",
      REVISE_AND_RESUBMIT: "Revise & Resubmit",
    },
    types: {
      ENGINEERING: "Engineering",
      OPERATIONS: "Operations",
      MAINTENANCE: "Maintenance",
      SAFETY: "Safety",
      AUTOMATION: "Automation",
      ADMINISTRATION: "Administration",
      AUDIT: "Audit",
      COMMUNICATION: "Communication",
    },
  };
}
