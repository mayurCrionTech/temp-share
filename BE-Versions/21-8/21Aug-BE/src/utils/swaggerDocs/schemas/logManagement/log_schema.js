const  logschema={
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "Id of the Associated log",
            example: "67ee39d114698cd84e938553"
        },
        name: {
            type: "string",
            description: "Name of the log entry(max length 50)",
            example: "Sample Log formula2"
        },
        lognumber: {
            type: "number",
            description: "Unique log number identifier",
            example: "187"
        },
        description: {
            type: "string",
            description: "detailed description of the log (max length 1000)",
            example: "Sample Log formula2"
        },
        documentNumber: {
            type: "string",
            description: "Associated document Number(max length 20)",
            example: "Sample Log formula2"
        },
        assetId: {
            type: "string",
            description: "Reference Id of the related asset",
            example: "67c051eec92a1df617a9d980"
        },
        departments: {
            type: "array",
            items: {
                type: "string",
                description: "List of departments Ids associated with the log",
                example: "66a91cee3cf0e58511ccd963"
            },
        },
        teams: {
            type: "array",
            items: {
                type: "string",
                description: "List of team IDs involved",
                example: "674567061c3297b9c3bc2aaf"
            },
        },
        assignees: {
            type: "array",
            items: {
                type: "string",
                description: "List of the user IDs assigned to the log",
                example: "66e46df56a02a636f546ede1"
            },
        },
        emailNotificationRecipients: {
            type: "array",
            items: {
                type: "string",
                description: "Users who will receive email notification",
                example: "66e46dbe6a02a636f546ed46"
            },
        },
        approvers: {
            type: "array",
            items: {
                type: "string",
                description: "Users responsible for approving the log",
                example: "66e46dbe6a02a636f546ed46"
            },
        },
        approvedBy: {
            type: "array",
            items: {
                type: "string",
                description: "Users who have approved the log",
                example: ""
            },
        },
        status: {
            type: "string",
            description: "Current status of the log",
            enum: ["draft","scheduled","overdue","completed","workInprogress","pendingForApproval"],
            example: "workInProgress"
        },
        startDateAndTime: {
            type: "string",
            format: "date-time",
            description: "start date and time of the log",
            example: "2025-04-03T07:33:00.000+00:00"
        },
        endDateAndTime: {
            type: "string",
            format: "date-time",
            description: "End date and time of the log",
            example: "2025-04-04T07:33:00.000+00:00"
        },
        isRecurrence: {
            type: "boolean",
            description: "Indicates if the log is recurring",
            example: "false"
        },
        isStaticGeneration: {
            type: "boolean",
            description: "Indicates id the static generation is enable ",
            example: "false"
        },
        isScheduleReport: {
            type: "boolean",
            description: "Indicates if this log is part of the Schedule ",
            example: "true"
        },
        createdBy: {
            type: "string",
            description: "User of the creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        isActive: {
            type: "boolean",
            description: "Indicates if the log is currently active",
            example: "Active"
        },
        recurrenceDetails: {
            type: "object",
            properties:  {
                frequency: {
                    type: "number",
                    description: "recurrence frequency ",
                    example: "1"
                },
                timePeriod: {
                    type: "string",
                    description: "Time Period for recurrence ",
                    enum: ["Hour","day","week","month"],
                    example: "day"
                },
                recurrOn: {
                    type: "string",
                    description: "recurrence pattern",
                    enum: ["alldays","onlyonweekDays","custom"],
                    example: "alldays"
                },
                occurDays: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: ["sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                        description: "Specify day for recurrence",
                        example: "Tuesday"
                    },
                },
            },
        },
        isUserCustomization:{
            type: "boolean",
            description: "Indicates if user customization is enabled",
            example: "false"
        },
        isEntryStarted: {
            type: "boolean",
            description: "Indicates if the log entry has started",
            example: "true"
        },
        ScheduledreportDetails: {
            type: "object",
            properties: {
                scheduledTime: {
                    type: "string",
                    description: "Scheduled time for the report",
                    example: "11:17"
                },
                approver: {
                    type: "string",
                    description: "Approver of the scheduled report",
                    example: "66e46dbe6a02a636f546ed46"
                },
                frequency: {
                    type: "string",
                    description: "Frequency of the scheduled report",
                    example: "1"
                },
                timePeriod: {
                    type: "string",
                    description: "Time Period of the scheduled report",
                    enum: ["day","week","month"],
                    example: "day"
                },
                recurrOn: {
                    type: "string",
                    description: "recurrence pattern for report",
                    enum: ["allDays","onlyweekdays","customWeekDays"],
                    example: "allDays"
                },
                specificDays: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],
                        description: "Specific days for the scheduled report",
                        example: "sunday"
                    },
                }
            },
        },
        businessUnit: {
            type: "string",
            description: "Id of the associated business unit",
            example: "6641959acbe6ea3941e60789"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of the lamp update",
            example: "2024-11-22T04:49:07.749+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of the last update ",
            example: "2024-11-22T04:49:53.774+00:00"
        },
    },
    required: ["businessUnit"]
   }


   module.exports = {logschema}