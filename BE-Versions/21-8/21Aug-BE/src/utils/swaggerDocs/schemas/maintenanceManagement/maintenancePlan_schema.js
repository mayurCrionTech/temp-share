const { recurrenceDetailSchema } = require("../common/recurrence_schema");


const maintenancePlanSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the maintenance plan",
            example: "67bd6fcf15047ee075b2715d"
        },
        name: {
            type: "string",
            description: "The name of the maintenance plan",
            example: "Check maintenance"
        },
        number: {
            type: "string",
            description: "A unique identifier or reference number for the maintenance plan",
            example: "00030"
        },
        description: {
            type: "string",
            description: "A detailed description of the maintenance plan",
            example: "WorkOrder2"
        },
        asset: {
            type: "string",
            description: "The ID of the asset associated with this maintenance plan",
            example: "67b4187d74fd23ab4e0bc670"
        },
        departments: {
            type: "array",
            items: {
                type: "string",
                description: "A list of department IDs involved in the maintenance plan",
                example: ["66a91cee3cf0e58511ccd963"]
            }
        },
        priority: {
            type: "string",
            description: "The priority level of the maintenance plan",
            enum: [
                "High-P1",
                "Medium-P2",
                "Low-P3"
            ],
            example: "High-P1"
        },
        startAt: {
            type: "string",
            format: "date-time",
            description: "The scheduled start date and time of the maintenance plan",
            example: "2025-02-25T07:22:00.000+00:00"
        },
        endAt: {
            type: "string",
            format: "date-time",
            description: "The scheduled end date and time of the maintenance plan",
            example: "2025-02-27T07:22:00.000+00:00"
        },
        estimatedDays: {
            type: "number",
            description: "The estimated number of days required for the maintenance",
            example: 1
        },
        estimatedHours: {
            type: "number",
            description: "The estimated number of hours required for the maintenance",
            example: 1
        },
        assignees: {
            type: "array",
            items: {
                type: "string",
                description: "A list of user IDs assigned to this maintenance plan",
                example: ["66e46f7e6a02a636f546f299"]
            }
        },
        existingTeams: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "The ID of the team",
                        example: "67494ddb834d97c0182e1578"
                    },
                    noOfMembersRequired: {
                        type: "number",
                        description: "The number of team members required",
                        example: 2
                    }
                }
            }
        },
        localTeams: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The name of the local team",
                        example: "Team A"
                    },
                    noOfMembersRequired: {
                        type: "number",
                        description: "The number of members required for this local team",
                        example: 2
                    }
                }
            }
        },
        tasks: {
            type: "array",
            items: {
                type: "string",
                description: "A list of task IDs associated with this maintenance plan",
                example: ["67bf0b5fc956b8f7aad1d9a8", "67bf0b5fc956b8f7aad1d9a9"]
            }
        },
        images: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for images related to the maintenance plan",
                example: ["66b9fe45278a269d2a8a8f43"]
            }
        },
        documents: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for documents related to the maintenance plan",
                example: ["66c483396c6ab0cb150e839d"]
            }
        },
        status: {
            type: "string",
            description: "The current status of the maintenance plan",
            enum: [
                "scheduled", 
                "draft", 
                "expired"
            ],
            example: "draft"
        },
        addToAssetHistory: {
            type: "boolean",
            description: "Indicates if the maintenance plan should be added to the asset history",
            example: false
        },
        addedToAssetHistory: {
            type: "boolean",
            description: "Indicates if the maintenance plan has already been added to the asset history",
            example: false
        },
        isRecurrence: {
            type: "boolean",
            description: "Indicates if the maintenance plan is recurring",
            example: false
        },
        recurrenceDetails: recurrenceDetailSchema,
        scheduledTime: {
            type: "string",
            format: "date-time",
            description: "The exact time when the maintenance is scheduled",
            example: "2025-04-07T07:20:00.534+00:00"
        },
        isWorkOrderCreated: {
            type: "boolean",
            description: "Indicates if a work order has been created for this maintenance plan",
            example: true
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the maintenance plan has been deleted",
            example: false
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the maintenance plan",
            example: "66e46f496a02a636f546f1fc"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the maintenance plan",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the maintenance plan was created",
            example: "2025-02-21T12:04:38.337+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the maintenance plan was last updated",
            example: "2025-02-26T12:44:21.881+00:00"
        }
    },
    required: ["number", "status", "isDeleted", "createdAt", "updatedAt"]
}



module.exports = {
    maintenancePlanSchema
  };