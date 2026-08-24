const LogStructureschema = {
    type: "object",
    properties: {
        logId : {
            type: "string",
            description: "ID of the associated log",
            example: "673dcf0b71ba69de15d58780"
        },
        version: {
            type: "number",
            description: "Version of the log structure",
            example: "1"
        },
        image: {
            type: "array",
            items: {
                type: "string",
                description: "List of image URLs or IDs associated with the log",
                example: "66ba01d90d19d3e138726b3c"
            },
        },
        note: {
            type: "string",
            description: "Additional notes for the log structure",
            example: ""
        },
        templateId: {
            type: "string",
            description: "ID of the associated template",
            example: "66ba01d90d19d3e138726b3c"
        },
        isActive: {
            type: "boolean",
            description: "Indicates if the log structure is active",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "User ID of the creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updator",
            example: "66e46dbe6a02a636f546ed46"
        },
        businessUnit: {
            type: "string",
            description: "ID of the associated business unit",
            example: "6641959acbe6ea3941e60789"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of creation",
            example: "2024-11-20T12:00:47.974+00:00"
        },
        updatedBy: {
            type: "string",
            format: "date-time",
            description: "Timestamp of last update",
            example: "2024-11-20T12:00:47.974+00:00"
        },
    },
    required: ["templateId","businessUnit"]
   }

   module.exports = {LogStructureschema}