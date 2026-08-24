const specificDaySchema= {
    type: "object",
    properties: {
        type: {
            type: "string",
            description: "The type of specific recurrence (e.g., first Monday of the month)",
            example: ""
        },
        day: {
            type: "string",
            description: "The specific day for recurrence",
            example: ""
        },
        weekDay: {
            type: "string",
            description: "The weekday on which the checklist recurs",
            example: ""
        },
        occurrence: {
            type: "string",
            description: "The specific occurrence (e.g., first, second, last)",
            example: ""
        },
        date: {
            type: "string",
            description: "A fixed date for the checklist recurrence",
            example: ""
        }
    }
}

const recurrenceDetailSchema= {
    type: "object",
    properties: {
        frequency: {
            type: "number",
            description: "The frequency of recurrence",
            example: 1
        },
        timePeriod: {
            type: "string",
            description: "The time unit for recurrence",
            enum: [
                "hour", 
                "day", 
                "week", 
                "month", 
                "year"
            ],
            example: "hour"
        },
        recurrOn: {
            type: "string",
            description: "Specifies when the recurrence should happen",
            enum: [
                "allDays", 
                "onlyOnWeekDays", 
                "custom"
            ],
            example: "allDays"
        },
        occurDays: {
            type: ["string"],
            description: "A list of specific days for the recurrence",
            enum: [
                "sunday", 
                "monday", 
                "tuesday", 
                "wednesday", 
                "thursday", 
                "friday", 
                "saturday"
            ],
            example: "monday"
        },
        specificDay: specificDaySchema
    },
    required: ["frequency", "timePeriod"]
}



module.exports = {
    specificDaySchema,
    recurrenceDetailSchema
  };

