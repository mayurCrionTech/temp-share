const workOrderConsumableSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order consumable",
            example: "6763b51fce96f696fd653c3d"
        },
        workOrder: {
            type: "string",
            description: "ID of the work order associated with this consumable",
            example: "6762b17b559892e7bcb9100c"
        },
        name: {
            type: "string",
            description: "The name of the consumable item used in the work order",
            example: "Consumable 1"
        },
        quantity: {
            type: "number",
            description: "The number of units of the consumable item used",
            example: 5
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created this consumable record",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated this consumable record",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the consumable record was created",
            example: "2024-12-19T05:54:39.243+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the consumable record was last updated",
            example: "2024-12-19T05:54:39.243+00:00"
        },
        isDeleted: {
            type: "string",
            description: "Indicates if the consumable record has been deleted",
            example: false
        }
    },
    required: ["workOrder", "name", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = {workOrderConsumableSchema}