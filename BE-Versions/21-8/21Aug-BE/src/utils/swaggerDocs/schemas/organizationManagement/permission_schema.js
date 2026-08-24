const permissionschema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "ID for the user Permission",
            example: "66bcaec1e5a722222c858df5"
        },
        name: {
            type: "string",
            description: "Defines the specific access level a user is allowed to perform, such as Read, Write, Update, or Delete.",
            example: "create"
        },
        businessUnit: {
            type: "string",
            description: "User Id of the businessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        permissionGroup: {
            type: "string",
            description: "PermissionGroup Id",
            example: "66bcae85e5a722222c858df1"
        },
        isEnabled: {
            type: "Boolean",
            description: "Whether the Permission is enabled",
            example: "true"
        },
        isDeleted: {
            type: "Boolean",
            description: "Whether the permission is deleted ",
            example: "false"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation date",
            example: "2024-07-01T07:03:46.454+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update Date",
            example: "2024-07-01T07:03:46.454+00:00"
        },
        createdBy: {
            type: "string",
            description: "The user Id of the creator",
            example: "66419599cbe6ea3941e6077c"
        },
        updatedBy: {
            type: "string",
            description: "The User Id of the last updater",
            example: "66419599cbe6ea3941e6077c"
        }
    },
    required:["name","businessUnit","permissionGroup","createdBy","updatedBy"]
}

module.exports = {permissionschema}