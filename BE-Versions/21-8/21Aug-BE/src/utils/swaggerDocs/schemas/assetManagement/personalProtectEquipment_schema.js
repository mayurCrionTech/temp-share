const personalProtectiveEquipmentschema={
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "Reference Id of the File",
            example: "66f1cab9eec09fbcae25c8ad"
        },
        name: {
            type: "string",
            description:"Name of the Personal protective equipment",
            example: "Boot1"
        },
        description: {
            type: "string",
            description: "Detailed description of the personal protective equipment",
            example: "Its a boot"
        },
        image: {
            type: "string",
            description: "reference Id of the image file",
            example: "66f1caafeec09fbcae25c8a8"
        },
        businessUnit: {
            type: "string",
            description: "Reference Id of the associated businessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        isdeleted: {
            type: "boolean",
            description: "Indicates if the PPE is deleted",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "User Id of the Creator",
            example: "66da14e5e3c89277caf8ceb9"
        },
        UpdatedBy: {
            type: "string",
            description: "user Id of the last updater",
            example: "66da14e5e3c89277caf8ceb9"
        },
        createdAt: {
            type: "string",
            format: "Date-time",
            description: "The Creation date of the PPE",
            example: "2024-09-23T20:08:25.703+00:00"
        },
        UpdatedAt: {
            type: "string",
            description: "The last updated date of the PPE",
            example: "2024-09-23T20:08:25.703+00:00"
        }
    },
    required: ["name","businessUnit","createdBy","UpdatedBy"],
}

module.exports = {personalProtectiveEquipmentschema}