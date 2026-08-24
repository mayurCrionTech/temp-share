const workOrderPartRequiredSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the required part record",
            example: "6746c82fa6d735533cc88c59"
        },
        workOrder: {
            type: "string",
            description: "ID of the associated work order",
            example: "67456a7c165deb5bf4f7a39d"
        },
        name: {
            type: "string",
            description: "The name of the required spare part",
            example: "Test Part"
        },
        quantity: {
            type: "number",
            description: "The quantity of the required spare part",
            example: 4
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who recorded the required part",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the required part record",
            example: "66e46dbe6a02a636f546ed46"
        },
        isDeleted: {
            type: "string",
            description: "Indicates if the required part record has been deleted",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the required part record was created",
            example: "2024-11-27T07:20:15.637+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the required part record was last updated",
            example: "2024-12-17T05:29:30.361+00:00"
        },
    },
    required: ["workOrder", "name", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = { workOrderPartRequiredSchema }