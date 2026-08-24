const mongoose = require("mongoose");
const model3DFileTypes = {
  GLB: "glb",
  FBX: "fbx",
  OBJ: "obj",
  PNG: "png",
  JPG: "jpg",
  SVG: "svg",
};
const userUploaded3DModelSchema = new mongoose.Schema(
  {

    name: { type: String, required: true },

    displayName3D: String,
    displayName2D: String,

    uuidName3D: String,
    uuidName2D: String,

    path3D: {
       type: mongoose.SchemaTypes.ObjectId,
      ref: "File",
      required: true,
    },
    path2D: {
       type: mongoose.SchemaTypes.ObjectId,
      ref: "File",
      required: true,
    },

    size3D: String,
    size2D: String,

    extension3D: {
      type: String,
      enum: Object.values(model3DFileTypes),
    },

    extension2D: {
      type: String,
      enum: Object.values(model3DFileTypes),
    },

    type3D: String,
    type2D: String,

    version: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
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
  },
  { timestamps: true }
);

userUploaded3DModelSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model(
  "UserUploaded3DModel",
  userUploaded3DModelSchema,
  "userUploaded3DModels"
);
