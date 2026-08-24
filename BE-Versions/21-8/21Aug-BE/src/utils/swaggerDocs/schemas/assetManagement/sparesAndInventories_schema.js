const  sparesAndInventoriesSchema= {
    type: "object",
    prperties: {
        id: {
            type: "string",
            description: "Id of the spares and inventories",
            example: "67dbc69c1c667afd63379b2d"
        },
        name: {
            type: "string",
            description: "Name of the spare or inventory item",
            example: "test"
        },
        description: {
            type: "string",
            description: "Additional details about the spare item",
            example: ""
        },
        quantity: {
            type: "object",
            properties: {
                value: {
                    type: "number",
                    description: "Quantity of the spare item (max 8 digits)",
                    example: 8
                },
                type: {
                    type: "string",
                    description: "Unit type of the quantity",
                    enum: ["pieces","liters","meters","kilograms"],
                    example: "pieces"
                },
            },
        },
        totalQuantity: {
            type: "number",
            description: "Total quantity availible",
            example: 35
        },
        cost: {
            type: "number",
            description: "Cost of the spare item",
            example: "null"
        },
        minimumSpareQuantity: {
            type: "integer",
            description: "Unique part number of the spare item",
            example: "25"
        },
        partNumber: {
            type: "string",
            description: "unique part of the spare item",
            example: ""
        },
        cycleFrequency: {
            type: "object",
            properties: {
                value: {
                    type: "number",
                    description: "Cycle frequency count (max 8 digits)",
                    example: "2"
                },
                type: {
                    type: "string",
                    description: "Cycle frequency type",
                    enum: ["daily","weekly","monthly","yearly"],
                    example: "Cycle"
                },
            },
        },
        replacementFrequency: {
            type: "object",
            properties: {
                value: {
                    type:"number",
                    description: "replacement frequency count(max 2 digits)",
                    example: ""
                },
                type: {
                    type: "string",
                    description: "Replacement frequency type",
                    enum: ["days","weeks","monthly","yearly"],
                    example: "monthly"
                },
            },
        },
        asset: {
            type: "string",
            description: "Reference Id of the associated asset",
            example: "67b4187d74fd23ab4e0bc670"
        },
        updatedBy: {
            type: "string",
            description: "User Id of the last updater",
            example: "66e46dbe6a02a636f546ed46"
        },
        createdBy: {
            type: "string",
            description: "user Id of the creator",
            example: "66e46f496a02a636f546f1fc"
        },
        isActive: {
            type: "boolean",
            description: "Indicates if the spare is currently active",
            example: "true"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp of creation",
            example: "2025-03-20T07:36:38.096+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "timestamp of last update",
            example: "2025-03-24T07:08:07.304+00:00"
        },
    },
    required: ["name","quantity","updatedBy","createdBy"],
   }


   module.exports = {sparesAndInventoriesSchema}