const  teamschema= {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier of the team ",
            example: "674567061c3297b9c3bc2aaf"
        },
        name: {
            type: "string",
            description: "Name of the Team",
            example: "Team A"
        },
        businessUnit: {
            type: "string",
            description: "Reference to the Business Unit the team belongs to.",
            example: "6641959acbe6ea3941e60789"
        },
        users: {
            type: ["string"],
            description: " List of user IDs belonging to the team",
            example: "66e469636a02a636f546e242"
        },
        department: {
            type: "string",
            description: "Reference to the department the team belongs to",
            example: "66a91cee3cf0e58511ccd963"
        },
        isEnabled: {
            type: "boolean",
            description: "Indicates if the team is active",
            example: true
        },
        isdeleted: {
            type: "boolean",
            description: " Indicates if the team is deleted ",
            example: false
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the team was created",
            example: "2024-11-26T06:24:15.971+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the team was last updated.",
            example: "2024-11-26T06:24:15.971+00:00"
        },
        createdBy: {
            type: "string",
            description: "User ID of the creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "user ID of the last updator",
            example: "66e46dbe6a02a636f546ed46"
        },
    },
    required: ["name", "businessUnit", "createdBy", "updatedBy"] 
   }


   module.exports = {teamschema}