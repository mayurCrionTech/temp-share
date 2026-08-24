const workOrderTaskSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order task",
            example: "67737e571bc6088365e2ee67"
        },
        workOrderId: {
            type: "string",
            description: "ID of the associated work order",
            example: "67737e531bc6088365e2cf2b"
        },
        description: {
            type: "string",
            description: "A detailed description of the task",
            example: "Task A"
        },
        order: {
            type: "number",
            description: "The order number of the task in the work order",
            example: 3
        },
        isCompleted: {
            type: "string",
            description: "Indicates whether the task is completed",
            example: "false"
        },
        images: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for images related to the task",
                example: "66b9fe45278a269d2a8a8f43"
            }
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the task",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the task",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the task was created",
            example: "2024-11-26T06:18:10.867+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the task was last updated",
            example: "2024-12-06T05:29:10.659+00:00"
        },
        isDeleted: {
            type: "string",
            description: "Indicates if the task has been deleted",
            example: false
        }
    },
    required: ["workOrderId", "description", "isCompleted", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = { workOrderTaskSchema }