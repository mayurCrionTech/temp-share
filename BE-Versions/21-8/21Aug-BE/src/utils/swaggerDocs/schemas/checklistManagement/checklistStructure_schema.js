const checklistStructureSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the checklist structure"
        },
        checklistId: {
            type: "string",
            description: "The unique identifier for the checklist"
        },
        version: {
            type: "number",
            description: "The version number of the checklist structure"
        },
        images: {
            type: "array",
            items: {
                type: "string",
                description: "A list of images related to the checklist"
            }
        },
        note: {
            type: "string",
            description: "additional notes for the checklist structure"
        },
        templateId: {
            type: "string",
            description: "The identifier for the checklist template"
        },
        isActive: {
            type: "boolean",
            description: "Indicates if the checklist structure is active"
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the checklist structure"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the checklist structure"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the checklist structure was created"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the checklist structure was last updated"
        }
    },
    required: ["templateId"]
}

module.exports = { checklistStructureSchema }