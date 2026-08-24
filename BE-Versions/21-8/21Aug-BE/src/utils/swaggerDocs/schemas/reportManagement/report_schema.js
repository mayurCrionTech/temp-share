const reportschema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: " The Unique identifier of the Report"
        },
        businessUnit: {
            type: "string",
            description: "Reference to the Business Unit associated with the report."
        },
        moduleName: {
            type: "string",
            description: "Name of the Module to report",
            enum: ["checklist","logs"]
        },
        moduleEntityId: {
            type: "string",
            description: "Id of the associated entity within the module"
        },
        startDateAndTime: {
            type: "string",
            format: "date-time",
            description: "Start date and time of the report"
        },
        endDateAndTime: {
            type: "string",
            format: "date-time",
            description: "End date and time of the report"
        },
        format: {
            type: "string",
            description: "Format of the report file",
            enum: ["pdf"]
        },
        documentId: {
            type: "string",
            description: "ID of the associated document"
        },
        history: {
            type: ["string"],
            description: "List of file history reference"
        },
        reportCreatedAt: {
            type: "string",
            description: "Timestamp of when the report was created"
        },
        status: {
            type: "string",
            description: "Status of the report",
            enum: ["completed", "revised", "pendingForApproval"]
        },
        approver: {
            type: "string",
            description: "User ID of the approver"
        },
        reportNumber: {
            type: "number",
            description: "Unique report number "
        },
        comments: {
            type: "array",
            items:  {
                type: "object",
                properties: {
                    index: {
                        type: "number",
                        description: "Type of the comments"
                    },
                    comment: {
                        type: "string",
                        description: "Text Comment"
                    },
                    userID: {
                        type: "string",
                        description: "The User ID of the user who is commenting" 
                    },
                    addedAt: {
                        type: "string",
                        format: "date-time",
                        description: "The Date of the comment added"
                    },
                },
            },
        },

    },
    required: ["businessUnit", "startDateAndTime", "endDateAndTime", "reportCreatedAt"],
   }


   module.exports = {reportschema}