const departmentsschema = {
    type: "object",
    properties:  {
        id: {
            type: "string",
            description: "ID of the Department",
            example: "67c03da315047ee075b3a606"
        },
        name: {
            type: "string",
            description: "Name of the department",
            example: "audit"
        },
        businessUnit:{
            type: "string",
            description: "Id of the business unit",
            example: "6641959acbe6ea3941e60789"
        },
        isEnabled: {
            type: "boolean",
            description: "Whether the department is enabled",
            example: "true"
        },
        isDeleted: {
            type: "Boolean",
            description: "Whether the department is deleted",
            example: "false"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The creation date of the department",
            example: "2024-07-31T17:03:42.805+00:00"
        },
        updatedAt:{
            type: "string",
            format: "date-time",
            description: "The last updated date of the department",
            example: "2024-07-31T17:03:42.805+00:00"
        },
        createdBy:{
            type:"string",
            description:"User Id of the creator",
            example: "67bc545f15047ee075b238f7"
        },
        updatedBy:{
            type: "string",
            description:"User ID of the last updater",
            example: "67bc545f15047ee075b238f7"
        }
    },
     required:["name", "businessUnit", "createdBy", "updatedBy"]
}

module.exports = {departmentsschema}