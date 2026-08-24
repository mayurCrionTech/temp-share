const mongoose = require("mongoose");

const fieldTypes = {
  MULTIPLE_CHOICE: "multipleChoice",
  CHECKBOXES: "checkboxes",
  DROPDOWN: "dropdown",
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
};

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
          required: true,
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
                  value.length > 0 &&
                  value.every(
                    (item) => typeof item === "object" && !Array.isArray(item)
                  )
                );
              }
              return false;
            },
            message: (props) => {
              return `${props.value} is not a valid type`;
            },
          },
        },
        type: {
          type: String,
          enum: Object.values(fieldTypes),
          required: true,
        },
        index: {
          type: Number,
          required: true,
        },
        asset: {
          type: String,
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
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const TemplateModel = mongoose.model("checklistTemplate", templateSchema);

module.exports = { TemplateModel };
