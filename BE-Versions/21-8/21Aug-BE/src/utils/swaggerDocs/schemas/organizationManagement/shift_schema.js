const shiftschema= {
    type: "object",
    properties :{
        id: {
            type: "string",
            description: "The user ID in the Shift",
            exxample: "66f3545017e5167fadcb2ab7"
        },
        name:{
            type: "string",
            description: "Shift Name",
            example: "Morning Shift 4"
        },
        shiftHours: {
            type: "object",
            properties: {
                start: {
                    type: "string",
                    description: "The start time of the shift in HH:MM or HH:MM:SS format (24-hour)",
                    example: "08:00:00"
                    },
                end: {
                    type: "string",
                    description: "The end time of the shift in HH:MM or HH:MM:SS format (24-hour)",
                    example: "12:00:00"
                }
            },
            required: ["start", "end"]
        },
        businessUnit: {
            type: "string",
            description: "User Id of the BusinessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        isDeleted:{
            type: "boolean",
            description: "Whether the shift is deleted",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "The user Id of the Creator",
            example: "66da14e5e3c89277caf8ceb9"
        },
        updatedBy: {
            type: "string",
            description: "The user Id of last updater",
            example: "66da14e5e3c89277caf8ceb9"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation date",
            example: "2024-09-25T00:07:44.175+00:00"
        },
        updatedby: {
            type: "string",
            format: "date-time",
            description: "The Last updated Date",
            example: "2024-09-25T00:29:46.977+00:00"
        }
    },
required: ["name","shiftHours","businessUnit","createdBy","updatedBy"]
}


module.exports = {shiftschema}