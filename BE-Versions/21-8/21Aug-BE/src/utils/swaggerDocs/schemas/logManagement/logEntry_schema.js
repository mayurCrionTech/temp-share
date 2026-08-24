const  logEntryschema = {
    type: "object",
    properties: {
        entryNumber: {
            type: "number",
            description: "Sequential number for the log entry",
            example: "68"
        },
        logId: {
            type: "string",
            description: "Id of the associated log",
            example: "673dd0be321addd57e2d351f"
        },
        logStructureId: {
            type: "string",
            description: "ID of the log structure",
            example: "673dcf6f71ba69de15d58870"
        },
        status: {
            type: "string",
            description: "current status of the log entry",
            enum: ["scheduled","overdue","completed","revised","pendingApproval"],
            example: "scheduled"
        },
        approvers: {
            type: "array",
            items: {
                type: "string",
                description: "List of the approvers for the entry",
                example: ""
            },
        },
        approvedBy: {
            type: "array",
            items: {
                type: "string",
                description: "List of the Users who approved the entry",
                example: ""
            },
        },
        data: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    fieldName: {
                        type: "string",
                        description: "Name of the field",
                        example: "check 1"
                    },
                    fieldValue: {
                        oneOf: [
                            {type: "string"},
                            {type: "number"},
                            {type: "array", 
                                items: { 
                                    type: "string"
                                }
                            }
                        ],
                        description: "Value of the field",
                        example: "20"
                    },
                    type: {
                        type: "string",
                        description: "type of input field",
                        enum: ["multipleChoice","checkboxes","dropdown","text","number","date"],
                        example: "number"
                    },
                    index: {
                        type: "number",
                        description: "Asset associated with the field",
                        example: "1"
                    },
                    breakdown: {
                        type: "boolean",
                        description: "Indicates if the asset has breakdown",
                        example: "false"
                    },
                },
            },
        },
        createdBy: {
            type: "string",
            description: "User ID of the Last Creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: "66e46dbe6a02a636f546ed46"
        },
        entryEnterAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the entry was made",
            example: "2024-11-23T07:20:00.000+00:00"
        },
        entryCreatedAt: {
            type: "string",
            format: "date-time",
            description: "timestamp when the entry was created",
            example: "2024-11-23T07:20:00.000+00:00"
        },
        OperatorIds: {
            type: "array",
            items:{
                type: "string",
                description: "List of operator IDs",
                example: "66bcb5bd54aaca561aa7456c"
            },
        },
        enteredBy: {
            type: "string",
            description: "User ID of the Who entered the log",
            example: "66bcb5bd54aaca561aa7456c"
        },
        comments: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    index: {
                        type: "number",
                        description: "Index of the comment",
                        example: "2"
                    },
                    comment:{
                        type: "string",
                        description: "User comment",
                        example: ""
                    },
                }
            },
        },
        templateId: {
            type: "string",
            description: "ID of the associated template",
            example: "66c5a62d6c6ab0cb150ecc3e"
        },
        endTime: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the log entry ended",
            example: "2024-08-21T15:42:00.000+00:00"
        },
        assetId: {
            type: "string",
            description: "ID of the associated asset",
            example: "66c591836c6ab0cb150eb498"
        },
        images: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    uploadedBy: {
                        type: "string",
                        description: "User ID of the uploader",
                        example: ""
                    },
                    imageId: {
                        type: "string",
                        description: "ID of the uploaded image",
                        example: "66b9fe45278a269d2a8a8f43"
                    },
                    addedAt: {
                        type: "string",
                        format: "date-time",
                        description: "date and time of the uploaded image",
                        example: "2024-08-12T12:21:25.612+00:00"
                    },
                },
            },
        },
        notes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        description: "User ID of the note creator",
                        example: ""
                    },
                    note: {
                        type: "string",
                        description: "Text of the note",
                        example: ""
                    },
                    addedAt: {
                        type: "string",
                        format: "date-time",
                        description: "Timestamp when the note was added",
                        example: ""
                    },
                },
            },
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
            example: "2024-12-03T01:33:22.795+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "timestamp of last update",
            example: "2024-12-04T13:40:56.258+00:00"
        },
    },
    required: ["logId","entryCreatedAt","businessUnit"]
   }


   module.exports = {logEntryschema}