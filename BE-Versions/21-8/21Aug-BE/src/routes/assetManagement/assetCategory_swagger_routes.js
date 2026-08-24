/**
 * @swagger
 * /api/v1/asset-categories:
 *   post:
 *     summary: Create a new asset category
 *     tags:
 *       - Asset Category
 *     description: |
 *       This endpoint is to create a new designation.
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |
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
 *               name:
 *                 type: string
 *                 description: The name of the asset category (max 50 characters, unique, required)
 *               defaultDocumentNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of default document names (max 50 items)
 *               personalProtectiveEquipments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of personal protective equipment IDs (max 100 items, must be valid)
 *               businessUnit:
 *                 type: string
 *                 description: The business unit ID (must exist, required)
 *           example:
 *             name: "Electrical Equipment"
 *             defaultDocumentNames: ["Safety Guide", "Installation Manual"]
 *             personalProtectiveEquipments: ["ppe1", "ppe2"]
 *             businessUnit: "60b8d295f1d2c00015b8d73b"
 *     responses:
 *       '201':
 *         description: Asset category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *             example:
 *               message: "AssetCategory created successfully"
 *               id: "60b8d295f1d2c00015b8d73c"
 *       '400':
 *         description: Bad request (Validation Errors)
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
 *               MissingField:
 *                 value:
 *                   message: "Failed! name is required"
 *                   errorInfo: null
 *               InvalidField:
 *                 value:
 *                   message: "Failed! businessUnit is invalid"
 *                   errorInfo: null
 *               Duplicate:
 *                 value:
 *                   message: "Failed! name already exists in the server"
 *                   errorInfo: null
 *               MaxLengthExceeded:
 *                 value:
 *                   message: "Failed! defaultDocumentNames should not exceed 50 items"
 *                   errorInfo: null
 *               InvalidPPE:
 *                 value:
 *                   message: "Failed! Invalid personalProtectiveEquipments"
 *                   errorInfo: { "invalidIds": ["ppeX"] }
 *       '401':
 *         description: Unauthorized
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
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/asset-categories/{assetCategory}:
 *   put:
 *     summary: Update an existing asset category
 *     tags:
 *       - Asset Category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetCategory
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 description: The name of the asset category (must be unique)
 *               defaultDocumentNames:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: string
 *                 description: List of default document names
 *               personalProtectiveEquipments:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: string
 *                 description: List of personal protective equipment IDs (must be valid)
 *               businessUnit:
 *                 type: string
 *                 description: The business unit ID (must exist)
 *           example:
 *             name: "Updated Equipment"
 *             defaultDocumentNames: ["Updated Guide", "Updated Manual"]
 *             personalProtectiveEquipments: ["ppe3", "ppe4"]
 *             businessUnit: "60b8d295f1d2c00015b8d73b"
 *     responses:
 *       '200':
 *         description: Asset category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "AssetCategory updated successfully"
 *       '400':
 *         description: Bad request (Validation Errors)
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
 *               InvalidField:
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorInfo: null
 *               ExceedsLimit:
 *                 value:
 *                   message: "Failed! defaultDocumentNames should not exceed 50 items"
 *                   errorInfo: null
 *               Duplicate:
 *                 value:
 *                   message: "Failed! name already exists in the server"
 *                   errorInfo: null
 *               MissingField:
 *                 value:
 *                   message: "Failed! businessUnit is required"
 *                   errorInfo: null
 *               InvalidArray:
 *                 value:
 *                   message: "Failed! personalProtectiveEquipments contains invalid IDs"
 *                   errorInfo:
 *                     invalidIds: ["ppe_invalid"]
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
 *         description: Asset category not found
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
 *               message: "AssetCategory not found"
 *               errorInfo: null
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
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/asset-categories/bulk-delete:
 *   delete:
 *     summary: Bulk delete asset categories
 *     tags:
 *       - Asset Category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assetCategoriesToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of asset category IDs to delete (max 1000 items, must be valid, unique, and existing)
 *           example:
 *             assetCategoriesToDelete: ["60b8d295f1d2c00015b8d73b", "60b8d295f1d2c00015b8d73c"]
 *     responses:
 *       '200':
 *         description: Asset categories deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "AssetCategories deleted successfully"
 *       '400':
 *         description: Bad request (Validation Errors)
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
 *               MissingField:
 *                 value:
 *                   message: "Failed! assetCategoriesToDelete is required"
 *                   errorInfo: null
 *               InvalidArray:
 *                 value:
 *                   message: "Failed! assetCategoriesToDelete contains invalid IDs"
 *                   errorInfo:
 *                     invalidIds: ["invalid_id1", "invalid_id2"]
 *               Duplicate:
 *                 value:
 *                   message: "Failed! Duplicate IDs found in assetCategoriesToDelete"
 *                   errorInfo:
 *                     duplicateIds: ["60b8d295f1d2c00015b8d73b"]
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
 *         description: Some asset categories not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             example:
 *               message: "Some asset categories not found"
 *               errorInfo:
 *                 missingIds: ["60b8d295f1d2c00015b8d73d"]
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
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/asset-categories:
 *   get:
 *     summary: Fetch asset categories
 *     tags:
 *       - Asset Category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter asset categories by name
 *     responses:
 *       '200':
 *         description: Asset categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *             example:
 *               message: "AssetCategories fetched successfully"
 *               data: [{ "id": "60b8d295f1d2c00015b8d73b", "name": "Category 1" }]
 *       '400':
 *         description: Bad request (Validation Errors)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             example:
 *               message: "Invalid request parameters"
 *               errorInfo: { "name": "Must be a string" }
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
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/asset-categories/{assetCategory}:
 *   get:
 *     summary: Fetch a specific asset category
 *     tags:
 *       - Asset Category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetCategory
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the asset category to fetch
 *     responses:
 *       '200':
 *         description: Asset category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     defaultDocumentNames:
 *                       type: array
 *                       items:
 *                         type: string
 *                     personalProtectiveEquipments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           image:
 *                             type: string
 *                     businessUnit:
 *                       type: string
 *             example:
 *               message: "AssetCategory fetched successfully"
 *               data:
 *                 id: "60b8d295f1d2c00015b8d73b"
 *                 name: "Category 1"
 *                 defaultDocumentNames: ["Document1", "Document2"]
 *                 personalProtectiveEquipments: [{"image": "image_url"}]
 *                 businessUnit: "Business Unit 1"
 *       '400':
 *         description: Bad request (Validation Errors)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             example:
 *               message: "AssetCategory id must be a non-empty string in req.params or req.body"
 *               errorInfo: null
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
 *         description: Asset category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: object
 *             example:
 *               message: "Failed! AssetCategory does not exist"
 *               errorInfo: null
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
 *                   type: object
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

