const mongoose = require("mongoose");

const fieldTypes = {
  MULTIPLE_CHOICE: "multiplechoice",
  CHECKBOXES: "checkboxes",
  DROPDOWN: "dropdown",
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
};

const formulaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['constant', 'reference', 'formula'],
      // required: true,
    },
    operation: {
      type: String,
      enum: ['add', 'subtract', 'multiply', 'divide'], // Allowed operations
      required: function () {
        return this.type === 'formula'; // Required only if type is formula
      },
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be a number (constant) or an object (reference)
      // required: true,
    },
    left: {
      type: mongoose.Schema.Types.Mixed, // Left operand
      required: function () {
        return this.type === 'formula'; // Required only if type is formula
      },
    },
    right: {
      type: mongoose.Schema.Types.Mixed, // Right operand
      required: function () {
        return this.type === 'formula'; // Required only if type is formula
      },
    },
  },
  { _id: false } // Prevents creating a separate _id for each formula entry
);

const templateSchema = new mongoose.Schema(
  {
    dataSets: [
      {
        fieldName: {
          type: String,
          required: true,
        },
        fieldValue: {
          type: mongoose.Schema.Types.Mixed,
          validate: {
            validator: function (value) {
              if (
                this.type === fieldTypes.TEXT ||
                this.type === fieldTypes.NUMBER ||
                this.type === fieldTypes.DATE
              ) {
                return typeof value === "string";
              }
              if (
                this.type === fieldTypes.MULTIPLE_CHOICE ||
                this.type === fieldTypes.CHECKBOXES ||
                this.type === fieldTypes.DROPDOWN
              ) {
                return (
                  Array.isArray(value) &&
                  value.every((item) => {
                    return (
                      typeof item.optionValue === "string" &&
                      typeof item.isActive === "boolean"
                    );
                  })
                );
              }
              return false;
            },
            message: (props) =>
              `${props.value} is not a valid value for the specified type`,
          },
          default: null,
        },
        formula: {
          type: formulaSchema,
          validator: function (value) {
            if (value) {
              // For formula, validate the structure
              return (
                typeof value === "object" &&
                value !== null &&
                (value.type === 'constant' || value.type === 'reference' || value.type === 'formula')
              );
            }
            return true;
          },
          message: (props) => {
            return `${props.value} is not a valid formula`;
          },
        },
        type: {
          type: String,
          enum: {
            values: Object.values(fieldTypes),
            message:
              "{VALUE} is not a valid field type. Allowed types are: " +
              Object.values(fieldTypes).join(", "),
          },
          required: true,
        },
        index: {
          type: Number,
          required: true,
        },
        asset: {
          type: String,
          default: null,
        },
        isMandatory:{
          type: Boolean,
          default: true
        },
        upperBound: {
          type: Number,
          default: null,
        },
        lowerBound: {
          type: Number,
          default: null,
        },
        criticalUpperBound: {
          type: Number,
          default: null,
        },
        criticalLowerBound: {
          type: Number,
          default: null,
        },
      },
    ],
    isGeneralTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      index:true,
      default: null,
    },
    createdBy: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    businessUnit: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "BusinessUnit",
      required: true
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
templateSchema.index({isGeneralTemplate:1,businessUnit:1})
templateSchema.index({templateName:1,createdBy:1})

const LogTemplateModel = mongoose.model("logTemplate", templateSchema);

module.exports = { LogTemplateModel };
