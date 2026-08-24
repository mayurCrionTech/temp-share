const workOrderRemarksSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "ID for the remark record",
            example: "67c7f02d6117f103fdcbf6b1"
        },
        workOrderId: {
            type: "string",
            description: "ID of the associated work order",
            example: "67c6a3d3303b9727a66e107a"
        },
        remark: {
            type: "string",
            description: "The remark or note added to the work order",
            example: "Complete within today"
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the remark",
            example: "66e540c16a02a636f5478139"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the remark",
            example: "66e540c16a02a636f5478139"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the remark was created",
            example: "2025-03-05T06:33:17.233+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the remark was last updated",
            example: "2025-03-05T06:33:17.233+00:00"
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the remark record has been deleted",
            example: false
        }
    },
    required: ["workOrderId", "remark", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = { workOrderRemarksSchema }