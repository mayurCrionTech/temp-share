const workOrderSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the work order",
            example: "67f3957f8ee0c74f470a0748"
        },
        name: {
            type: "string",
            description: "Name of the work order",
            example: "SHM-1006check maintenance"
        },
        number: {
            type: "string",
            description: "Unique work order number",
            example: "WO-01023"
        },
        description: {
            type: "string",
            description: "A detailed description of the work order",
            example: "Work Order 2"
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
                description: "List of department IDs associated with the work order",
                example: ["66a91cee3cf0e58511ccd963"]
            }
        },
        priority: {
            type: "string",
            description: "Priority level of the work order",
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
            description: "Start date and time of the work order",
            example: "2025-04-07T08:17:00.000+00:00"
        },
        endAt: {
            type: "string",
            format: "date-time",
            description: "End date and time of the work order",
            example: "2025-04-07T09:17:00.000+00:00"
        },
        estimatedDays: {
            type: "number",
            description: "The estimated number of days required for the maintenance",
            example: 2
        },
        estimatedHours: {
            type: "number",
            description: "The estimated number of hours required for the maintenance",
            example: 0
        },
        assignees: {
            type: "array",
            items: {
                type: "string",
                description: "A list of user IDs assigned to this work order",
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
                        description: "Team ID",
                        example: "674567061c3297b9c3bc2aaf"
                    },
                    noOfMembersRequired: {
                        type: "number",
                        description: "Required members",
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
                        description: "Local team name",
                        example: "Team A"
                    },
                    noOfMembersRequired: {
                        type: "number",
                        description: "Required members",
                        example: 2
                    }
                }
            }
        },
        tasks: {
            type: "array",
            items: {
                type: "string",
                description: "A list of task IDs associated with this work order tasks",
                example: ["67f3957f8ee0c74f470a076c", "67f3957f8ee0c74f470a076d"]
            }
        },
        addToAssetHistory: {
            type: "boolean",
            description: "Indicates if the work order should be added to the asset history",
            example: false
        },
        isWorkPermitRequired: {
            type: "boolean",
            description: "Indicates if a work permit is required",
            example: false
        },
        isMaintenanceScheduled: {
            type: "boolean",
            description: "Indicates if maintenance is scheduled",
            example: true
        },
        images: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for images related to the work order",
                example: ["66b9fe45278a269d2a8a8f43"]
            }
        },
        documents: {
            type: "array",
            items: {
                type: "string",
                description: "A list of file IDs for documents related to the work order",
                example: ["66c483396c6ab0cb150e839d"]
            }
        },
        lastStatus: {
            type: "string",
            description: "The last recorded status of the work order",
            example: "scheduled"
        },
        status: {
            type: "string",
            description: "Current status of the work order",
            enum: [
                "draft", 
                "scheduled", 
                "accepted", 
                "onHold", 
                "completed", 
                "expired"
            ],
            example: "expired"
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the work order is deleted",
            example: false
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who created the work order",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the work order",
            example: "66e46f7e6a02a636f546f299"
        },
        requestExtensionCount: {
            type: "number",
            description: "Number of extension requests made",
            example: 0
        },
        workOrderCreatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp displayed to the users",
            example: "2025-04-07T08:17:00.000+00:00"
        },
        maintenanceID: {
            type: "string",
            description: "Reference to the maintenance plan ID",
            example: "67bc554c15047ee075b23ea8"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Exact system-generated timestamp when the work order is stored in the database",
            example: "2025-04-07T08:00:36.166+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of the last update",
            example: "2025-04-07T08:00:36.166+00:00"
        }
    },
    required: ["number", "status", "isDeleted", "createdAt", "updatedAt"]
}

module.exports= {workOrderSchema}