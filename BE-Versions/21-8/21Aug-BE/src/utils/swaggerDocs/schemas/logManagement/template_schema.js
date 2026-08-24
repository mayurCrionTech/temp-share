const  logTemplateschema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The Unique identifier of the template",
            example: "67ed31e179072bf437434a6d"
        },
        dataSets: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    fieldName:{
                        type: "string",
                        description: "Temprature",
                        example: "MCP 45_REFINERY - 7F - SOUTH STAIR"
                    },
                    fieldValue: {
                        type: "string",
                        description: "Value of the field",
                        example: "2"
                    },
                    formula : {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                description: "Type of formula",
                                example: "text"
                            },
                            operation: {
                                type: "string",
                                description: "Mathematical operation for formula",
                                enum: ["add","subtarct","multiply","divide"],
                            },
                            value: {
                                type: "string",
                                description: "Value for the formula",
                            },
                            left: {
                                type: "string",
                                description: "Left operand for the formula",
                            },
                            right: {
                                type: "string",
                                description: "Right operand for the formula",
                            },
                        },
                    },
                    type: {
                        type: "string",
                        description: "Type of the field",
                        enum: ["multiplechoise","checkboxes","dropdown","text","null"],
                        example: "text"
                    },
                    index: {
                        type: "string",
                        description: "Index of the field ",
                        example: "34"
                    },
                    asset: {
                        type: "string",
                        description: "Associated asset ID",
                        example: "66e3eb7ef095a092ee0f7bbb"
                    },
                    upperBound: {
                        type: "number",
                        description: "upper bound value",
                    },
                    lowerBound: {
                        type: "number",
                        description: "Lower bound value",
                    },
                    criticalPoint1: {
                        type: "number",
                        description: "First critical point",
                    },
                    criticalPoint2: {
                        type: "number",
                        description: "second critical point",
                    },
                },
            },
            required: ["type","index"],
        },
        isGeneralTemplate: {
            type: "boolen",
            description: "indicates if this is a general template",
            example: true
        },
        templateName: {
            type: "string",
            description: "Name of the template",
            example: ""
        },
        createdBY: {
            type: "string",
            description: "User ID of the creator",
            example: ""
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: ""
        },
        businessUnit: {
            type: "string",
            description: "ID of the associated business unit",
            example: ""
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of creation",
            example: ""
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of last update",
            example: ""
        },
    },
    required: ["businessUnit"]
   }


   module.exports = {logTemplateschema}