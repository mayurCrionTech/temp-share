const templateSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the template"
        },
        dataSets: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    fieldName: {
                        type: "string",
                        description: "The name of the field"
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
                        description: "The value associated with the field, varies based on type"
                    },
                    type: {
                        type: "string",
                        description: "The type field",
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
                        description: "The position of the field within the dataset"
                    },
                    asset: {
                        type: "string",
                        description: "Optional asset reference"
                    },
                    upperBound: {
                        type: "number",
                        description: "Maximum acceptable value"
                    },
                    lowerBound: {
                        type: "number",
                        description: "Minimum acceptable value"
                    },
                    criticalPoint1: {
                        type: "number",
                        description: "First critical threshold"
                    },
                    criticalPoint2: {
                        type: "number",
                        description: "Second critical threshold"
                    }
                },
                required: ["fieldName", "fieldValue", "type", "index"]
            }
        },
        isGeneralTemplate: {
            type: "boolean",
            description: "Indicates if this template is general or specific"
        },
        templateName: {
            type: "string",
            description: "The name of the template"
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the template"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the template"
        }
    }
}

module.exports = { templateSchema }