const designationSchema = {
    type : "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for designation",
            example: "66a9e10a473e2c8b397bf20c"
        },
        name: {
            type: "string",
            description: "Name of the Designation",
            example: "Operational Operator"
        },
        businessUnit: {
            type: "string",
            description: "Id of the business unit",
            example: "6641959acbe6ea3941e60789"
        },
        userType: {
            type: "string",
            description: "Id of the userType",
            example: "66a9dce3d82efb35acf71224"
        },
        permissions: {
            type: "array",
            items: {
                type: "string",
                description: "Permission Id",
                example: ["660fe1aaf0f6f1b8c8ec041b", "6610ab1234abcd5678ef9012"]
            }
        },
        isEnabled: {
            type: "boolean",
            description: "Whether the designation is enabled",
            example: true
        },
        isDeleted: {
            type: "boolean",
            description: "Whether the designation is deleted",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation date",
            example: "2024-07-31T06:59:28.837+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update date",
            example: "2024-07-31T06:59:28.837+00:00"
        },
        createdBy: {
            type: "string",
            description: "User Id of the creator",
            example: "6682640ace2038006d1892c2"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: "670cb56ce3faf77c42935de6"
        }
    },
    required: ["name", "businessUnit", "userType", "createdBy", "updatedBy"]
}

module.exports = { designationSchema }