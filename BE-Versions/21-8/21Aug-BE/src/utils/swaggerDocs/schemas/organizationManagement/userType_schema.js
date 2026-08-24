const userTypeSchema = {
    type : "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the user type",
            example: "670c53b911c4124d07252585"
        },
        name: {
            type: "string",
            description: "Defines the role or category of the user within the system, such as Admin, Manager, or Employee.",
            example: "Manager"
        },
        businessUnit: {
            type: "string",
            description: "Id of the businessUnit",
            example: "670c516311c4124d07252580"
        },
        department: {
            type: "string",
            description: "Id of the department",
            example: "66a9da82d82efb35acf711fd"
        },
        isEnabled: {
            type: "boolean",
            description: "Whether the userType is enabled",
            example: true
        },
        isDeleted: {
            type: "boolean",
            description: "Whether the userType is deleted",
            example: false
        },
        createdAt: {
            type: "string",
            description: "Creation date",
            example: "2024-07-31T07:00:10.239+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update date",
            example: "2024-07-31T07:00:10.239+00:00"
        },
        createdBy: {
            type: "string",
            description: "User Id of the creator",
            example: "6682640ace2038006d1892c"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: "6682640ace2038006d1892c"
        }
    },
    required: ["name", "businessUnit", "department"]
}

module.exports = { userTypeSchema }