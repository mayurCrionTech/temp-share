const tasksSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the task",
            example: "67b83b0d2aa939545fb9adde"
        },
        taskLibrary: {
            type: "string",
            description: "The ID of the associated task from the Task Library",
            example: "6752a7539d576bc8e26f5c9d"
        },
        maintenancePlan: {
            type: "string",
            description: "The ID of the associated maintenance plan",
            example: "675a9ed941a55dd50c1818be"
        },
        description: {
            type: "string",
            description: "A detailed description of the task, limited to 1000 characters",
            example: "Task A"
        },
        order: {
            type: "number",
            description: "The order in which the task should be executed",
            example: 3
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates whether the task is deleted",
            example: false
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created this task",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated this task",
            example: "66e46f7e6a02a636f546f299"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when this task was created",
            example: "2024-12-26T14:56:43.067+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when this task was last updated",
            example: "2025-02-06T12:53:54.590+00:00"
        }
    },
    required: ["createdBy", "updatedBy"]
}

module.exports = { tasksSchema }