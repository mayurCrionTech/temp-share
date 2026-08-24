const  assetHistorySchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "Id of the history event",
            example: "67d2ac26d1491ff15e5ef717"
        },
        name: {
            type: "string",
            description: "Name of the asset history Event",
            example: "WorkOrderCreated"
        },
        description: {
            type: "string",
            description: "Detailed description of the history event",
            example: "WorkOrderTest 3"
        },
        status: {
            type: "string",
            description: "Current status of the history events",
            enum: ["planned","executed","missed"],
            example: "planned"
        },
        moduleId: {
            type: "string",
            description: "reference Id of the related module(workOrder)",
            example: "null"
        },
        moduleName: {
            type: "string",
            description: "The module to which this history event is related",
            enum: ["workOrders,assets"],
            example: "workOrders"
        },
        asset: {
            type: "string",
            description: "Reference Id of the associated asset",
            example: "67b4187d74fd23ab4e0bc670"
        },
        eventDate: {
            type: "string",
            format: "Date-time",
            description: "The date when the event occured",
            example: "2025-03-13T09:52:00.227+00:00"
        },
        createdAt: {
            type: "string",
            description: "The Creation date of the asset history record",
            example: "2025-03-13T09:57:58.173+00:00"
        },
        updatedAt: {
            type: "string",
            format: "Date-time",
            description: "The last updated date of the asset history record",
            example: "2025-03-13T09:57:58.173+00:00"
        },
    },
    required: ["name","description","status","asset","eventDate"]
}

module.exports = {assetHistorySchema}