const  userschema={
    type: "object",
    properties: {
        id: {
            type: "string",
            description: "ID of the user",
            example: "6682640ace2038006d1892c2"
        },
        firstName: {
            type: "string",
            description: "User's first name",
            example: "Crion"
        },
        lastName: {
            type: "string",
            description: "User's last name",
            example: "Admin"
        },
        name: {
            type: "string",
            description: "Business Unit-specific User ID",
            example: "Crion Admin"
        },
        buUserId: {
            type: "string",
            description: "Business Unit- specific user ID",
            example: "TIN5"
        },
        isDraft: {
            type: "boolean",
            description: " Indicates if the User record is in draft",
            example: false
        },
        employeeId: {
            type: "string",
            description: "Employee ID",
            example: "admin"
        },
        isSuperAdmin: {
            type: "boolean",
            description: "Indicates if the user is a super admin",
            example: false
        },
        email: {
            type: "string",
            description: "User's email address",
            example: "admin@criontech.com"
        },
        contactNumber: {
            type: "string",
            description: "User's contact Number",
            example: "9791178081"
        },
        countryCode: {
            type: "string",
            description: "Country code for the user's phone number",
            example: "+91"
        },
        isEnabled: {
            type: "boolean",
            description: " Indicates if the user account is active",
            example: true
        },
        isdeleted: {
            type: "boolean",
            description: "Indicates if the user account is deleted",
            example: true
        },
        shift: {
            type: "string",
            description: "Reference to the user's profile image",
        },
        image: {
            type: "string",
            description: "Reference to the user's profile image",
            example: "66ba02530d19d3e138726b83"
        },
        eSignature: {
            type: "string",
            description: "Reference to the user's e-signature",
        },
        userImage: {
            type: "string",
            description: "reference to the business Unit the User",
        },
        department: {
            type: "string",
            description: "Refernce to the department the user belongs to",
            example: "66a91cee3cf0e58511ccd963"
        },
        userType: {
            type: "string",
            description: "Refrence to the User Type",
            example: "66bca4e3e5a722222c858dec"
        },
        designation: {
            type: "string",
            description: "reference to the designation",
            example: "66bca5d6e5a722222c858def"
        },
        userPermission: {
            type: "string",
            description: "reference to the User permission settings",
            example: "66c44f0ab2f98a6ac8fb6c8c"
        },
        userAuthentication: {
            type: "string",
            description: "reference to the user Authenticatoion setting",
            example: "66c44f0ab2f98a6ac8fb6c8a"

        },
        team: {
            type: "string",
            description: "Reference to the Team The User belongs to",
        },
        reportsTo: {
            type: "string",
            description: "Reference to the manager/supervisor the user reports to.",
            example: "66b9e97fdf9c132bee9c2b81"
        },
        createdBy: {
            type: "string",
            description: "Reference to the user who created this record",
            example: "66b9e97fdf9c132bee9c2b81"
        },
        updatedBy: {
            type: "string",
            description: "Reference to the user who last updated this record.",
            example: "66b9e97fdf9c132bee9c2b81"
        },
        createdAt: {
            type: "string",
            format: "date-time",
            description: "Reference to the user who last updated this record.",
            example: "2024-08-20T08:08:42.224+00:00"
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            description: "Timestamp when the user was last updated.",
            example: "2024-08-20T08:08:42.224+00:00"
        },
    },
    required: ["isSuperAdmin", "createdBy", "updatedBy"]
   }


   module.exports = { userschema}