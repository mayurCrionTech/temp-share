/** 
 * @swagger
 * /api/v1/userTypes:
 *   post:
 *     summary: Create a new userType
 *     description: |
 *       This endpoint is used to create a new userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Manager"
 *                 description: Name of the user type (required)
 *               department:
 *                 type: string
 *                 example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                 description: The ID of the department (required)
 *               businessUnit:
 *                 type: string
 *                 example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                 description: The ID of the business unit (required for non-super admin users)
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *                 description: Enable or disable the user type (optional, default is true)
 *     responses:
 *       '201':
 *         description: Successfully created the user type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType created successfully
 *                 userType:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "660abc123ef45g67h89ijklm"
 *                     name:
 *                       type: string
 *                       example: "Manager"
 *                     department:
 *                       type: string
 *                       example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                     businessUnit:
 *                       type: string
 *                       example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                     isEnabled:
 *                       type: boolean
 *                       example: true
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingDepartmentID:
 *                 summary: Missing Department ID
 *                 value:
 *                   message: Department id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidDepartment:
 *                 summary: Department does not exist
 *                 value:
 *                   message: Failed! Department does not exist  
 *                   errorInfo: null
 *               MissingUserTypeName:
 *                 summary: Missing UserType name
 *                 value:
 *                   message: UserType name must be a non-empty string   
 *                   errorInfo: null
 *               UserTypeNameExists:
 *                 summary: UserType name already exists
 *                 value:
 *                   message: Failed! UserType name already exists for the department   
 *                   errorInfo: null
 *               InvalidIsEnabledValue:
 *                 summary: Invalid isEnabled value
 *                 value:
 *                   message: Failed! UserType isEnabled should be a boolean   
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes:
 *   get:
 *     summary: Get all user types
 *     description: |
 *       This endpoint is to fetch all userTypes.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departments
 *         schema:
 *           type: string
 *           example: "65cf4e6d2a4b1a3c4d9f8d9c,65cf4e6d2a4b1a3c4d9f8d9d"
 *         description: Comma-separated list of department IDs
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: "Manager"
 *         description: Filter user types by name (case-insensitive search)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of user types per page (0 for no limit)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "createdAt"
 *         description: Sort field (default is "createdAt")
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: Sorting order ("asc" or "desc", default is "asc")
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *           example: "name,department,isEnabled"
 *         description: Comma-separated list of fields to include in the response
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *           example: "department,businessUnit"
 *         description: Comma-separated list of fields to populate
 *     responses:
 *       '200':
 *         description: Successfully fetched all user types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserTypes fetched successfully
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalRecords:
 *                   type: integer
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "660abc123ef45g67h89ijklm"
 *                       name:
 *                         type: string
 *                         example: "Manager"
 *                       department:
 *                         type: string
 *                         example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                       businessUnit:
 *                         type: string
 *                         example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                       isEnabled:
 *                         type: boolean
 *                         example: true
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingDepartmentID:
 *                 summary: Missing Department ID
 *                 value:
 *                   message: Department id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidDepartment:
 *                 summary: Department does not exist
 *                 value:
 *                   message: Failed! Department does not exist  
 *                   errorInfo: null
 *               MissingDepartmentIDs:
 *                 summary: Missing Department IDs
 *                 value:
 *                   message: Department ids must be a non-empty string with comma separated values  
 *                   errorInfo: null
 *               InvalidDepartmentID:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: Failed! Invalid Department IDs
 *                   invalidDepartments: ["666fc8b3cfe03606a0e3a825"]
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/**
 * @swagger
 * /api/v1/userTypes/{userType}:
 *   get:
 *     summary: Get a specific user type by ID
 *     description: |
 *       This endpoint is to get a specific userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           example: "660abc123ef45g67h89ijklm"
 *         description: UserType ID to fetch
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *           example: "name,department,isEnabled"
 *         description: Comma-separated list of fields to include in the response
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *           example: "department,businessUnit"
 *         description: Comma-separated list of fields to populate
 *     responses:
 *       '200':
 *         description: Successfully fetched the user type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "660abc123ef45g67h89ijklm"
 *                     name:
 *                       type: string
 *                       example: "Manager"
 *                     department:
 *                       type: string
 *                       example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                     businessUnit:
 *                       type: string
 *                       example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                     isEnabled:
 *                       type: boolean
 *                       example: true
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body or req.body
 *                   errorInfo: null
 *               InvaliduserType:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist  
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '404':
 *         description: Not found 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/**
 * @swagger
 * /api/v1/userTypes/{userType}/enable:
 *   patch:
 *     summary: Enable a user type
 *     description: |
 *       This endpoint is to enable a userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           example: "660abc123ef45g67h89ijklm"
 *         description: The UserType ID to enable
 *     responses:
 *       '200':
 *         description: UserType enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType enabled successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body or req.query
 *                   errorInfo: null
 *               InvalidUserType:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist  
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes/{userType}/disable:
 *   patch:
 *     summary: Disable a user type
 *     description: |
 *       This endpoint is to disable a userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           example: "660abc123ef45g67h89ijklm"
 *         description: The UserType ID to disable
 *     responses:
 *       '200':
 *         description: UserType disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType disabled successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body or req.query
 *                   errorInfo: null
 *               InvalidUserType:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist  
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes/enable:
 *   patch:
 *     summary: Enable multiple user types
 *     description: |
 *       This endpoint is to enable multiple userTypes.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "660abc123ef45g67h89ijklm"
 *                 description: Array of UserType IDs to enable
 *             required:
 *               - userTypes
 *     responses:
 *       '200':
 *         description: UserTypes enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserTypes enabled successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType ids must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidUserTypeID:
 *                 summary: Invalid UserType IDs
 *                 value:
 *                   message: Failed! Invalid UserType IDs
 *                   invalidDepartments: ["666fc8b3cfe03606a0e3a825"]
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes/disable:
 *   patch:
 *     summary: Disable multiple user types
 *     description: |
 *       This endpoint is to disable a userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "660abc123ef45g67h89ijklm"
 *                 description: Array of UserType IDs to disable
 *             required:
 *               - userTypes
 *     responses:
 *       '200':
 *         description: UserTypes disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserTypes disabled successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType ids must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidUserTypeID:
 *                 summary: Invalid UserType IDs
 *                 value:
 *                   message: Failed! Invalid UserType IDs
 *                   invalidDepartments: ["666fc8b3cfe03606a0e3a825"]
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes/{userType}:
 *   delete:
 *     summary: Delete a specific user type
 *     description: |
 *       This endpoint is to delete a specific userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           example: "660abc123ef45g67h89ijklm"
 *         description: ID of the user type to be deleted
 *     responses:
 *       '200':
 *         description: UserType deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType deleted successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body or req.query
 *                   errorInfo: null
 *               InvalidUserType:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist  
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes:
 *   delete:
 *     summary: Delete multiple user types
 *     description: |
 *       This endpoint is to delete multiple userTypes.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["660abc123ef45g67h89ijklm", "661bcd234gh67k89lm01nopq"]
 *     responses:
 *       '200':
 *         description: UserTypes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserTypes deleted successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType ids must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidUserTypeID:
 *                 summary: Invalid UserType IDs
 *                 value:
 *                   message: Failed! Invalid UserType IDs
 *                   invalidDepartments: ["666fc8b3cfe03606a0e3a825"]
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/


/** 
 * @swagger
 * /api/v1/userTypes/{userType}:
 *   put:
 *     summary: Update a user type
 *     description: |
 *       This endpoint is to update a userType.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - User Types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated UserType Name"
 *                 description: New name for the user type (must be unique within the department)
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *                 description: Enable or disable the user type
 *     responses:
 *       '200':
 *         description: UserType updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UserType updated successfully
 *       '400 ':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingBusinessUnitID:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: BusinessUnit Id must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist  
 *                   errorInfo: null
 *               MissingUserTypeID:
 *                 summary: Missing UserType ID
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body or req.query
 *                   errorInfo: null
 *               InvalidUserType:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist  
 *                   errorInfo: null
 *               MissingUserTypeName:
 *                 summary: Missing UserType name
 *                 value:
 *                   message: UserType name must be a non-empty string   
 *                   errorInfo: null
 *               UserTypeNameExists:
 *                 summary: UserType name already exists
 *                 value:
 *                   message: Failed! UserType name already exists for the department   
 *                   errorInfo: null
 *               InvalidIsEnabledValue:
 *                 summary: Invalid isEnabled value
 *                 value:
 *                   message: Failed! UserType isEnabled should be a boolean   
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error.
*/
