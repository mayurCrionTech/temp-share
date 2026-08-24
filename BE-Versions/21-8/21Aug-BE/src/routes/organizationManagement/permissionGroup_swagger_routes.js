/** 
 * @swagger
 * /api/v1/permissionGroups:
 *   post:
 *     summary: Create a new permission group
 *     description: |
 *       This endpoint is used to add a new permission group
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
 *       - Permission Groups
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
 *                 example: "Admin Group"
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '201':
 *         description: Permission group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PermissionGroup created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       example: "Admin Group"
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
 *               MissingPermissionGroupnName:
 *                 summary: Missing PermissionGroup name
 *                 value:
 *                   message: PermissionGroup name must be a non-empty string   
 *                   errorInfo: null
 *               DuplicatePermissionGroupName:
 *                 summary: PermissionGroup name exists
 *                 value:
 *                   message: Failed! PermissionGroup name already exists for the business unit  
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: Invalid isEnabled field
 *                 value:
 *                   message: Failed! PermissionGroup isEnabled should be boolean   
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
 *                   example: "Some internal server error"
*/


/** 
 * @swagger
 * /api/v1/permissionGroups:
 *   get:
 *     summary: Retrieve all permission groups
 *     description: |
 *       This endpoint is to fetch all permission groups.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination (must be >= 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page (must be >= 0)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "createdAt"       
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           example: "asc"
 *         description: Sorting order (must be "asc" or "desc")
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           example: "Admin"
 *         description: Filter by permission group name (case insensitive)
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
 *         description: Successfully retrieved permission groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroups fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     countData:
 *                       type: integer
 *                       example: 50
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "12345"
 *                           name:
 *                             type: string
 *                             example: "Admin Group"
 *                           businessUnit:
 *                             type: string
 *                             example: "6789034567vcx456"
 *                           isEnabled:
 *                             type: boolean
 *                             example: true
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/** 
 * @swagger
 * /api/v1/permissionGroups/{permissionGroup}:
 *   get:
 *     summary: Retrieve a specific permission group
 *     description: |
 *       This endpoint is to retrieve a specific permission group.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionGroup
 *         required: true
 *         schema:
 *           type: string
 *           example: "65af3e6d2a4b1a3c4d9f8b7a"
 *         description: ID of the permission group to retrieve
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *           example: "roles,users"
 *         description: Fields to populate (comma-separated)
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *           example: "name,description"
 *         description: Specific fields to select (comma-separated)
 *     responses:
 *       '200':
 *         description: Successfully retrieved the permission group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65af3e6d2a4b1a3c4d9f8b7a"
 *                     name:
 *                       type: string
 *                       example: "Admin Group"
 *                     businessUnit:
 *                       type: string
 *                       example: "67890"
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: PermissionGroup does not exist
 *                 value:
 *                   message: Failed! PermissionGroup does not exist  
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
 *         description: Permission group not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup not found
 *                 errorInfo:
 *                   type: null
 *                   example: null
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/** 
 * @swagger
 * /api/v1/permissionGroups/{permissionGroup}/enable:
 *   patch:
 *     summary: Enable a permission group
 *     description: |
 *       This endpoint is to enable a permission group.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionGroup
 *         required: true
 *         schema:
 *           type: string
 *           example: "65af3e6d2a4b1a3c4d9f8b7a"
 *         description: ID of the permission group to enable
 *     responses:
 *       '200':
 *         description: Successfully enabled the permission group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup enabled successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: PermissionGroup does not exist
 *                 value:
 *                   message: Failed! PermissionGroup does not exist  
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/** 
 * @swagger
 * /api/v1/permissionGroups/{permissionGroup}/disable:
 *   patch:
 *     summary: Disable a permission group
 *     description: |
 *       This endpoint is to disable a permission group.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionGroup
 *         required: true
 *         schema:
 *           type: string
 *           example: "65af3e6d2a4b1a3c4d9f8b7a"
 *         description: ID of the permission group to disable 
 *     responses:
 *       '200':
 *         description: Successfully disabled the permission group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup disabled successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: PermissionGroup does not exist
 *                 value:
 *                   message: Failed! PermissionGroup does not exist  
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/** 
 * @swagger
 * /api/v1/permissionGroups/enable:
 *   patch:
 *     summary: Enable multiple permission groups
 *     description: |
 *       This endpoint is to enable multiple permission groups.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65af3e6d2a4b1a3c4d9f8b7a", "65af3e6d2a4b1a3c4d9f8b7b"]
 *     responses:
 *       '200':
 *         description: Successfully enabled the permission groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroups enabled successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup ids must be a non-empty array of strings
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: Invalid PermissionGroup ids
 *                 value:
 *                   message: Failed! Invalid PermissionGroup ids
 *                   invalidPermissionGroups: ["65af3e6d2a4b1a3c4d9f8b7x"]
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
 * /api/v1/permissionGroups/disable:
 *   patch:
 *     summary: Disable multiple permission groups
 *     description: |
 *       This endpoint is to disable multiple permission groups.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65af3e6d2a4b1a3c4d9f8b7a", "65af3e6d2a4b1a3c4d9f8b7b"]
 *     responses:
 *       '200':
 *         description: Successfully disabled the permission groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroups disabled successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup ids must be a non-empty array of string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: Invalid PermissionGroup IDs
 *                 value:
 *                   message: Failed! Invalid PermissionGroup ids  
 *                   invalidPermissionGroups: ["65af3e6d2a4b1a3c4d9f8b7x"]
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
 * /api/v1/permissionGroups/{permissionGroup}:
 *   delete:
 *     summary: Delete a permission group
 *     description: |
 *       This endpoint is to delete a permission group.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionGroup
 *         required: true
 *         schema:
 *           type: string
 *         example: "65af3e6d2a4b1a3c4d9f8b7a"
 *         description: The ID of the permission group to delete
 *     responses:
 *       '200':
 *         description: Successfully deleted the permission group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup deleted successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: PermissionGroup does not exist
 *                 value:
 *                   message: Failed! PermissionGroup does not exist  
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
 * /api/v1/permissionGroups:
 *   delete:
 *     summary: Delete multiple permission groups
 *     description: |
 *       This endpoint is to delete multiple permission groups.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65af3e6d2a4b1a3c4d9f8b7a", "65bf3e6d2a4b1a3c4d9f8c8b"]
 *               businessUnit:
 *                 type: string
 *                 example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                 description: The ID of the business unit (required for non-super admin users)
 *     responses:
 *       '200':
 *         description: Successfully deleted permission groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroups deleted successfully
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
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup IDs
 *                 value:
 *                   message: PermissionGroup ids must be a non-empty array of strings  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: Invalid PermissionGroup IDs
 *                 value:
 *                   message: Failed! Invalid PermissionGroup IDs 
 *                   invalidPermissionGroups: ["65af3e6d2a4b1a3c4d9f8b7x"]
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
 * /api/v1/permissionGroups/{permissionGroup}:
 *   put:
 *     summary: Update a permission group
 *     description: |
 *       This endpoint is to update a permission group.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permission Groups
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionGroup
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the permission group to update
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         required: true
 *         description: Business unit ID 
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin Group"
 *                 description: New name for the permission group (optional)
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *                 description: Enable or disable the permission group (optional)
 *               businessUnit:
 *                 type: string
 *                 example: "65cf4e6d2a4b1a3c4d9f8d9c"
 *                 description: The ID of the business unit (required for non-super admin users)
 *     responses:
 *       '200':
 *         description: Successfully updated the permission group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PermissionGroup updated successfully
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
 *               MissingBusinessUnitName:
 *                 summary: Missing Business Unit name
 *                 value:
 *                   message: BusinessUnit name must be a non-empty string   
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist   
 *                   errorInfo: null
 *               DuplicatePermissionGroupName:
 *                 summary: PermissionGroup name exists
 *                 value:
 *                   message: Failed! PermissionGroup name already exists for the business unit  
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: Invalid isEnabled field
 *                 value:
 *                   message: Failed! PermissionGroup isEnabled should be boolean 
 *               MissingPermissionGroupID:
 *                 summary: Missing PermissionGroup ID
 *                 value:
 *                   message: PermissionGroup id must be a non-empty string in req.params or req.body  
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 summary: PermissionGroup does not exist
 *                 value:
 *                   message: Failed! PermissionGroup does not exist   
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


