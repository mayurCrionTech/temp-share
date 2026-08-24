const  assetParametersSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "Unique Identifier of the asset parameters",
            example: "679e405fd4bba23b353aa43d"
        },
        name: {
            type: "string",
            description: "Name of the asset parameter",
            example: "test"
        },
        value: {
            type: "string",
            description: "Value of the parameter",
            example: "111"
        },
        unit: {
            type: "string",
            description: "Unit of measurement  for the parameter",
            example: "11"
        },
        asset: {
            type: "string",
            description: "Reference Id of the associated asset",
            example: "6751a65a3685a8d8f59984ff"
        },
        trackingStatus: {
            type: "string",
            description: "Tracking status of the asset parameter",
            enum: ["Active","Disabled","Requested","Unlinked"],
            example: "Unlinked"
        },
        iscomparable: {
            type: "boolean",
            description: "Indicates if the parameter is comparable with other",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "User Id of the Creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "User Id of the last updater",
            example: "66e46dbe6a02a636f546ed46"
        },
        isdeleted: {
            type: "boolean",
            description: "Indicates if the asset parameter is deleted",
            example: "false"
        },
        createdAt: {
            type: "string",
            format: "Date-time",
            description : "The Creation date of the asset parameter",
            example: "2025-02-01T15:40:15.101+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The last updated date of the asset parameter",
            example: "2025-02-01T15:40:15.101+00:00"
        },
    },
    required: ["name","value","unit","asset"],
   } 


   module.exports = {assetParametersSchema}