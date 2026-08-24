const  assetCategorySchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "ID of the Asset category",
            example: "66f1cad3eec09fbcae25c8b4"
        },
        name: {
            type: "string",
            description: "Name of the Asset category",
            example: "Derinkbb"
        },
        defaultDocumentNames: {
            type: "array",
            items: {
                type: "string",
                description: "List of the default document names associated with asset category",
                example: "warrantyDocument"
            }
        },
        personalProtectiveEquipments: {
            type: "array",
            items: {
                type: "string",
                description: "List of PPE (Personal Protective Equipment) IDs related to the asset category",
                example: "66f1cab9eec09fbcae25c8ad"
            }
        },
        businessUnit: {
            type: "string",
            description: "ID of the associated business unit",
            example: "6641959acbe6ea3941e60789"
        },
        isDeleted: {
            type: "boolean",
            description: "Flag to indicate if the asset category is deleted",
            example: "false"
        },
        createdBy: {
            type: "string",
            description: "User ID of the creator",
            example: "66da14e5e3c89277caf8ceb9"
        },
        updatedBy: {
            type: "string",
            description: "User ID of the last updater",
            example: "66da14e5e3c89277caf8ceb9"
        },
        createdAt: {
            type: "string",
            description: "The creation date of the asset category",
            example: "2024-09-23T20:08:51.134+00:00"
        },
        updatedAt: {
            type: "string",
            description: "The last updated date of the asset category",
            example: "2024-09-23T20:08:51.135+00:00"
        },
    },
    required: ["name","businessUnit","createdBy","updatedBy"]
   }

   module.exports = {assetCategorySchema}