const  assetDocumentSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "Id of the Asset document",
            example: "67c02a0d833bd508bc73cca7"
        },
        name: {
            type: "string",
            description: "Name of the asset document",
            example: "Dggg3a2ssf"
        },
        number: {
            type: "string",
            description: "Unique document number of identification",
            example: "66sggga7ssf"
        },
        status: {
            type: "string",
            enum: [
                "Approved with comment",
                "Approved",
                "rejected",
                "As built",
                "revise & resubmit "
            ],
            description: "Status of the asset document",
            example: "Rejected"
        },
        type: {
            type: "string",
            enum: [
                "engineering",
                "operations",
                "Maintenance",
                "safety",
                "automation",
                "administration",
                "audit",
                "communication"
            ],
            description: " type of the asset document",
            example: "Engineering"
        },
        revisionNumber: {
            type: "string",
            description: "revision number of the document",
            example: "234567"
        },
        file: {
            type: "string",
            description: "reference to the uploaded file",
            example: "67c02999833bd508bc73cca0"
        },
        asset: {
            type: "string",
            description: "reference to the associated asset",
            example: "66bb27f38824240dd7ec3705"
        },
        businessUnit: {
            type: "string",
            description: "Id of the associated businessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        isdeleted: {
            type: "boolean",
            description: "Flag to indicate if the asset document is deleted",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "User Id of the creator",
            example: "66e46dbe6a02a636f546ed46"
        },
        updatedBy: {
            type: "string",
            description: "User Id of the last update",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The creation date of the document",
            example: "2025-02-27T09:02:05.753+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The last updated date of the asset document",
            example: "2025-02-27T09:02:05.753+00:00"
        }
    },
    required:["businessUnit","createdBy","updatedBy"]
   }


module.exports = {assetDocumentSchema}