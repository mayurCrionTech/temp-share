/** 
 * @swagger
 * /api/v1/designations:
 *   post:
 *     summary: Create a new designation
 *     description: |
 *       This endpoint is to create a new designation.
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
 *       - Designations
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
 *                 example: "Product Manager"
 *               userType:
 *                 type: string
 *                 example: "605c72ef1e153a2b6c8e4d31"
 *               businessUnit:
 *                 type: string
 *                 example: "605c72ef1e153a2b6c8e4d30"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["605c72ef1e153a2b6c8e4d32", "605c72ef1e153a2b6c8e4d33"]
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - name
 *     responses:
 *       '201':
 *         description: Successfully created designation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation created successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f5c6a2d9e73c3a5c12d678"
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
 *               UserTypeNotExist:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist
 *                   errorInfo: null
 *               MissingPermissionsID:
 *                 summary: Missing Permission IDs
 *                 value:
 *                   message: Permission IDs must be a non-empty array of string 
 *                   errorInfo: null
 *               DuplicatePermission:
 *                 summary: Duplicate permissions found
 *                 value:
 *                   message: Duplicate permission ids are not allowed
 *                   duplicatePermissions: ["666fc8b3cfe03606a0e3a825"]
 *               InvalidPermission:
 *                 summary: Invalid permissions found
 *                 value:
 *                   message: Failed! Invalid permission ids 
 *                   invalidPermissions: ["666fc8b3cfe03606a0e3a827"]
 *               MissingDesignationName:
 *                 summary: Missing Designation name
 *                 value:
 *                   message: Desigantion name must be a non-empty string 
 *                   errorInfo: null
 *               MissingUserType:
 *                 summary: Missing UserType ID in params or body
 *                 value:
 *                   message: UserType id must be a non-empty string in req.params or req.body
 *               DesignationNameExist:
 *                 summary: Designation name exist
 *                 value:
 *                   message: Failed! Designation name already exists for the user type
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: isEnabled should be boolean
 *                 value:
 *                   message: Failed! Designation isEnabled should be a boolean
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
 * /api/v1/designations:
 *   get:
 *     summary: Retrieve all designations
 *     description: |
 *       This endpoint is to fetch all designations.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string 
 *         description: Name of the designation to filter
 *       - in: query
 *         name: userType
 *         schema:
 *           type: array
 *           items:
 *             type: string   
 *         description: Partial or full short name of the designation to filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records per page for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort the results by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Fields to include in the result, separated by commas
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Fields to populate, separated by commas
 *     responses:
 *       '200':
 *         description: Successfully retrieved designations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designations fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalCount:
 *                       type: integer
 *                       example: 25
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72ef1e153a2b6c8e4d32"
 *                           name:
 *                             type: string
 *                             example: "Product Manager"
 *                           isEnabled:
 *                             type: boolean
 *                             example: true
 *                           isDeleted:
 *                             type: boolean
 *                             example: false
 *                           userType:
 *                             type: id
 *                             example: "66a9dcded82efb35acf71223"
 *                             properties:
 *                           businessUnit:
 *                             type: id
 *                             example: "66a9dcded82efb35acf71287"
 *                           permissions:
 *                             type: id
 *                             example: ["66a9d977d82efb35acf711ec", "66a9d98cd82efb35acf711ef"]
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
 *               MissingUserTypeIDs:
 *                 summary: Missing UserType IDs
 *                 value:
 *                   message: UserType ids must be a non-empty string with comma separated values
 *                   errorInfo: null
 *               UserTypeNotExist:
 *                 summary: UserType does not exist
 *                 value:
 *                   message: Failed! UserType does not exist
 *                   errorInfo: null
 *               InvalidUserTypeId:
 *                 summary: Invalid UserType IDs
 *                 value:
 *                   message: Failed! Invalid UserType IDs
 *                   invalidUserTypeIDs: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/{designation}:
 *   get:
 *     summary: Retrieve a specific designation
 *     description: |
 *       This endpoint is to retrieve a specific designations.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designation
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the designation to retrieve
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to return.
 *         example: "name,isEnabled,userType,businessUnit,permissions"
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of related entities to populate 
 *         example: "permissions,userType,businessUnit"
 *     responses:
 *       '200':
 *         description: Successfully retrieved the designation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "666fc8b3cfe03606a0e3a823"
 *                     name:
 *                       type: string
 *                       example: "Manager"
 *                     businessUnit:
 *                       type: string
 *                       example: "666fc8b3cfe03606a0e3a824"
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
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               DesignationNotExist:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist
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
 *         description: Designation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Designation does not exist
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/{designation}/enable:
 *   patch:
 *     summary: Enable a designation
 *     description: |
 *       This endpoint is to enable a designation.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designation
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the designation to enable
 *     responses:
 *       '200':
 *         description: Successfully enabled the designation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation enabled successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               DesignationNotExist:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist
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
 *                   example: Some internal server error
*/


/**
 * @swagger 
 * /api/v1/designations/{designation}/disable:
 *   patch:
 *     summary: Disable a designation
 *     description: |
 *       This endpoint is to disable a designation.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designation
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the designation to disable
 *     responses:
 *       '200':
 *         description: Designation disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation disabled successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               DesignationNotExist:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/enable:
 *   patch:
 *     summary: Enable multiple designations
 *     description: |
 *       Enables multiple designations within a business unit.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["666fc8b3cfe03606a0e3a823", "666fc8b3cfe03606a0e3a824"]
 *     responses:
 *       '200':
 *         description: Designations enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designations enabled successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation IDs
 *                 value:
 *                   message: Designation id must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Invalid Designation ID
 *                 value:
 *                   message: Failed! Invalid Designation IDs
 *                   invalidDesignations: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/


/**
 * @swagger
 * /api/v1/designations/disable:
 *   patch:
 *     summary: Disable multiple designations
 *     description: |
 *       Disables multiple designations within a business unit.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["666fc8b3cfe03606a0e3a823", "666fc8b3cfe03606a0e3a824"]
 *     responses:
 *       '200':
 *         description: Designations disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designations disabled successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation IDs
 *                 value:
 *                   message: Designation id must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Invalid Designation ID
 *                 value:
 *                   message: Failed! Invalid Designation IDs
 *                   invalidDesignations: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/{designation}:
 *   delete:
 *     summary: Delete a designation
 *     description: |
 *       Marks a designation as deleted within a business unit.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designation
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the designation to delete.
 *     responses:
 *       '200':
 *         description: Designation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation deleted successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation IDs
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations:
 *   delete:
 *     summary: Delete multiple designations
 *     description: |
 *       This endpoint is to delete multiple designations.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["designationId1", "designationId2"]
 *     responses:
 *       '200':
 *         description: Designations deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designations deleted successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation IDs
 *                 value:
 *                   message: Designation id must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Invalid Designation ID
 *                 value:
 *                   message: Failed! Invalid Designation IDs
 *                   invalidDesignations: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/update:
 *   put:
 *     summary: Update an existing designation
 *     description: |
 *       This endpoint is to update a designation.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body. 
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 example: "660392d99c05e17d9d5a412f"
 *               name:
 *                 type: string
 *                 example: "Senior Manager"
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["66b9fe45278a269d2a8a8f46", "66b9fe45278a269d2a8a8f47"]
 *     responses:
 *       '200':
 *         description: Designation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation updated successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist  
 *                   errorInfo: null
 *               MissingDesignationName:
 *                 summary: Missing Designation name
 *                 value:
 *                   message: Designation name must be a non-empty string  
 *                   errorInfo: null
 *               DuplicateDesignationName:
 *                 summary: Designation name exists
 *                 value:
 *                   message: Failed! Designation name already exists for the User Type  
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: Invalid isEnabled field
 *                 value:
 *                   message: Failed! Designation isEnabled should be boolean  
 *                   errorInfo: null
 *               MissingPermissionID:
 *                 summary: Missing Permission IDs
 *                 value:
 *                   message: Permission IDs must be a non-empty array of strings  
 *                   errorInfo: null
 *               DuplicatePermission:
 *                 summary: Duplicate Permission IDs
 *                 value:
 *                   message: Duplicate Permission IDs are not allowed  
 *                   duplicatePermissions: ["666fc8b3cfe03606a0e3a825"]
 *               InvalidPermissionID:
 *                 summary: Invalid Permission IDs
 *                 value:
 *                   message: Failed! Invalid Permission IDs   
 *                   invalidPermissions: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/updateMultiple:
 *   put:
 *     summary: Update multiple designations
 *     description: Allows updating multiple designations at once, including their permissions and status.
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "660392d99c05e17d9d5a4178"
 *                     name:
 *                       type: string
 *                       example: "Senior Analyst"
 *                     isEnabled:
 *                       type: boolean
 *                       example: true
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["660392d99c05e17d9d5a412g", "660392d99c05e17d9d5a412j"]
 *     responses:
 *       '200':
 *         description: Designations updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designations updated successfully
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
 *               MissingDesignations:
 *                 summary: Missing Designations
 *                 value:
 *                   message: Designations must be a non-empty array of objects
 *                   errorInfo: null
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation ID must be a non-empty string in each permission object
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Invalid Designation IDs
 *                 value:
 *                   message: Failed! Invalid Designation IDs
 *                   invalidDesignations: ["666fc8b3cfe03606a0e3a825"]
 *               DuplicatePermissioonIDS:
 *                 summary: Duplicate Permission IDS 
 *                 value:
 *                   message: Duplicate Permission IDS are not allowed
 *                   duplicatePermissions: ["666fc8b3cfe03606a0e3a825"]
 *               InvalidPermissionID:
 *                 summary: Invalid Permisson IDs
 *                 value:
 *                   message: Failed! Invalid Permission IDs
 *                   invalidPermissions: ["666fc8b3cfe03606a0e3a826"]
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
 *                   example: Some internal server error
*/


/** 
 * @swagger
 * /api/v1/designations/{designation}:
 *   put:
 *     summary: Update a single designation
 *     description: |
 *       This endpoint is to update a single designation.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body. 
 *     tags:
 *       - Designations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: designation
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the designation to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Senior Analyst"
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["66b9fe45278a269d2a8a8f43", "66b9fe45278a269d2a8a8f44"]
 *     responses:
 *       '200':
 *         description: Designation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Designation updated successfully
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
 *               MissingDesignationID:
 *                 summary: Missing Designation ID
 *                 value:
 *                   message: Designation id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidDesignationID:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: Failed! Designation does not exist   
 *                   errorInfo: null
 *               MissingDesignationName:
 *                 summary: Missing Designation name
 *                 value:
 *                   message: Designation name must be a non-empty string  
 *                   errorInfo: null
 *               DuplicateDesignationName:
 *                 summary: Designation name exists
 *                 value:
 *                   message: Failed! Designation name already exists for the User Type  
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: Invalid isEnabled field
 *                 value:
 *                   message: Failed! Designation isEnabled should be boolean  
 *                   errorInfo: null
 *               MissingPermissionID:
 *                 summary: Missing Permission IDs
 *                 value:
 *                   message: Permission IDs must be a non-empty array of strings       
 *                   errorInfo: null
 *               DuplicatePermission:
 *                 summary: Duplicate Permission IDs
 *                 value:
 *                   message: Duplicate Permission IDs are not allowed  
 *                   invalidPermissions: ["666fc8b3cfe03606a0e3a825"]
 *               InvalidPermissionID:
 *                 summary: Invalid Permission IDs
 *                 value:
 *                   message: Failed! Invalid Permission IDs   
 *                   invalidPermissions: ["666fc8b3cfe03606a0e3a825"]
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
 *                   example: Some internal server error
*/
 