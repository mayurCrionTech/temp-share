const workOrderToolRequiredSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order tool requirement",
            example: "6763b510ce96f696fd653c39"
        },
        workOrder: {
            type: "string",
            description: "ID of the associated work order",
            example: "6762b17b559892e7bcb9100c"
        },
        name: {
            type: "string",
            description: "The name of the required tool",
            example: "Tool 3"
        },
        quantity: {
            type: "number",
            description: "The quantity of the required tool",
            example: 2
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the tool requirement",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the tool requirement",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the tool requirement was created",
            example: "2024-12-19T05:54:24.975+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the tool requirement was last updated",
            example: "2024-12-19T05:54:24.975+00:00"
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the tool requirement has been deleted",
            example: false
        }
    },
    required: ["workOrder", "name", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = { workOrderToolRequiredSchema }