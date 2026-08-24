const checklistEntrySchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier of the checklist entry"
        },
        entryNumber: {
            type: "number",
            description: "The sequence number of the checklist entry"
        },
        checklistId: {
            type: "string",
            description: "The unique identifier of the checklist this entry belongs to"
        },
        checklistStructureId: {
            type: "string",
            description: "The identifier for the checklist structure"
        },
        status: {
            type: "string",
            description: "The current status of the checklist entry",
            enum: [
                "scheduled", 
                "overdue", 
                "completed", 
                "revised", 
                "pendingForApproval"
            ]
        },
        data: {
            type: "array",
            items: {  
                type: "object",
                properties: {
                    fieldName: {
                        type: "string",
                        description: "The name of the field in the checklist entry"
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
                        description: "The value entered for the field",
                        //type: ["string", "number", "array"],
                    },
                    type: {
                        type: "string",
                        description: "The type of the field",
                        enum: [
                            "multipleChoice", 
                            "checkboxes", 
                            "dropdown", 
                            "text", 
                            "number", 
                            "date"
                        ]
                    },
                    index: {
                        type: "number",
                        description: "The index position of the field in the checklist"
                    },
                    asset: {
                        type: "string",
                        description: "The associated asset ID for checklist entry"
                    }
                },
                required: ["fieldName", "fieldValue", "type", "index"]
            }
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the checklist entry"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the checklist entry"
        },
        entryCreatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp displayed to the users"
        },
        operatorId: {
            type: "string",
            description: "The ID of the operator associated with the checklist entry"
        },
        comments: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    index: {
                        type: "number",
                        description: "The index of the comment in the checklist entry"
                    },
                    comment: {
                        type: "string",
                        description: "The comment text"
                    },
                }
            }
        },
        templateId: {
            type: "string",
            description: "The identifier of the checklist template"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Exact system-generated timestamp when the entry was created"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the entry was last updated"
        }
    },
    required: ["checklistId", "fieldName", "fieldValue", "type", "index", "entryCreatedAt"]
}

module.exports = {checklistEntrySchema}