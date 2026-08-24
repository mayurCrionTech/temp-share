const fileSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "The unique identifier for the file",
            example: "66b9fe45278a269d2a8a8f43"
        },
        name: {
            type: "string",
            description: "The name of the file",
            example: "Oil Refinery Render"
        },
        extension: {
            type: "string",
            description: "The file extension",
            example: "png"
        },
        contentType: {
            type: "string",
            description: "The MIME type of the file (e.g., image/png, application/pdf)",
            example: "image/png"
        },
        size: {
            type: "number",
            description: "The size of the file in bytes",
            example: 969
        },
        storageLocation: {
            type: "object",
            properties: {
                provider: {
                    type: "string",
                    description: "The storage provider (e.g., AWS S3, Google Cloud Storage)",
                    example: "azure"
                },
                path: {
                    type: "string",
                    description: "The file path or storage URL",
                    example: "temp/2024/08/12/66b9fe45278a269d2a8a8f43/66b9fe45278a269d2a8a8f42.png"
                }
            }
        },
        moduleName: {
            type: "string",
            description: "The name of the module associated with the file",
            example: "workorders"
        },
        moduleId: {
            type: "string",
            description: "The ID of the module related to this file",
            example: "67456a7c165deb5bf4f7a39d"
        },
        createdBy: {
            type: "string",
            description: "The ID of the user who uploaded the file",
            example: "66e46ed06a02a636f546f06f"
        },
        updatedBy: {
            type: "string",
            description: "The ID of the user who last modified the file",
            example: "66e46ed06a02a636f546f06f"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the file was created",
            example: "2024-08-12T12:21:25.612+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the file was last updated",
            example: "2024-08-12T12:21:25.612+00:00"
        },
        metadata: {
            type: "object",
            description: "Additional metadata related to the file",
        },
        isSentToRecycleBin: {
            type: "boolean",
            description: "Indicates if the file has been moved to the recycle bin",
            example: false
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the file has been permanently deleted",
            example: false
        },
        clearRecycleBinAt: {
            type: "string",
            format: "date-time",
            description: "The timestamp when the file will be removed from the recycle bin",
        }
    },
    required: ["name", "extension", "contentType", "size", "storageLocation", "createdBy", "updatedBy", "createdAt", "updatedAt", "metadata"]
}

module.exports = { fileSchema }
					