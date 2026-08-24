const { recurrenceDetailSchema } = require("../common/recurrence_schema");

const maintenancePlanVersionSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the maintenance plan version",
            example: "67bf0ca5c956b8f7aad1da2d"
        },
        name: {
            type: "string",
            description: "The name of the maintenance plan version",
            example: "check maintenance"
        },
        number: {
            type: "string",
            description: "A ID or reference number for the maintenance plan version",
            example: "00029"
        },
        maintenanceID: {
            type: "string",
            description: "The ID of the associated maintenance plan",
            example: "67bc554c15047ee075b23ea8"
        },
        version: {
            type: "string",
            description: "The version number of the maintenance plan",
            example: "00004"
        },
        description: {
            type: "string",
            description: "A detailed description of the maintenance plan version",
            example: "WorkOrder2"
        },
        asset: {
            type: "string",
            description: "ID of the asset associated with this maintenance plan version",
            example: "67b4187d74fd23ab4e0bc670"
        },
        departments: {
            type: "array",
            items: {
                type: "string",
                description: "A list of department IDs involved in this version",
                example: ["66a91cee3cf0e58511ccd963"]
            }
        },
        priority: {
            type: "string",
            description: "The priority level of the maintenance plan",
            example: "High-P1"
        },
        startAt: {
            type: "string",
            format: "date-time",
            description: "The scheduled start date and time of this version",
            example: "2025-02-24T11:17:00.000+00:00"
        },
        endAt: {
            type: "string",
            format: "date-time",
            description: "The scheduled end date and time of this version",
            example: "2027-12-25T06:52:51.737+00:00"
        },
        estimatedDays: {
            type: "number",
            description: "The estimated number of days required",
            example: 2
        },
        estimatedHours: {
            type: "number",
            description: "The estimated number of hours required",
            example: 0
        },
        assignees: {
            type: "array",
            items: {
                type: "string",
                description: "A list of user IDs assigned to this version",
                example: ["6641959acbe6ea3941e60789"]
            }
        },
        existingTeams: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "ID of the team",
                        example: "674567061c3297b9c3bc2aaf"
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
                        description: "The number of members required",
                        example: 2
                    }
                }
            }
        },
        tasks: {
            type: "array",
            items: {
                type: "string",
                description: "A list of task IDs associated with this version",
                example: ["67bf0ca5c956b8f7aad1da30", "67bf0ca5c956b8f7aad1da31"]
            }
        },
        images: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for images",
                example: ["66b9fe45278a269d2a8a8f43"]
            }
        },
        documents: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for documents",
                example: ["66c483396c6ab0cb150e839d"]
            }
        },
        status: {
            type: "string",
            description: "The status of the maintenance plan version",
            example: "scheduled"
        },
        isRecurrence: {
            type: "boolean",
            description: "Indicates if the maintenance plan version is recurring",
            example: true
        },
        recurrenceDetails: recurrenceDetailSchema,
        isDeleted: {
            type: "boolean",
            description: "Indicates if the maintenance plan version has been deleted",
            example: false
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created this version",
            example: "66e46f496a02a636f546f1fc"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated this version",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when this version was created",
            example: "2025-02-26T12:38:04.146+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when this version was last updated",
            example: "2025-02-26T12:44:21.881+00:00"
        }
    },
    required: ["number", "version", "status", "isDeleted", "createdAt", "updatedAt"]
}

module.exports = { maintenancePlanVersionSchema }