const sparesSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "The unique identifier of the Spare"
    },
    name: {
      type: "string",
      description: "Name of the spare item"
    },
    specification: {
      type: "string",
      description: "Technical specification or details of the spare"
    },
    description: {
      type: "string",
      description: "Description of the spare item"
    },
    partNumber: {
      type: "string",
      description: "Part number or identification code of the spare"
    },
    quantity: {
      type: "number",
      description: "Available quantity of the spare"
    },
    units: {
      type: "string",
      description: "Measurement unit of the spare",
      enum: ["mm", "Litres", "No's"]
    },
    recommendedQuantity: {
      type: "number",
      description: "Recommended quantity to keep in inventory",
      default: 0
    },
    cost: {
      type: "number",
      description: "Cost of a single unit of the spare"
    },
    expiryDate: {
      type: "string",
      format: "date-time",
      description: "Expiry date of the spare, if applicable"
    },
    minimumRequiredQuantity: {
      type: "number",
      description: "Minimum quantity that should be maintained in stock"
    },
    approver: {
      type: "string",
      description: "User ID of the approver",
      example: "60d21b4667d0d8992e610c85"
    },
    category: {
      type: "string",
      description: "Category or classification of the spare"
    },
    status: {
      type: "string",
      description: "Approval status of the spare",
      enum: ["pendingForApproval", "approved", "draft", "resubmit"]
    },
    isSupplierDetails: {
      type: "boolean",
      description: "Indicates whether supplier details are available",
      default: false
    },
    supplierDetails: {
      type: "object",
      description: "Details of the supplier providing the spare",
      properties: {
        name: {
          type: "string",
          description: "Supplier name"
        },
        contactNumber: {
          type: "string",
          description: "Supplier contact number"
        },
        email: {
          type: "string",
          description: "Supplier email address (stored in lowercase)"
        },
        vendorCode: {
          type: "string",
          description: "Unique vendor code assigned to the supplier"
        }
      }
    },
    images: {
      type: "array",
      description: "List of file IDs representing images of the spare",
      items: {
        type: "string",
        description: "File ID referencing the image",
        example: "60d21b4667d0d8992e610c85"
      }
    },
    assets: {
      type: "array",
      description: "List of assets associated with this spare",
      items: {
        type: "string",
        description: "Asset ID referencing an associated asset",
        example: "60d21b4667d0d8992e610c85"
      }
    },
    businessUnit: {
      type: "string",
      description: "Reference to the Business Unit associated with this spare",
      example: "60d21b4667d0d8992e610c85"
    },
    updatedBy: {
      type: "string",
      description: "User ID of the person who last updated this spare",
      example: "60d21b4667d0d8992e610c85"
    },
    createdBy: {
      type: "string",
      description: "User ID of the person who created this spare",
      example: "60d21b4667d0d8992e610c85"
    },
    isActive: {
      type: "boolean",
      description: "Indicates whether the spare is active",
      default: true
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp of when the spare was created"
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp of when the spare was last updated"
    }
  },
  required: ["businessUnit", "updatedBy", "createdBy", "name"]
};

module.exports = { sparesSchema };
