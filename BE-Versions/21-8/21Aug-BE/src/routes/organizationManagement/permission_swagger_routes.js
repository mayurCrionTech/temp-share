/**
 * @swagger
 * /api/v1/permissions:
 *   post:
 *     summary: Create a new permission
 *     description: |
 *       This endpoint is to create a new permission.
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permissions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: permissionGroup
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission group (MongoDB ObjectId). Can also be provided in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the permission within the permission group and business unit.
 *                 example: "View Reports"
 *               permissionGroup:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: The ID of the permission group (MongoDB ObjectId). Optional if provided in query.
 *                 example: "64a62cdbe341fa456e123abc"
 *               isEnabled:
 *                 type: boolean
 *                 description: Whether the permission is enabled (optional, defaults to true).
 *                 example: true
 *           example:
 *             name: "View Reports"
 *             permissionGroup: "64a62cdbe341fa456e123abc"
 *             isEnabled: true
 *     responses:
 *       '201':
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission created successfully"
 *               result:
 *                 _id: "64a62cdbe341fa456e123def"
 *                 name: "View Reports"
 *                 permissionGroup: "64a62cdbe341fa456e123abc"
 *                 businessUnit: "64a62cdbe341fa456e123ghi"
 *                 isEnabled: true
 *                 createdAt: "2025-04-15T08:00:00.000Z"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingName:
 *                 value:
 *                   message: "Permission name must be a non-empty string"
 *                   errorInfo: null
 *               MissingPermissionGroup:
 *                 value:
 *                   message: "Permission group id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 value:
 *                   message: "Failed! PermissionGroup does not exist"
 *                   errorInfo: null
 *               DuplicateName:
 *                 value:
 *                   message: "Failed! Permission name already exists for the permission group"
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 value:
 *                   message: "Failed! Permission isEnabled should be a boolean"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: Retrieve all permissions
 *     tags:
 *       - Permissions
 *     description: |
 *       Fetches a paginated list of permissions 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: permissionGroup
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission group to filter permissions (MongoDB ObjectId).
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter permissions by name (case-insensitive partial match).
 *         example: "View"
 *       - in: query
 *         name: permissionGroups
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: ^[0-9a-fA-F]{24}$
 *         description: List of permission group IDs to filter permissions (MongoDB ObjectIds).
 *         example: ["64a62cdbe341fa456e123abc"]
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of permissions per page (0 returns all).
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by (e.g., name, createdAt).
 *         example: "name"
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "asc"
 *         description: Sort order.
 *       - in: query
 *         name: selectFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated fields to include in the response (always includes _id).
 *         example: "name,permissionGroup"
 *       - in: query
 *         name: populateFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated fields to populate (e.g., permissionGroup).
 *         example: "permissionGroup"
 *     responses:
 *       '200':
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permissions fetched successfully"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 2
 *                 totalDataCount: 20
 *                 data:
 *                   - id: "64a62cdbe341fa456e123def"
 *                     name: "View Reports"
 *                     permissionGroup: "64a62cdbe341fa456e123abc"
 *                     businessUnit: "64a62cdbe341fa456e123ghi"
 *                     isEnabled: true
 *                     createdAt: "2025-04-15T08:00:00.000Z"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               InvalidPermissionGroup:
 *                 value:
 *                   message: "Failed! PermissionGroup does not exist"
 *                   errorInfo: null
 *               InvalidPagination:
 *                 value:
 *                   message: "Invalid pagination parameters. Please provide valid numbers for page, totalPages, and totalDataCount."
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/{permission}:
 *   get:
 *     summary: Retrieve a specific permission
 *     tags:
 *       - Permissions
 *     description: |
 *       Fetches details of a specific permission identified by `permission` ID. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission to retrieve (MongoDB ObjectId).
 *       - in: query
 *         name: selectFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated fields to include in the response (always includes id).
 *         example: "name,permissionGroup"
 *       - in: query
 *         name: populateFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated fields to populate (e.g., permissionGroup).
 *         example: "permissionGroup"
 *     responses:
 *       '200':
 *         description: Permission fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission fetched successfully"
 *               result:
 *                 id: "64a62cdbe341fa456e123def"
 *                 name: "View Reports"
 *                 permissionGroup: "64a62cdbe341fa456e123abc"
 *                 businessUnit: "64a62cdbe341fa456e123ghi"
 *                 isEnabled: true
 *                 createdAt: "2025-04-15T08:00:00.000Z"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingPermissionId:
 *                 value:
 *                   message: "Permission id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermission:
 *                 value:
 *                   message: "Failed! Permission does not exist"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '404':
 *         description: Permission not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission not found"
 *               errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/{permission}/enable:
 *   patch:
 *     summary: Enable a specific permission
 *     tags:
 *       - Permissions
 *     description: |
 *       Enables a specific permission identified by `permission` ID 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission to enable (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the token.
 *     responses:
 *       '200':
 *         description: Permission enabled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission enabled successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingPermissionId:
 *                 value:
 *                   message: "Permission id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermission:
 *                 value:
 *                   message: "Failed! Permission does not exist"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/{permission}/disable:
 *   patch:
 *     summary: Disable a specific permission
 *     tags:
 *       - Permissions
 *     description: |
 *       Disables a specific permission identified by `permission` ID 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission to disable (MongoDB ObjectId).
 *     responses:
 *       '200':
 *         description: Permission disabled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission disabled successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingPermissionId:
 *                 value:
 *                   message: "Permission id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermission:
 *                 value:
 *                   message: "Failed! Permission does not exist"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/enable:
 *   patch:
 *     summary: Enable multiple permissions
 *     tags:
 *       - Permissions
 *     description: |
 *       Enables multiple permissions identified by their IDs by setting `isEnabled` to `true`. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of permission IDs to enable (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *           example:
 *             permissions: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *     responses:
 *       '200':
 *         description: Permissions enabled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permissions enabled successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidPermissionsArray:
 *                 value:
 *                   message: "Permission ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               DuplicatePermissions:
 *                 value:
 *                   message: "Duplicate permission ids are not allowed"
 *                   errorInfo:
 *                     duplicatePermissions: ["64a62cdbe341fa456e123def"]
 *               InvalidPermissions:
 *                 value:
 *                   message: "Failed! Invalid Permission ids"
 *                   errorInfo:
 *                     invalidPermissions: ["64a62cdbe341fa456e123xyz"]
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/disable:
 *   patch:
 *     summary: Disable multiple permissions
 *     tags:
 *       - Permissions
 *     description: |
 *       Disables multiple permissions identified by their IDs by setting `isEnabled` to `false`. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of permission IDs to disable (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *           example:
 *             permissions: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *     responses:
 *       '200':
 *         description: Permissions disabled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permissions disabled successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidPermissionsArray:
 *                 value:
 *                   message: "Permission ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               DuplicatePermissions:
 *                 value:
 *                   message: "Duplicate permission ids are not allowed"
 *                   errorInfo:
 *                     duplicatePermissions: ["64a62cdbe341fa456e123def"]
 *               InvalidPermissions:
 *                 value:
 *                   message: "Failed! Invalid Permission ids"
 *                   errorInfo:
 *                     invalidPermissions: ["64a62cdbe341fa456e123xyz"]
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/{permission}:
 *   delete:
 *     summary: Delete a specific permission
 *     tags:
 *       - Permissions
 *     description: |
 *       Soft-deletes a specific permission identified by `permission` ID by setting `isDeleted` to `true`. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission to delete (MongoDB ObjectId).
 *     responses:
 *       '200':
 *         description: Permission deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission deleted successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingPermissionId:
 *                 value:
 *                   message: "Permission id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermission:
 *                 value:
 *                   message: "Failed! Permission does not exist"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/permissions/delete:
 *   delete:
 *     summary: Delete multiple permissions
 *     tags:
 *       - Permissions
 *     description: |
 *       Soft-deletes multiple permissions identified by their IDs by setting `isDeleted` to `true`.
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of permission IDs to delete (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *           example:
 *             permissions: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *     responses:
 *       '200':
 *         description: Permissions deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permissions deleted successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidPermissionsArray:
 *                 value:
 *                   message: "Permission ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               DuplicatePermissions:
 *                 value:
 *                   message: "Duplicate permission ids are not allowed"
 *                   errorInfo:
 *                     duplicatePermissions: ["64a62cdbe341fa456e123def"]
 *               InvalidPermissions:
 *                 value:
 *                   message: "Failed! Invalid Permission ids"
 *                   errorInfo:
 *                     invalidPermissions: ["64a62cdbe341fa456e123xyz"]
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */


/**
 * @swagger
 * /api/v1/permissions/{permission}:
 *   patch:
 *     summary: Update a specific permission
 *     description: |
 *       Updates a specific permission identified by `permission` ID. Allows updating the permission's name and/or enabled status. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Permissions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the permission to update (MongoDB ObjectId).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the permission (must be unique within the permission group).
 *                 example: "Updated View Reports"
 *               isEnabled:
 *                 type: boolean
 *                 description: Whether the permission is enabled.
 *                 example: true
 *           example:
 *             name: "Updated View Reports"
 *             isEnabled: true
 *     responses:
 *       '200':
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Permission updated successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingPermissionId:
 *                 value:
 *                   message: "Permission id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidPermission:
 *                 value:
 *                   message: "Failed! Permission does not exist"
 *                   errorInfo: null
 *               InvalidName:
 *                 value:
 *                   message: "Permission name must be a non-empty string"
 *                   errorInfo: null
 *               NameExists:
 *                 value:
 *                   message: "Failed! Permission name already exists for the permission group"
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 value:
 *                   message: "Failed! Permission isEnabled should be a boolean"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */