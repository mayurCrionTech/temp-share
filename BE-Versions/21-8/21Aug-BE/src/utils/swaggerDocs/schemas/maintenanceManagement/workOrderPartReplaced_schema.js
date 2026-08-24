const workOrderPartReplacedSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order part replacement record",
            example: "6763b508ce96f696fd653c34"
        },
        workOrder: {
            type: "string",
            description: "ID  of the associated work order",
            example: "6762b17b559892e7bcb9100c"
        },
        spare: {
            type: "string",
            description: "ID of the spare part that was replaced",
            example: "66f5510373c996478e906a7a"
        },
        quantity: {
            type: "number",
            description: "The quantity of spare parts replaced",
            example: 2
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who recorded the part replacement",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the part replacement record",
            example: "66e46dbe6a02a636f546ed46"
        },
        isDeleted: {
            type: "string",
            description: "Indicates if the part replacement record has been deleted",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the part replacement record was created",
            example: "2024-12-19T05:54:16.102+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the part replacement record was last updated",
            example: "2024-12-19T05:54:16.102+00:00"
        }
    },
    required: ["workOrder", "spare", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted"]
}

module.exports = { workOrderPartReplacedSchema }