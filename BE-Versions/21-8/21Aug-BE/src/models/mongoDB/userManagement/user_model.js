const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  name: {
    type: String,
    // required: true,
  },
  buUserId: {
    type: String,
    // required: function () {
    //   return !this.isDraft;
    // },
    // unique: function () {
    //   return !this.isDraft;
    // },
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  employeeId: {
    type: String,
    // required: true,
    // unique: true,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  email: {
    type: String,
    lowercase: true, // it will convert the email into the lower case and then store in the db,
    minLength: 10, // anything less than 10 will fail
    // unique: true,
  },
  contactNumber: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  shift: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Shift",
  },
  image: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File",
  },
  eSignature: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "File",
  },
  userImage: {
    type: String,
    // required: function() {
    //     return !this.isSuperAdmin;
    // },
    ref: "UserImage",
    // default: "default"
  },
  businessUnit: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BusinessUnit",
    // required: function () {
    //   return !this.isSuperAdmin;
    // },
  },
  department: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Department",
    // required: function () {
    //   return !this.isSuperAdmin;
    // },
  },
  userType: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "UserType",
    // required: function () {
    //   return !this.isSuperAdmin;
    // },
  },
  designation: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Designation",
    // required: function () {
    //   return !this.isSuperAdmin;
    // },
  },
  userPermission: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "UserPermission",
    // required: function() {
    //     return !this.isSuperAdmin;
    // },
  },
  userAuthentication: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "UserAuthentication",
    // required: true
  },
  team: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Team",
    default: null,
  },

  reportsTo: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    // default: function () {
    //   return this.isSuperAdmin ? this._id : null;
    // },
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    default: function () {
      return this.isSuperAdmin ? this._id : null;
    },
  },
  updatedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    default: function () {
      return this.isSuperAdmin ? this._id : null;
    },
  },
  createdAt: {
    // I want to default to a new date
    type: Date,
    immutable: true, // This will ensure the createdAt column is never updated but once in the start
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
});

userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,businessUnit:1,department:1,userType:1,designation:1,
  team:1,reportsTo:1,createdAt:-1,name:1
})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,department:1,userType:1,designation:1,
  team:1,reportsTo:1,createdAt:-1,name:1
})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,userType:1,designation:1,
  team:1,reportsTo:1,createdAt:-1,name:1
})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,designation:1,
  team:1,reportsTo:1,createdAt:-1,name:1
})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,team:1,reportsTo:1,createdAt:-1,name:1})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,reportsTo:1,createdAt:-1,name:1})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,createdAt:-1,name:1})
userSchema.index({isEnabled:1,isDeleted:1,isDraft:1,name:1})
userSchema.index({isDeleted:1,businessUnit:1,email:1})
userSchema.index({isDeleted:1,businessUnit:1,employeeId:1})
userSchema.index({isDeleted:1,businessUnit:1,buUserId:1})
userSchema.index({isDeleted:1,isDraft:1,businessUnit:1})
userSchema.index({isDeleted:1,isDraft:1,department:1,team:1})




module.exports = mongoose.model("User", userSchema, "users");
