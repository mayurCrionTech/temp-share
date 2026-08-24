const permissionGroupSchema = {
    type : "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the permission group",
            example: "676e7bcfab3fde0329c5d081"
        },
        name: {
            type: "string",
            description: "The title assigned to the permission group for role management",
            example: "workOrders"
        },
        businessUnit: {
            type: "string",
            description: "Id of the businessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        isEnabled: {
            type: "boolean",
            description: "Whether the permissionGroup is enabled",
            example: true
        },
        isDeleted: {
            type: "boolean",
            description: "Whether the permissionGroup is deleted",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation date",
            example: "2024-12-27T10:05:03.097+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update date",
            example:  "2024-12-27T10:05:03.097+00:00"
        },
        createdBy: {
            type: "string",
            description: "User Id of the creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: "66e46dbe6a02a636f546ed46"
        }
    },
    required: ["name", "businessUnit", "createdBy", "updatedBy"]
}

module.exports = { permissionGroupSchema }