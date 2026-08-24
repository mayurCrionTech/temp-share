const activitySchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the activity log entry",
            example: "66b9fe46278a269d2a8a8f47"
        },
        message: {
            type: "string",
            description: "A brief description of the activity performed",
            example: "NEUTRALISATION was created"
        },
        moduleDetails: {
            id: {
                type: "string",
                description: "The ID of the module related to this activity",
                example: "66b9fe45278a269d2a8a8f42"
            },
            name: {
                type: "string",
                description: "The name of the module associated with this activity",
                example: "NEUTRALISATION"
            }
        },
        moduleName: {
            type: "string",
            description: "The name of the module where the activity occurred",
            enum: ["assets",
                "dashboard",
                "workOrders",
                "checklists",
                "logs",
                "plant3D",
                "reports",
                "taskLibrary",
                "maintenancePlans",
                "3DLibrary",
                "sparesAndInventory",
                "auditAndInspection",
                "users",
                "teams",
                "documents"],
            example: "assets"
        },
        updateDoneBy: {
            type: "string",
            description: "The ID of the user who performed the update",
            example: "66b9e97fdf9c132bee9c2b81"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the activity was recorded",
            example: "2024-08-12T11:12:41.114+00:00"
        },
        isActive: {
            type: "boolean",
            description: "Indicates whether the activity log is currently active",
            example: true
        }
    },
    required: ["message", "moduleName", "updateDoneBy", "createdAt", "isActive"]
}

module.exports = { activitySchema }