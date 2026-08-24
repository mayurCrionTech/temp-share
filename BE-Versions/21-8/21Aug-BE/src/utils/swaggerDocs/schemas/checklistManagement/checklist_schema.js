const { timePeriod, recurrOn } = require("../../../../models/mongoDB/maintenanceManagement/maintenancePlan_model");
const { recurrenceDetailSchema } = require("../common/recurrence_schema");

const checklistSchema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the checklist"
        },
        name: {
            type: "string",
            description: "The name of the checklist"
        },
        checklistNumber: {
            type: "number",
            description: "A unique reference number assigned to the checklist"
        },
        description: {
            type: "string",
            description: "A detailed description of the checklist"
        },
        documentNumber: {
            type: "string",
            description: "A reference document number for the checklist"
        },
        assetId: {
            type: "string",
            description: "The unique identifier of the asset associated with this checklist"
        },
        departments: {
            type: "array",
            items: {
                type: "string",
                description: "A list of department IDs involved in the checklist",
            },
            // example: ["dept1", "dept2", "dept3"]
        },
        teams: {
            type: "array",
            items: {
                type: "string",
                description: "A list of team IDs assigned to this checklist"
            }
        },
        assignees: {
            type: "array",
            items: {
                type: "string",
                description: "A list of user IDs assigned to this checklist"
            }
        },
        status: {
            type: "string",
            description: "The current status of the checklist",
            enum: [
                "draft", 
                "scheduled", 
                "overdue", 
                "completed", 
                "workInProgress", "pendingForApproval"]
        },
        startDateAndTime: {
            type: "string",
            format: "date-time",
            description: "The scheduled start date and time of the checklist"
        },
        endDateAndTime: {
            type: "string",
            format: "date-time",
            description: "The scheduled end date and time of the checklist"
        },
        isRecurrence: {
            type: "boolean",
            description: "Indicates if the checklist is recurring"
        },
        recurrenceDetails: recurrenceDetailSchema,
        createdBy: {
            type: "string",
            description: "The ID of the user who created the checklist"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last updated the checklist"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the checklist was initially created"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the checklist was last updated"
        },
        isScheduleReport: {
            type: "boolean",
            description: "Indicates if this checklist is part of the schedule"
        },
        isStaticGeneration: {
            type: "boolean",
            description: "Indicates if the checklist is generated statically instead of dynamically"
        },
        isEntryStarted: {
            type: "boolean",
            description: "Indicates whether an entry has been started for this checklist"
        },
        isActive: {
            type: "boolean",
            description: "Specifies whether the checklist is currently active"
        },
        userSpecificDetails: {
            type: "array",
            //description: "List of user-specific details",
            items: {
                type: "object",
                properties: {
                    operatorId: {
                        type: "string",
                        description: "ID of the operator"
                    },
                    userRecurrenceDetails: {
                        type: "array",
                        //description: "Recurrence details for the user",
                        items: {
                            type: "object",
                            properties: {
                                occurDays: {
                                    type: ["string"],
                                    items: {
                                        type: "string",
                                        description: "Days on which the user-specific recurrence applies",
                                    }
                                },
                                specificYear: {
                                    type: "string",
                                    description: "A specific year for the recurrence"
                                },
                                shiftTiming: {
                                    type: [""],
                                    description: "Shift timing details for the operator"
                                }
                            }
                        }
                    }
                }
            }
        },
        scheduledReportDetails: {
            type: "object",
            properties: {
                scheduleTime: {
                    type: "string",
                    description: "The time at which the report is scheduled"
                },
                approver: {
                    type: "string",
                    description: "The user ID of the report approver"
                },
                frequency: {
                    type: "string",
                    description: "The frequency of the scheduled report"
                },
                timePeriod: {
                    type: "string",
                    description: "The time period for the scheduled report",
                    enum: [
                        "day", 
                        "week", 
                        "month"
                    ]
                },
                recurrOn: {
                    type: "string",
                    description: "Specifies when the scheduled report should recur",
                    enum: [
                        "allDays", 
                        "onlyOnWeekDays"
                    ]
                },
                specificDate: {
                    type: "string",
                    description: "A specific date for the report"
                }
            }
        }
    },
    required: ["createdAt", "updatedAt"]
}

module.exports = {checklistSchema}