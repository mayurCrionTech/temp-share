const  userPermissionschema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "ID of the User Permission",
            example: "67c6a002d2871ebc14a2ad1b"
        },
        user: {
            type: "string",
            description: "Reference to the User associated with this permission record.",
            example: "67c6a002d2871ebc14a2ad16"
        },
        positivePermission: {
            type: ["string"],
            description: "List of explicitly granted permissions",    
        },
        negativePermission: {
            type: ["string"],
            description: "List   of explicitly denied permissions",
        },
        createdBy: {
            type: "string",
            description: "Reference to the User who created this permission record",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "Reference to the User who last updated this permission record",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the permission record was created.",
            example: "2025-03-04T06:38:58.916+00:00"
        },
        updateAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the permission record was last updated",
            example: "2025-03-04T06:38:58.916+00:00"
        },
    },
    required: ["user", "createdBy", "updatedBy"]
   }

   module.exports = {userPermissionschema}