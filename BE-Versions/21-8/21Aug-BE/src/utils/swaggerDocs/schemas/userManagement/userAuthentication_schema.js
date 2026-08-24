const  userAuthenticationschema = {
    Type: "object",
    properties: {
        id: {
            type: "string",
            description: "The ID of the User",
            example: "66a9e2ef473e2c8b397bf26e"
        },
        user: {
            type: "string",
            description: "Reference to the User associated with this authentication record.",
            example: "66a9e2ee473e2c8b397bf26b"
        },
        email: {
            type: "string",
            description: "User's email address (unique and stored in lowercase , Max length: 10)",
            example: "manogaran@criontech.com"
        },
        employeeId: {
            type: "string",
            description: "Reference to the Business Unit the user belongs to",
            example: "KR004"
        },
        businessUnit: {
            type: "string",
            description: "ID of the associated BusinessUnit",
            example: "6641959acbe6ea3941e60789"
        },
        buUserId: {
            type: "string",
            description: "Business Unit-specific unique userID",
            example: "TIN7"
        },
        password: {
            type: "string",
            description: "User's Hashed password",
            example: "$2a$10$oiqhe6b5lNoAWHYi/sTkGOqrpWowrFpZ6bdQib8VeuGJ6XWslZ5j"
        },
        passwordExpiredAt: {
            type: "string",
            format: "date-time",
            description: "Expiration date of the user's password.",
            example: "2025-02-21T15:49:39.555+00:00"
        },
        isEnabled: {
            type: "boolean",
            description: "Indicates if the user authentication is active",
            example: false
        },
        isDeleted: {
            type: "boolean",
            description: "Indicates if the authentication record is deleted",
            example: false 
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the authentication record was created",
            example: "2024-08-14T13:53:29.999+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the authentication record was last updated.",
            example: "2024-08-14T13:53:29.999+00:00"
        },
    },
    required: ["email", "employeeId", "businessUnit", "buUserId", "password", "passwordExpiredAt"]
   }


   module.exports = {userAuthenticationschema}