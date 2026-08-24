const spareStockSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique identifier of the Spare Stock entry"
    },
    spare: {
      type: "string",
      description: "ID of the spare item this stock belongs to",
      example: "60d21b4667d0d8992e610c85"
    },
    quantity: {
      type: "number",
      description: "Quantity of the spare in stock. Allows up to 8 digits."
    },
    units: {
      type: "string",
      description: "Measurement unit of the spare stock",
      enum: ["mm", "Litres", "No's"],
      example: "No's"
    },
    cost: {
      type: "number",
      description: "Cost of the spare stock. Allows up to 8 digits.",
      example: 150
    },
    expiryDate: {
      type: "string",
      format: "date-time",
      description: "Expiry date of the spare stock, if applicable"
    },
    status: {
      type: "string",
      description: "Approval status of the spare stock",
      enum: ["pendingForApproval", "approved", "resubmit"]
    },
    updatedBy: {
      type: "string",
      description: "User ID of the person who last updated the spare stock",
      example: "60d21b4667d0d8992e610c85"
    },
    createdBy: {
      type: "string",
      description: "User ID of the person who created the spare stock",
      example: "60d21b4667d0d8992e610c85"
    },
    isActive: {
      type: "boolean",
      description: "Indicates whether this spare stock entry is active",
      default: true
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the spare stock entry was created"
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the spare stock entry was last updated"
    }
  },
  required: ["spare", "quantity", "units", "updatedBy", "createdBy"]
};

module.exports = { spareStockSchema };
