/*
date              cr/qid      comments
20-march-2026     CR0001      model updated - added id's for dropdown options
*/

const mongoose = require("mongoose");
const schema = mongoose.Schema;
const assetConstant = assetConstants();

const statusHistorySchema = new schema(
  {
    status: {
      type: String,
      enum: Object.values(assetConstant.status),
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const assetSchema = new schema(
  {
    status: {
      type: String,
      enum: {
        values: Object.values(assetConstant.status),
        message: "{VALUE} is not a valid assetMode",
      },
    },
    images: {
      type: [mongoose.SchemaTypes.ObjectId],
      default: [],
      ref: "File",
      max: [6, "Asset images exceeds the maximum allowed length of 6 images"],
    },
    qrCode: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "File",
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    generalDetails: {
      // type: Object,
      name: {
        type: String,
        maxLength: [
          50,
          "name exceeds the maximum allowed length of 50 characters",
        ],
        required: [true, "please provide Asset name"],
      },
      number: {
        type: String,
        maxLength: [
          15,
          "number exceeds the maximum allowed length of 15 characters",
        ],
        required: [true, "please provide Asset Number"],
      },
      description: {
        type: String,
        maxLength: [
          1000,
          "description exceeds the maximum allowed length of 1000 characters",
        ],
      },
      //   runningMode: {
      //     type: String,
      //     enum: {
      //       values: Object.values(assetConstant.generalDetails.runningMode),
      //       message: "{VALUE} is not a valid runningMode",
      //     },
      //   },
      // CR0001
      runningMode: {
        type: String,
        // default: null,
      },
      // runningModeId: {
      //   type: Object,
      //   // ref: "DropdownOption",
      //   default: null,
      // },
      // CR0001
      runningModeId: {
        // type: Object,
        type: mongoose.Schema.Types.ObjectId,
        // default: null,
      },
      businessUnit: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "BusinessUnit",
        // required: true
      },
      // CR0001
      category: {
        type: mongoose.SchemaTypes.ObjectId,
        // ref: "AssetCategory",
      },
      department: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Department",
        required: true,
      },
      // criticalityLevel: {
      //   type: String,
      //   enum: {
      //     values: Object.values(assetConstant.generalDetails.criticalityLevel),
      //     message: "{VALUE} is not a valid criticalityLevel",
      //   },
      //   // required: true
      // },
      // CR0001
      criticalityLevel: {
        type: String,
        // default: null,
      },
      criticalityLevelId: {
        type: mongoose.Schema.Types.ObjectId,
        // default: null,
      },
      // functionalArea: {
      //   type: String,
      //   enum: {
      //     values: Object.values(assetConstant.generalDetails.functionalArea),
      //     message: "{VALUE} is not a valid functionalArea",
      //   },
      //   // required: true
      // },
      // CR0001
      functionalArea: {
        type: String,
        // default: null,
      },
      functionalAreaId: {
        type: mongoose.Schema.Types.ObjectId,
        // default: null,
      },
      owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
    },
    specifications: {
      // type: Object,
      manufacturingDetails: {
        // type: Object,
        type: {
          type: String,
          enum: {
            values: Object.values(
              assetConstant.specifications.manufacturingDetails.type,
            ),
            message: "{VALUE} is not a valid assetType",
          },
        },
        make: {
          type: String,
          maxLength: [
            50,
            "assetMake exceeds the maximum allowed length of 50 characters",
          ],
        },
        model: {
          type: String,
          maxLength: [
            50,
            "assetModel exceeds the maximum allowed length of 50 characters",
          ],
        },
        serialNumber: {
          type: String,
          maxLength: [
            15,
            "serialNumber exceeds the maximum allowed length of 15 characters",
          ],
        },
        manufacturer: {
          type: String,
          maxLength: [
            50,
            "manufacturer exceeds the maximum allowed length of 50 characters",
          ],
        },
        installationDate: {
          type: Date,
        },
        serviceLiquid: {
          type: String,
          maxLength: [
            50,
            "serviceLiquid exceeds the maximum allowed length of 50 characters",
          ],
        },
      },
      hazardousAreaDetails: {
        // type: Object,
        zoneClassification: {
          type: String,
          maxLength: [
            3,
            "zoneClassification exceeds the maximum allowed length of 3 characters",
          ],
          // required:[true,'please provide zoneClassification'],
        },
        gasGroup: {
					type: String,
					maxLength: [3, "gasGroup exceeds the maximum allowed length of 3 characters"],
          validate: {
            validator: function (v) {
              // Regex to match only numeric characters or text
              return /^[0-9a-zA-Z]+$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid gasGroup! Only alphanumeric characters are allowed.`,
          },
          // required:[true,'please provide gasGroup'],
        },
        temperatureClassification: {
					type: String,
					maxLength: [3, "temperatureClassification exceeds the maximum allowed length of 3 characters"],
          validate: {
            validator: function (v) {
              // Regex to match only numeric characters or text
              return /^[0-9a-zA-Z]+$/.test(v);
            },
            message: (props) =>
              `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
          },
          // required:[true,'please provide temperatureClassification'],
        },
      },
      warrantyDetails: {
        // type: Object,
        isWarrantyIncluded: {
          type: Boolean,
        },
        supplierName: {
          type: String,
          maxLength: [
            50,
            "supplierName exceeds the maximum allowed length of 50 characters",
          ],
        },
        supplierEmail: {
          type: String,
          maxLength: [
            320,
            "supplierEmail exceeds the maximum allowed length of 320 characters",
          ],
        },
        warrantyPeriod: {
          value: {
            type: String,
            validate: {
              validator: function (v) {
                // Regex to match only numeric characters or text
                return /^[0-9a-zA-Z]+$/.test(v);
              },
              message: (props) =>
                `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
            },
            maxLength: [
              3,
              "duration exceeds the maximum allowed length of 3 characters",
            ],
          },
          type: {
            type: String,
            enum: {
              values: Object.values(
                assetConstant.specifications.warrantyDetails.warrantyPeriod
                  .type,
              ),
              message: "{VALUE} is not a valid period",
            },
          },
        },
        // CR0001
        // warrantyPeriod: {
        //   id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //   },
        //   value: {
        //     type: String,
        //     validate: {
        //       validator: function (v) {
        //         // Regex to match only numeric characters or text
        //         return /^[0-9a-zA-Z]+$/.test(v);
        //       },
        //       message: (props) =>
        //         `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
        //     },
        //     maxLength: [
        //       3,
        //       "duration exceeds the maximum allowed length of 3 characters",
        //     ],
        //   },
        //   type: {
        //     type: String,
        //   },
        // },
        warrantyEndDate: {
          type: Date,
        },
        termsAndConditions: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "File",
        },
      },
      calibrationDetails: {
        // type: Object,
        lastCalibrationDate: {
          type: Date,
        },
        calibrationCycle: {
          value: {
            type: String,
            validate: {
              validator: function (v) {
                // Regex to match only numeric characters or text
                return /^[0-9a-zA-Z]+$/.test(v);
              },
              message: (props) =>
                `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
            },
            maxLength: [
              3,
              "duration exceeds the maximum allowed length of 3 characters",
            ],
          },
          type: {
            type: String,
            enum: {
              values: Object.values(
                assetConstant.specifications.calibrationDetails.calibrationCycle
                  .type,
              ),
              message: "{VALUE} is not a valid period",
            },
          },
        },
        // CR0001
        // calibrationCycle: {
        //   id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     // default: null,
        //   },
        //   value: {
        //     type: String,
        //     validate: {
        //       validator: function (v) {
        //         if (v == null || v === "") return true;
        //         return /^[0-9a-zA-Z]+$/.test(v);
        //       },
        //       message: (props) =>
        //         `${props.value} is not a valid calibrationCycle value. Only alphanumeric characters are allowed.`,
        //     },
        //     maxLength: [
        //       3,
        //       "duration exceeds the maximum allowed length of 3 characters",
        //     ],
        //   },
        //   type: {
        //     type: String,
        //     // default: null,
        //   },
        // },
        corrosionCheckDate: {
          type: Date,
        },
        corrosionCycle: {
          value: {
            type: String,
            validate: {
              validator: function (v) {
                // Regex to match only numeric characters or text
                return /^[0-9a-zA-Z]+$/.test(v);
              },
              message: (props) =>
                `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
            },
            maxLength: [
              3,
              "duration exceeds the maximum allowed length of 3 characters",
            ],
          },
          type: {
            type: String,
            enum: {
              values: Object.values(
                assetConstant.specifications.calibrationDetails.corrosionCycle
                  .type,
              ),
              message: "{VALUE} is not a valid period",
            },
          },
        },
        // CR0001
        // corrosionCycle: {
        //   id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     // default: null,
        //   },
        //   value: {
        //     type: String,
        //     validate: {
        //       validator: function (v) {
        //         if (v == null || v === "") return true;
        //         return /^[0-9a-zA-Z]+$/.test(v);
        //       },
        //       message: (props) =>
        //         `${props.value} is not a valid corrosionCycle value. Only alphanumeric characters are allowed.`,
        //     },
        //     maxLength: [
        //       3,
        //       "duration exceeds the maximum allowed length of 3 characters",
        //     ],
        //   },
        //   type: {
        //     type: String,
        //     // default: null,
        //   },
        // },
        designThickness: {
          value: {
            type: String,
            validate: {
              validator: function (v) {
                // Regex to match only numeric characters or text
                return /^[0-9a-zA-Z]+$/.test(v);
              },
              message: (props) =>
                `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
            },
            maxLength: [
              3,
              "value exceeds the maximum allowed length of 3 characters",
            ],
          },
          type: {
            type: String,
            enum: {
              values: Object.values(
                assetConstant.specifications.calibrationDetails.designThickness
                  .type,
              ),
              message: "{VALUE} is not a valid type",
            },
          },
        },
        // CR0001
        // designThickness: {
        //   id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     // default: null,
        //   },
        //   value: {
        //     type: String,
        //     validate: {
        //       validator: function (v) {
        //         // Regex to match only numeric characters or text
        //         return /^[0-9a-zA-Z]+$/.test(v);
        //       },
        //       message: (props) =>
        //         `${props.value} is not a valid temperatureClassification! Only alphanumeric characters are allowed.`,
        //     },
        //     maxLength: [
        //       3,
        //       "value exceeds the maximum allowed length of 3 characters",
        //     ],
        //   },
        //   type: {
        //     type: String,
        //   },
        // },
        allowableThickness: {
          value: {
            type: Number,
            max: [
              3,
              "value exceeds the maximum allowed length of 3 characters",
            ],
          },
          type: {
            type: String,
            enum: {
              values: Object.values(
                assetConstant.specifications.calibrationDetails
                  .allowableThickness.type,
              ),
              message: "{VALUE} is not a valid type",
            },
          },
        },
        // CR0001
        // allowableThickness: {
        //   id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //   },
        //   value: {
        //     type: Number,
        //     max: [
        //       3,
        //       "value exceeds the maximum allowed length of 3 characters",
        //     ],
        //   },
        //   type: {
        //     type: String,
        //   },
        // },
        meanTimeToRepair: {
          type: Number,
          max: [
            3,
            "meanTimeToRepair exceeds the maximum allowed length of 3 characters",
          ],
        },
        meanTimeBetweenFailures: {
          type: Number,
          max: [
            3,
            "meanTimeBetweenFailures exceeds the maximum allowed length of 3 characters",
          ],
        },
        lastAuditDate: {
          type: Date,
        },
      },
    },
    locationAndHierarchyDetails: {
      // type: Object,
      geographicalCoordinates: {
        // type: Object,
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
        elevation: {
          type: Number,
        },
      },
      hierarchy: {
        // type: Object,
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Asset",
          default: null,
        },
        hierarchyPath: [mongoose.Schema.Types.ObjectId],
      },
    },
    isRegistrationCompleted: {
      type: Boolean,
      default: false,
    },
    // spares :{
    // 	type: [mongoose.SchemaTypes.ObjectId],
    // 	default: [],
    // 	ref: "SpareAndInventory",
    // },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isMaintenancePresent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// assetSchema.virtual("availabilityHours").get(function () {
//   let totalMs = 0;

//   for (let i = 0; i < this.statusHistory.length; i++) {
//     const current = this.statusHistory[i];
//     const next = this.statusHistory[i + 1];
//     // Only count time if current status = "active" and next = "breakdown"
//     if (current.status === "Active") {
//       const end =
//         next && next.status === "Breakdown"
//           ? next.startTime
//           : current.endTime || new Date();

//       totalMs += end - current.startTime;
//     }
//   }
//   return totalMs / (1000 * 60 * 60); // hours
// });

// assetSchema.virtual("availabilityHours").get(function () {
//   let totalMs = 0;

//   for (let i = 0; i < this.statusHistory.length; i++) {
//     const current = this.statusHistory[i];
//     const next = this.statusHistory[i + 1];

//     if (current.status === "Active" && current.startTime) {
//       let end;

//       // If there’s no endTime → asset is still active → count till now
//       if (!current.endTime) {
//         end = new Date();
//       } else if (next && next.status === "Breakdown") {
//         end = next.startTime;
//       } else {
//         end = current.endTime;
//       }

//       // Add the duration
//       totalMs += end - current.startTime;
//     }
//   }

//   return totalMs / (1000 * 60 * 60); // convert ms → hours
// });

assetSchema.virtual("utilizationHours").get(function () {
  let totalMs = 0;

  for (let i = 0; i < this.statusHistory.length; i++) {
    const current = this.statusHistory[i];
    const next = this.statusHistory[i + 1];

    // Only count time if current status = "active" and next = "breakdown"
    if (current.status === "Active") {
      const end =
        next && next.status === "Standby"
          ? next.startTime
          : current.endTime || new Date();

      totalMs += end - current.startTime;
    }
  }

  return totalMs / (1000 * 60 * 60); // hours
});

// 🔹 Total Breakdown Hours (downtime duration)
//
assetSchema.virtual("breakdownHours").get(function () {
  const now = new Date();
  const totalMs = this.statusHistory
    .filter((s) => s.status === "Breakdown")
    .reduce((sum, s) => sum + ((s.endTime || now) - s.startTime), 0);

  return totalMs / (1000 * 60 * 60);
});

assetSchema.virtual("availabilityHours").get(function () {
  const now = new Date();
  const totalMs = this.statusHistory
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + ((s.endTime || now) - s.startTime), 0);
  return totalMs / (1000 * 60 * 60);
});

assetSchema.virtual("standbyHours").get(function () {
  const now = new Date();
  const totalMs = this.statusHistory
    .filter((s) => s.status === "Standby")
    .reduce((sum, s) => sum + ((s.endTime || now) - s.startTime), 0);

  return totalMs / (1000 * 60 * 60);
});

assetSchema.index({ isDeleted: 1, createdAt: -1 });
assetSchema.index({
  isDeleted: 1,
  "generalDetails.businessUnit": 1,
  "generalDetails.name": 1,
});
assetSchema.index({
  isDeleted: 1,
  "generalDetails.businessUnit": 1,
  "generalDetails.number": 1,
});
assetSchema.index({
  isDeleted: 1,
  "generalDetails.businessUnit": 1,
  "generalDetails.department": 1,
});
assetSchema.index({
  isDeleted: 1,
  "generalDetails.businessUnit": 1,
  status: 1,
});
assetSchema.index({ isDeleted: 1, isMaintenancePresent: 1 });
assetSchema.index({ isDeleted: 1, updatedAt: 1 });
assetSchema.index({ _id: 1, isDeleted: 1 });

const Assets = mongoose.model("Asset", assetSchema, "assets");
module.exports = { Assets, assetConstant };

function assetConstants() {
  return {
    status: {
      Active: "Active",
      Standby: "Standby",
      Breakdown: "Breakdown",
      UnderMaintenance: "Under Maintenance",
      Decommissioned: "Decommissioned",
    },
    generalDetails: {
      runningMode: {
        Rotating: "Rotating",
        Static: "Static",
      },
      criticalityLevel: {
        Emergency: "Emergency",
        Critical: "Critical",
        Normal: "Normal",
      },
      functionalArea: {
        // WaterDewPointDepression: "Water Dew Point Depression",
        // GlycolRegeneration: "Glycol Regeneration",
        // HydroCarbonDewPointDepression: "Hydro Carbon DewPoint Depression",
        // MethanolInjectionForHydrateMitigation: "Methanol Injection for Hydrate Mitigation",
        Utilities: "Utilities",
        ProductionRefinery: "Production - Refinery",
        Packing: "Packing",
        Quality: "Quality",
        Lab: "Lab",
        Mechanical: "Mechanical",
        Electrical: "Electrical",
        TankFarm: "Tank Farm",
      },
    },
    specifications: {
      manufacturingDetails: {
        type: {
          StandardAsset: "Standard Asset",
          FabricatedAsset: "Fabricated Asset",
        },
      },
      warrantyDetails: {
        warrantyPeriod: {
          type: {
            Months: "Months",
            Years: "Years",
          },
        },
      },
      calibrationDetails: {
        calibrationCycle: {
          type: {
            Months: "Months",
            Years: "Years",
          },
        },
        corrosionCycle: {
          type: {
            Months: "Months",
            Years: "Years",
          },
        },
        designThickness: {
          type: {
            mm: "mm",
            Inches: "Inches",
          },
        },
        allowableThickness: {
          type: {
            mm: "mm",
            Inches: "Inches",
          },
        },
      },
    },
  };
}
