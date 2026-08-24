const businessUnitSchema = {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "The unique identifier for the business unit"
                    },
                    name: {
                        type: "string",
                        description: "The name of the business unit"
                    },
                    shortName: {
                        type: "string",
                        description: "The short name of the business unit"
                    },
                    usersCount: {
                        type: "integer",
                        description: "The number of users in the business unit"
                    },
                    isEnabled: {
                        type: "boolean",
                        description: "Whether the business unit is enabled"
                    },
                    isDeleted: {
                        type: "boolean",
                        description: "Whether the business unit is deleted"
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                        description: "The creation date of the business unit"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                        description: "The last update date of the business unit"
                    },
                    createdBy: {
                        type: "string",
                        description: "The ID of the user who created the business unit"
                    },
                    updatedBy: {
                        type: "string",
                        description: "The ID of the user who last updated the business unit"
                    }
                },
                required: ["name", "shortName", "createdBy", "updatedBy"]
            }



module.exports = {businessUnitSchema}