const taskLibrarySchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the task library entry",
            example: "67b6e9520aeef8a1a5117f1f"
        },
        name: {
            type: "string",
            description: "The name of the task library entry, limited to 50 characters",
            example: "Task A"
        },
        number: {
            type: "string",
            description: "ID or reference number for the task",
            example: "TSK-00009"
        },
        description: {
            type: "string",
            description: "A detailed description of the task, limited to 1000 characters",
            example: "Task A started"
        },
        assetCategory: {
            type: "string",
            description: "ID of the associated asset category",
            example: "66f1cad3eec09fbcae25c8b4"
        },
        businessUnit: {
            type: "string",
            description: "ID of the business unit",
            example: "6641959acbe6ea3941e60789"
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates whether the task library entry is deleted",
            example: false
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created this task",
            example: "66e46f496a02a636f546f1fc"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated this task",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when this task was created",
            example: "2025-02-20T08:35:30.116+00:00"
        },
        updatedAt: {
            type: "string",
            description: "The timestamp when this task was last updated",
            example: "2025-02-21T06:26:25.411+00:00"
        }
    },
    required: ["name", "businessUnit", "createdBy", "updatedBy"]
}

module.exports = { taskLibrarySchema }