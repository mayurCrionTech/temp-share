/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: |
 *       This endpoint is to fetch all users.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departments
 *         schema:
 *           type: string
 *         description: Comma-separated department IDs
 *       - in: query
 *         name: userTypes
 *         schema:
 *           type: string
 *         description: Comma-separated user type IDs
 *       - in: query
 *         name: designations
 *         schema:
 *           type: string
 *         description: Comma-separated designation IDs
 *       - in: query
 *         name: teams
 *         schema:
 *           type: string
 *         description: Comma-separated team IDs
 *       - in: query
 *         name: reportsTo
 *         schema:
 *           type: string
 *         description: Comma-separated reportsTo user IDs
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *         description: Comma-separated start and end date for filtering users by created date
 *       - in: query
 *         name: updatedAt
 *         schema:
 *           type: string
 *         description: Comma-separated start and end date for filtering users by updated date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (default is createdAt)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       '200':
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "605c72a2e2a2f5b10f1e9c56"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "johndoe@example.com"
 *                       designation:
 *                         type: string
 *                         example: "Software Engineer"
 *                       department:
 *                         type: string
 *                         example: "Engineering"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! BusinessUnit does not exist"
 *             examples:
 *               BusinessUnitMissing:
 *                 summary: Missing Business Unit
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               BusinessUnitNotExist:
 *                 summary: Business unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingDepartmentId:
 *                 summary: Missing Department IDs
 *                 value:
 *                   message: "Department IDs must be a non-empty string of date with comma separated values"
 *               InvalidDepartmentIDs:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: "Failed! Invalid Department ids"
 *               MissingIDs:
 *                 summary: Missing IDs 
 *                 value:
 *                   message: "ids must be a non-empty array of strings"
 *               InvalidIDs:
 *                 summary: Invalid MongoDB IDs
 *                 value:
 *                   message: "Invalid ids"
 *               MissingUserTypeId:
 *                 summary: Missing User Type IDs
 *                 value:
 *                   message: "User Type IDs must be a non-empty string of date with comma separated values"
 *               InvalidUserTypeIDs:
 *                 summary: Invalid UserType IDs
 *                 value:
 *                   message: "Failed! Invalid UserType ids" 
 *               MissingDesignationIDs:
 *                 summary: Missing Designation IDs
 *                 value:
 *                   message: "Designation ids must be a non-empty string with comma separated values"
 *               InvalidDesignationIDs:
 *                 summary: Invalid Designation IDs
 *                 value:
 *                   message: "Failed! Invalid Designation ids"
 *               MissingTeamIDs:
 *                 summary: Missing Team IDs 
 *                 value:
 *                   message: "Team ids must be a non-empty string with comma separated values"
 *               InvalidTeamIDs:
 *                 summary: Invalid Team IDs
 *                 value:
 *                   message: "Failed! Invalid Team ids"
 *               MissingReportsToIDs:
 *                 summary: Missing ReportsTo IDs 
 *                 value:
 *                   message: "Team ids must be a non-empty string with comma separated values"
 *               InvalidReportsTo:
 *                 summary: Invalid ReportsTo IDs
 *                 value:
 *                   message: "Failed! Invalid ReportsTo ids"
 *               MissingCreatedAt:
 *                 summary: Missing CreatedAt 
 *                 value:
 *                   message: "CreatedAt must be a non-empty string with comma separated values"
 *               InvalidCreatedAt:
 *                 summary: Invalid CreatedAt format
 *                 value:
 *                   message: "CreatedAt must be a non-empty string of date with comma separated values"
 *               MissingUpdatedAt:
 *                 summary: Missing UpdatedAt 
 *                 value:
 *                   message: "UpdatedAt must be a non-empty string with comma separated values"
 *               InvalidUpdatedAt:
 *                 summary: Invalid UpdatedAt format
 *                 value:
 *                   message: "UpdatedAt must be a non-empty string of date with comma separated values"
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
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/users/count:
 *   get:
 *     summary: Get total and enabled users count
 *     description: |
 *       This endpoint is to retrieves the total number of users.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Users count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     enabledUsers:
 *                       type: integer
 *                       example: 120
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! BusinessUnit does not exist"
 *             examples:
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
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
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/users/{user}:
 *   get:
 *     summary: Get user details
 *     description: |
 *       This endpoint is to fetch details of a specific user.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [employeeId, email]
 *         description: Fetch user by employee ID or email instead of user ID
 *       - in: query
 *         name: selectFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to select in the user document
 *         example: name,email,designation
 *       - in: query
 *         name: populateFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to populate from referenced collections
 *         example: role,department
 *     responses:
 *       '200':
 *         description: Successfully fetched user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a8b2d5d2b5b30a34f8d123"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     employeeId:
 *                       type: string
 *                       example: "EMP12345"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Missing required fields"
 *             examples:
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Business Unit Does not Exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingUserType:
 *                 summary: Missing User Type ID
 *                 value:
 *                   message: "User Type Id must be a non-empty string"
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
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! User does not exist"
 *             examples:
 *               UserNotFound:
 *                 summary: User does not exist
 *                 value:
 *                   message: "Failed! User does not exist"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/users/{user}/enable:
 *   patch:
 *     summary: Enable a user account
 *     description: |
 *       This endpoint is to enable a user.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the user to be enabled"
 *     responses:
 *       '200':
 *         description: User enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User enabled successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "BusinessUnit Id must be a non-empty string"
 *             examples:
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit Id
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Invalid Business Unit ID
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingUserId:
 *                 summary: Missing User Id
 *                 value:
 *                   message: " User id must be a non-empty string in req.params or req.body"
 *               SameUserUpdate:
 *                 summary: Cannot disable the same user
 *                 value:
 *                   message: "Failed! Can't update the same user"
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
 *             examples:
 *               NoToken:
 *                 summary: No authentication token
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid authentication token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! User does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/users/{user}/disable:
 *   patch:
 *     summary: Disable a user
 *     description: |
 *       This endpoint is to disable a user.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to disable
 *     responses:
 *       '200':
 *         description: User disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User disabled successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! User id must be a non-empty string in req.params or req.body"
 *             examples:
 *               MissingUserId:
 *                 summary: User ID is required
 *                 value:
 *                   message: "Failed! User id must be a non-empty string in req.params or req.body"
 *               SameUserUpdate:
 *                 summary: Cannot disable the same user
 *                 value:
 *                   message: "Failed! Can't update the same user"
 *               MissingBusinessUnit:
 *                 summary: Business Unit is required
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! User does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/users/enable:
 *   patch:
 *     summary: Enable multiple users
 *     description: |
 *       This endpoint is to enable the given users.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 description: List of user IDs to enable
 *                 items:
 *                   type: string
 *                   example: 64e98b1e2f8d3a001234abcd
 *             required:
 *               - users
 *     responses:
 *       '200':
 *         description: Users enabled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users enabled successfully"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ids must be a non-empty array of strings"
 *             examples:
 *               MissingBusinessUnit:
 *                 summary: Missing BusinessUnit Id
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingUserIds:
 *                 summary: Missing User IDs
 *                 value:
 *                   message: "User id must be a non-empty array of strings"
 *               SameUserUpdate:
 *                 summary: User trying to update themselves
 *                 value:
 *                   message: "Failed! Can't update the same user"
 *               InvalidUsers:
 *                 summary: Some user IDs are invalid
 *                 value:
 *                   message: "Failed! Invalid User ids"
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
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/users/disable:
 *   patch:
 *     summary: Disable multiple users
 *     description: |
 *       This endpoint is to disable multiple users.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - users
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to be disabled
 *                 example: ["60f5a6bcd9b9f814b56fa181", "60f5a6bcd9b9f814b56fa182"]
 *     responses:
 *       '200':
 *         description: Users disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users disabled successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! User ids must be a non-empty array of strings"
 *             examples:
 *               MissingUsers:
 *                 summary: User IDs are required
 *                 value:
 *                   message: "Failed! User ids must be a non-empty array of strings"
 *               InvalidUsers:
 *                 summary: Some user IDs are invalid
 *                 value:
 *                   message: "Failed! Invalid User ids"
 *               SameUserUpdate:
 *                 summary: Cannot disable the same user
 *                 value:
 *                   message: "Failed! Can't update the same user"
 *               MissingBusinessUnit:
 *                 summary: Business Unit is required
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/users/{user}:
 *   delete:
 *     summary: Delete a user
 *     description: |
 *       This endpoint is to delete a user.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *         example: "60f5a6bcd9b9f814b56fa181"
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Cant update the same user"
 *             examples:
 *               SameUserUpdate:
 *                 summary: Cannot delete the same user
 *                 value:
 *                   message: "Failed! Can't update the same user"
 *                   errorinfo: null
 *               MissingUser:
 *                 summary: User ID is required
 *                 value:
 *                   message: "User id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               MissingBusinessUnit:
 *                 summary: Business Unit is required
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorinfo: null
 *               InvalidBusinessUnit:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorinfo: null
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! User does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/users:
 *   delete:
 *     summary: Delete multiple users
 *     description: |
 *       This endpoint is to delete multiple users.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - users
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to be deleted
 *                 example: ["60f5a6bcd9b9f814b56fa181", "60f5a6bcd9b9f814b56fa182"]
 *     responses:
 *       '200':
 *         description: Users deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users deleted successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Invalid User ids"
 *             examples:
 *               MissingUsers:
 *                 summary: Users array is required
 *                 value:
 *                   message: "User ids must be a non-empty array of strings"
 *               InvalidUsers:
 *                 summary: Some user IDs are invalid
 *                 value:
 *                   message: "Failed! Invalid User ids"
 *               SameUserUpdate:
 *                 summary: Cannot delete the same user
 *                 value:
 *                   message: "Failed! Can't update the same user"
 *               MissingBusinessUnit:
 *                 summary: Business Unit is required
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/users/{user}:
 *   put:
 *     summary: Update an existing user
 *     description: |
 *       This endpoint is to fupdates the details of an existing user.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: 
 *                 type: string
 *                 description: The first name of the user.
 *                 example: "John"
 *               lastName: 
 *                 type: string
 *                 description: The last name of the user.
 *                 example: "Doe"
 *               countryCode:    
 *                 type: string
 *                 description: The country code for the contact number.
 *                 example: "+1"
 *               contactNumber:   
 *                 type: number
 *                 description: The contact number of the user.
 *                 example: 9876543210
 *               department:        
 *                 type: string
 *                 description: The department ID of the user.
 *                 example: "60f5a6bcd9b9f814b56fa184"
 *               userType:     
 *                 type: string
 *                 description: The user type ID of the user.
 *                 example: "60f5a6bcd9b9f814b56fa185"
 *               designation:   
 *                 type: string
 *                 description: The designation ID of the user.
 *                 example: "60f5a6bcd9b9f814b56fa186"
 *               shift:
 *                 type: string
 *                 description: The shift ID assigned to the user.
 *                 example: "60f5a6bcd9b9f814b56fa187"
 *               team:   
 *                 type: string
 *                 description: The team ID assigned to the user.
 *                 example: "60f5a6bcd9b9f814b56fa188"
 *               reportsTo:     
 *                 type: string
 *                 description: The user ID of the reporting manager.
 *                 example: "60f5a6bcd9b9f814b56fa189"
 *               image:    
 *                 type: string
 *                 description: The file ID of the user's profile image.
 *                 example: "image_file_id"
 *               eSignature:       
 *                 type: string
 *                 description: The file ID of the user's electronic signature.
 *                 example: "esignature_file_id"
 *               isEnabled:      
 *                 type: boolean
 *                 description: Status of the user account.
 *                 example: true
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Invalid input"
 *             examples:
 *               MissingBusinessUnit: 
 *                 summary: Business Unit is required
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:    
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingUsers:   
 *                 summary: Missing User Id
 *                 value:
 *                   message: "User id must be a non-empty string in req.params or req.body"
 *               UserNotFound:   
 *                 summary: User does not exist
 *                 value:
 *                   message: "Failed! User does not exist"
 *               InvalidFirstName:    
 *                 summary: Invalid FirstName type
 *                 value:
 *                   message: "Failed! FirstName must be a string"
 *               InvalidLastName:   
 *                 summary: Invalid LastName type
 *                 value:
 *                   message: "Failed! LastName must be a string"
 *               InvalidEmployeeId:   
 *                 summary: Employee ID already exists
 *                 value:
 *                   message: "Failed! EmployeeId already exists for the business unit"
 *               InvalidCountryCode:   
 *                 summary: Invalid CountryCode type
 *                 value:
 *                   message: "Failed! CountryCode must be a string"
 *               InvalidContactNumber:   
 *                 summary: Invalid Contact Number type
 *                 value:
 *                   message: "Failed! Contact Number must be a number"
 *               CountryCodeTooLong:   
 *                 summary: CountryCodeTooLong
 *                 value:
 *                   message: "Failed! CountryCode should not exceed 4 characters"
 *               MissingDepartment:   
 *                 summary: Missing Department id
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *               InvalidDepartment:   
 *                 summary: Department does not exist
 *                 value:
 *                   message: "Failed! Department does not exist"
 *               MissingUserType:   
 *                 summary: Missing User Id
 *                 value:
 *                   message: "UserType id must be a non-empty string in req.params or req.body"
 *               InvalidUserType:     
 *                 summary: User Type does not exist
 *                 value:
 *                   message: "Failed! User Type does not exist"
 *               Missingdesignation:   
 *                 summary: Missing Designation Id
 *                 value:
 *                   message: "Designation id must be a non-empty string in req.params or req.body"
 *               InvalidDesignation:  
 *                 summary: Designation does not exist
 *                 value:
 *                   message: "Failed! Designation does not exist"
 *               MissingShift:   
 *                 summary: Missing Shift Id
 *                 value:
 *                   message: "Shift id must be a non-empty string in req.params or req.body"
 *               MissingTeam:   
 *                 summary: Missing Team Id
 *                 value:
 *                   message: "Team id must be a non-empty string in req.params or req.body"
 *               MissingreportsTo:   
 *                 summary: Missing ReportsTo user
 *                 value:
 *                   message: "ReportsTo must be a non-empty string in req.params or req.body"
 *               InvalidReportsTo:   
 *                 summary: ReportsTo user does not exist
 *                 value:
 *                   message: "Failed! ReportsTo user does not exist"
 *               ImageAndSignatureSame:  
 *                 summary: Image and eSignature cannot be the same
 *                 value:
 *                   message: "Failed! User image and eSignature cannot be the same"
 *               InvalidImageType:   
 *                 summary: Invalid Image type
 *                 value:
 *                   message: "Failed! Image must be a string"
 *               InvalidESignatureType:   
 *                 summary: Invalid eSignature type
 *                 value:
 *                   message: "Failed! eSignature must be a string"
 *               InvalidImage:   
 *                 summary: Invalid image file
 *                 value:
 *                   message: "Failed! image is not valid"
 *               InvalidImageFileId:   
 *                 summary: Invalid image file id
 *                 value:
 *                   message: "Failed! Image file id is not an user file"
 *               InvalidESignature:   
 *                 summary: Invalid eSignature file
 *                 value:
 *                   message: "Failed! eSignature is not valid"
 *               InvalidESignatureFileID:   
 *                 summary: Invalid eSignature file id
 *                 value:
 *                   message: "Failed! eSignature file id is not an user file"
 *             MissingUserType:  
 *               summary: Missing User Type for Department Update
 *               value:
 *                 message: "UserType is required and must be a non-empty string, while updating department"
 *             MissingDesignationForDepartment:     
 *               summary: Missing Designation for Department Update
 *               value:
 *                 message: "Designation is required and must be a non-empty string, while updating department"
 *             MissingDesignationForUserType:          
 *               summary: Missing Designation for UserType Update
 *               value:
 *                 message: "Designation is required and must be a non-empty string, while updating userType"
 *             MissingShift:    
 *               summary: Missing Shift
 *               value:
 *                 message: "Shift is required and must be a non-empty string"
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *             examples:
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Shift does not exist
 *             examples:
 *               ShiftNotFound:
 *                 summary: Shift Not found
 *                 value:
 *                   message: "Failed! Shift does not exist!"
 *               TeamNotFound:
 *                 summary: Team Not found
 *                 value:
 *                   message: "Failed! Team does not exist!"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/
