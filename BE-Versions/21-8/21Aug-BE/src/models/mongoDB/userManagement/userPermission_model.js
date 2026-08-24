const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema({
	user: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
		required: true
	},
	positivePermissions: {
		type: Array,
		default: [],
		ref: "Permission"
	},
	negativePermissions: {
		type: Array,
		default: [],
		ref: "Permission"
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
		// default: function () {
		//     return this.isSuperAdmin ? this._id : null;
		// },
	},
	updatedBy: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: "User",
		required: true
		// default: function () {
		//     return this.isSuperAdmin ? this._id : null;
		// },
	},
	createdAt: {
		// I want to default to a new date
		type: Date,
		immutable: true, // This will ensure the createdAt column is never updated but once in the start
		default: () => {
			return Date.now();
		}
	},
	updatedAt: {
		type: Date,
		default: () => {
			return Date.now();
		}
	}
});


userPermissionSchema.index({businessUnit:1,department:1,name:1})
userPermissionSchema.index({department:1,name:1})


module.exports = mongoose.model("UserPermission", userPermissionSchema, "userPermissions");
