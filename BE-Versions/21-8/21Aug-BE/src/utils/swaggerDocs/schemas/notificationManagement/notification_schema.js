const notificationschema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The Unique identifier of the Notification",
            example: "66f1731bf4dc250d4dc9b607"
        },
        activity: {
            type: "string",
            description: "Type of activity that triggered the notification.",
            enum: ["create", "edit", "delete", "decommission", "restore", "statusChange",
                   "scheduled", "remarks", "assign", "unAssigned", "revise", "approve",
                   "setLimitBreached", "dataEntryUpdate", "expired"],
                   example: "dataEntryUpdate"
        },
        message: {
            type: "string",
            description: "Notification message describing the event.",
            example: "has been Updated by Mohanraj V."
        },
        moduleDetails: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: "ID of the related module.",
                    example: "66f15840fc71b7f78a17378c"
                },
                name: {
                    type: "string",
                    description: "Name of the related module.",
                    example: "BLEACHER SECTION- SEP"
                },
            },
        },
        moduleName: {
            type: "string",
            description: "Name of the module the notification is related to.",
            enum: ["assets", "dashboard", "workOrders", "checklists", "logs", "plant3D",
                   "reports", "taskLibrary", "maintenancePlans", "plant3D", "3DLibrary",
                   "sparesAndInventory", "auditAndInspection", "users", "teams", "documents"],
            example: "logs"
        },
        sender: {
            type: "string",
            description: "ID of the user who sent the notification.",
            example: "66bcb5bd54aaca561aa7456c"
        },
        receiver: {
            type: "string",
            description: "ID of the user who received the notification.",
            example: "66b9e97fdf9c132bee9c2b81"
        },
        isRead: {
            type: "boolean",
            description: "Indicates whether the notification has been read.",
            example: true
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the notification was created.",
            example: "2024-09-23T13:54:35.691+00:00"
        },
    },
    required: ["activity", "message", "moduleName", "sender", "receiver", "createdAt"]
   }


   module.exports = {notificationschema}