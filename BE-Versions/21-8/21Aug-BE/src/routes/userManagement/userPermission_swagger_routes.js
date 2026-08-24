/**
 * @swagger
 * /api/v1/userPermissions/updatemultipleUserPermission:
 *   put:
 *     summary: Update multiple user permissions
 *     tags:
 *       - User Permission
 *     description: |
 *       Update multiple user permission.
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
 *             properties:
 *               userPermissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     positivePermissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     negativePermissions:
 *                       type: array
 *                       items:
 *                         type: string
 *           example:
 *             userPermissions:
 *               - id: "permission1"
 *                 positivePermissions: ["permA", "permB"]
 *                 negativePermissions: ["permC"]
 *               - id: "permission2"
 *                 positivePermissions: ["permX"]
 *                 negativePermissions: ["permY", "permZ"]
 *     responses:
 *       '200':
 *         description: User permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *             example:
 *               message: "User permissions updated successfully"
 *               data: null
 *       '400':
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             examples:
 *               MissingUserPermissionId:
 *                 value:
 *                   message: "UserPermission ID must be provided and be a non-empty string."
 *                   errorInfo: null
 *               UserPermissionNotExist:
 *                 value:
 *                   message: "Failed! One or more provided UserPermissions do not exist."
 *                   errorInfo: null
 *               InvalidPositivePermissions:
 *                 value:
 *                   message: "Positive permission IDs must be a non-empty array of valid strings."
 *                   errorInfo: null
 *               InvalidNegativePermissions:
 *                 value:
 *                   message: "Negative permission IDs must be a non-empty array of valid strings."
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized access due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided."
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided."
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
 *                 errorInfo:
 *                   type: null
 *             example:
 *               message: "Internal server error. Please try again later."
 *               errorInfo: null
 */



/**
 * @swagger
 * /api/v1/userPermissions/updateUserPermission:
 *   put:
 *     summary: Update a user permission
 *     tags:
 *       - User Permission
 *     description: |
 *       Update a user permission 
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
 *             properties:
 *               id:
 *                 type: string
 *               positivePermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               negativePermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *           example:
 *             id: "permission1"
 *             positivePermissions: ["permA", "permB"]
 *             negativePermissions: ["permC"]
 *     responses:
 *       '200':
 *         description: User permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *             example:
 *               message: "User permission updated successfully"
 *               data: null
 *       '400':
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             examples:
 *               MissingUserPermissionId:
 *                 value:
 *                   message: "UserPermission ID must be provided and be a non-empty string."
 *                   errorInfo: null
 *               UserPermissionNotExist:
 *                 value:
 *                   message: "Failed! The provided UserPermission does not exist."
 *                   errorInfo: null
 *               InvalidPositivePermissions:
 *                 value:
 *                   message: "Positive permission IDs must be a non-empty array of valid strings."
 *                   errorInfo: null
 *               DuplicatePositivePermissions:
 *                 value:
 *                   message: "Duplicate positive permission IDs are not allowed."
 *                   errorInfo: { "duplicatePositivePermissions": ["permA"] }
 *               InvalidNegativePermissions:
 *                 value:
 *                   message: "Negative permission IDs must be a non-empty array of valid strings."
 *                   errorInfo: null
 *               DuplicateNegativePermissions:
 *                 value:
 *                   message: "Duplicate negative permission IDs are not allowed."
 *                   errorInfo: { "duplicateNegativePermissions": ["permY"] }
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! The specified BusinessUnit does not exist."
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized access due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided."
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided."
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
 *                 errorInfo:
 *                   type: null
 *             example:
 *               message: "Internal server error. Please try again later."
 *               errorInfo: null
 */

