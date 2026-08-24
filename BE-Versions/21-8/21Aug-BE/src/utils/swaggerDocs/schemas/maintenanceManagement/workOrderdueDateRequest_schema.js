const workOrderDueDateRequestSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order due date record",
            example: "67ca9c0db2469b7924532819"
        },
        workOrderId: {
            type: "string",
            description: "ID of the associated work order",
            example: "67ca9aaeb2469b7924532720"
        },
        reason: {
            type: "string",
            description: "The reason for requesting a due date extension",
            example: "Simple Request"
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created this due date request",
            example: "66e540856a02a636f5478090"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated this due date request",
            example: "66e540856a02a636f5478090"
        },
        approvedBy: {
            type: "string",
            description: "The ID of the user who approved the due date request",
            example: ""
        },
        requestedDate: {
            type: "string",
            format: "date-time",
            description: "The date when the due date extension was requested",
            example: "2025-09-03T00:00:00.000+00:00"
        },
        approvedDate: {
            type: "string",
            format: "date-time",
            description: "The date when the due date extension was approved",
            example: ""
        },
        isDeleted: {
            type: "string",
            description: "Indicates if the due date request has been deleted",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the due date request was created",
            example: "2025-09-03T00:00:00.000+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the due date request was last updated",
            example: "2025-09-03T00:00:00.000+00:00"
        },
    },
    required: ["workOrderId", "reason", "createdBy", "updatedBy", "requestedDate", "isDeleted", "createdAt", "updatedAt"]
}

module.exports = {workOrderDueDateRequestSchema}