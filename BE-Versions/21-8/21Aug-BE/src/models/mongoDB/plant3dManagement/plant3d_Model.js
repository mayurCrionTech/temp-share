const mongoose = require("mongoose");

const modelTypeEnum = {
  STANDARD_MODEL: "Standard3DModel",
  USER_UPLOADED_MODEL: "UserUploaded3DModel",
  PLANT3D_MODEL: "Plant3DModel",
};
const positionSchema = new mongoose.Schema(
  {
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    z: { type: Number, default: null },
  },
  { _id: false }
);

const rotationSchema = new mongoose.Schema(
  {
    x: { type: Number, default: null },
    y: { type: Number, default: null },
    z: { type: Number, default: null },
  },
  { _id: false }
);
const locationSchema = new mongoose.Schema(
  {
    id: { type: String, default: null },
    name: { type: String, default: null },
  },
  { _id: false }
)
const plant3DSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },


    // Relations
    asset: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Asset",
      required: false,
    },

    modelId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "userUploaded3DModels",
      default: null,
    },

    // 3D Spatial Data
    position: {
      type: positionSchema,
      default: {},
    },

    rotation: {
      type: rotationSchema,
      default: {},
    },

    // Geo / Location
    location: {
      type: locationSchema,
      default: {},
    },
    latitude: {
      type: String,
      default: null,
    },
    longitude: {
      type: String,
      default: null,
    },
    elevation: {
      type: String,
      default: null,
    },
    floor: {
      type: String,
      default: null,
    },

    // Type Enum
    type: {
      type: String,
      enum: {
        values: Object.values(modelTypeEnum),
        message: "{VALUE} is not a valid Plant3D type",
      },
      required: false,
    },

    // Soft Delete
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Audit Fields
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ===== Indexes (same style as maintenance plan) =====
plant3DSchema.index({ isActive: 1, asset: 1, createdAt: -1 });
plant3DSchema.index({ isActive: 1, name: 1 });
plant3DSchema.index({ isActive: 1, type: 1 });
plant3DSchema.index({ isActive: 1, location: 1 });

const Plant3DModel = mongoose.model("Plant3DModel", plant3DSchema, "plant3DModels");

module.exports = { Plant3DModel , modelTypeEnum};
