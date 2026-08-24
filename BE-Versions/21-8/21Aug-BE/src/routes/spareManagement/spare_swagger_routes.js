/**
 * @swagger
 * /api/v1/spares:
 *   post:
 *     summary: Create a new spare
 *     tags:
 *       - Spare
 *     description: |
 *       Create a new spare item.
 *
 *       *Internally Populated Fields:*
 *
 *       | Field         | Source                           |
 *       |---------------|----------------------------------|
 *       | businessUnit  | Extracted from token              |
 *       | createdBy     | Automatically set from logged-in user |
 *       | updatedBy     | Automatically set from logged-in user |
 *
 *       These fields should **not** be sent in the request body.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: If true, the spare will be saved as a draft and strict validations will be skipped.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specification:
 *                 type: string
 *               description:
 *                 type: string
 *               partNumber:
 *                 type: string
 *               quantity:
 *                 type: number
 *               minimumRequiredQuantity:
 *                 type: number
 *               units:
 *                 type: string
 *                 enum: ["pieces", "liters", "meters", "kilograms"]
 *               cost:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               approver:
 *                 type: string
 *               category:
 *                 type: string
 *               isSupplierDetails:
 *                 type: boolean
 *               supplierDetails:
 *                 type: object
 *                 additionalProperties: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *               - specification
 *               - quantity
 *               - minimumRequiredQuantity
 *               - units
 *               - approver
 *     responses:
 *       '201':
 *         description: Spare created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare created successfully
 *                 result:
 *                   type: object
 *                   example:
 *                     _id: "67108fbe35b1a705df6c2a49"
 *                     name: "Pressure Sensor"
 *                     status: "pendingForApproval"
 *                     quantity: 50
 *                     units: "pieces"
 *                     approver: "67108fbe35b1a705df6c2a49"
 *                     images: ["67108fbe35b1a705df6c2a49"]
 *       '400':
 *         description: Validation error (Client Error)
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
 *               DuplicateSpare:
 *                 summary: Duplicate Spare Name or Specification
 *                 value:
 *                   message: "Duplicate Spare Name : Pressure Sensor"
 *                   errorInfo: null
 *               InvalidUnits:
 *                 summary: Invalid Units
 *                 value:
 *                   message: "Units must be one of: pieces, liters, meters, kilograms"
 *                   errorInfo: null
 *               InvalidImage:
 *                 summary: Invalid Image ID
 *                 value:
 *                   message: "Invalid image. File id is not a spare file."
 *                   errorInfo: null
 *               MissingFields:
 *                 summary: Required Fields Missing
 *                 value:
 *                   message: "Required fields: name, specification, quantity, minimumRequiredQuantity, units, approver"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized access (Missing or invalid token)
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
 *                   example: Some internal server error.
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/spares/{spareId}:
 *   patch:
 *     summary: Update an existing spare
 *     tags:
 *       - Spare
 *     description: |
 *       Update an existing spare item.
 *
 *       *Internally Managed Fields (Do Not Send):*
 *
 *       | Field        | Source                                |
 *       |--------------|----------------------------------------|
 *       | updatedBy    | Automatically set from logged-in user  |
 *
 *       Only the fields sent in the request body will be updated.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare to update.
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: If true, spare will be updated as draft and strict validations will be skipped.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide only the fields you want to update.
 *             properties:
 *               name:
 *                 type: string
 *               specification:
 *                 type: string
 *               description:
 *                 type: string
 *               partNumber:
 *                 type: string
 *               quantity:
 *                 type: number
 *               minimumRequiredQuantity:
 *                 type: number
 *               units:
 *                 type: string
 *                 enum: ["pieces", "liters", "meters", "kilograms"]
 *               cost:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               isSupplierDetails:
 *                 type: boolean
 *               supplierDetails:
 *                 type: object
 *                 additionalProperties: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Spare updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare updated successfully
 *                 result:
 *                   type: object
 *                   example:
 *                     _id: "67108fbe35b1a705df6c2a49"
 *                     name: "Updated Sensor"
 *                     status: "pendingForApproval"
 *                     quantity: 60
 *                     units: "pieces"
 *                     images: ["67108fbe35b1a705df6c2a49"]
 *       '400':
 *         description: Validation error (Client Error)
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
 *               DuplicateSpare:
 *                 summary: Duplicate Spare Name
 *                 value:
 *                   message: "Duplicate Spare Name : Pressure Sensor"
 *                   errorInfo: null
 *               InvalidImage:
 *                 summary: Invalid Image File
 *                 value:
 *                   message: "Invalid image. File id is not a spare file."
 *                   errorInfo: null
 *               InvalidUnits:
 *                 summary: Invalid Units
 *                 value:
 *                   message: "Units must be one of: pieces, liters, meters, kilograms"
 *                   errorInfo: null
 *               InvalidFields:
 *                 summary: Invalid Field Values
 *                 value:
 *                   message: "Some provided fields failed validation."
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *       '404':
 *         description: Spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare not found
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
 * /api/v1/spares:
 *   get:
 *     summary: Fetch list of spares
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve all spares with optional filtering, searching, and pagination.
 *
 *       *Validated Fields (via Middleware):*
 *
 *       | Field   | Description                 |
 *       |---------|-----------------------------|
 *       | status  | Validated using middleware. |
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter spares by status.
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for spare name or code.
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page.
 *
 *     responses:
 *       '200':
 *         description: Spares fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "679bd39c8dff882b6f093f41"
 *                       name:
 *                         type: string
 *                         example: "Bearing"
 *                       code:
 *                         type: string
 *                         example: "SP-001"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       quantity:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                             example: 50
 *                           type:
 *                             type: string
 *                             example: "units"
 *
 *       '400':
 *         description: Invalid request or validation error (e.g., invalid status)
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
 *               InvalidStatus:
 *                 summary: Invalid Status Filter
 *                 value:
 *                   message: "Invalid status value provided."
 *                   errorInfo: null
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
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
 * /api/v1/spares:
 *   delete:
 *     summary: Delete multiple spares
 *     tags:
 *       - Spare
 *     description: |
 *       Delete one or more spare items by providing their IDs in the request body.
 *
 *       *Validated Fields (via Middleware):*
 *
 *       | Field     | Description                                |
 *       |-----------|--------------------------------------------|
 *       | spareIds  | Validated by middleware to ensure all IDs exist |
 *
 *     security:
 *       - BearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spareIds:
 *                 type: array
 *                 description: Array of spare IDs to delete
 *                 items:
 *                   type: string
 *             required:
 *               - spareIds
 *           example:
 *             spareIds: ["67108fbe35b1a705df6c2a49", "67108fbe35b1a705df6c2a50"]
 *
 *     responses:
 *       '200':
 *         description: Spares deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares deleted successfully
 *                 deletedCount:
 *                   type: number
 *                   example: 2
 *
 *       '400':
 *         description: Validation error (Client Error)
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
 *               MissingIDs:
 *                 summary: Missing spareIds field
 *                 value:
 *                   message: "The field 'spareIds' is required."
 *                   errorInfo: null
 *               InvalidIDs:
 *                 summary: Invalid or non-existing spare IDs
 *                 value:
 *                   message: "Invalid spare IDs provided."
 *                   errorInfo: null
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
 *       '404':
 *         description: No spares found for given IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No spares found for the provided IDs.
 *                 errorInfo:
 *                   type: null
 *
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
 * /api/v1/spares/count:
 *   get:
 *     summary: Get spare count by status
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve the total count of spares grouped by their status.
 *
 *       This API returns summary counts such as:
 *       - Active spares
 *       - Inactive spares
 *       - Draft spares
 *       - Pending for approval
 *
 *       No input parameters are required.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     responses:
 *       '200':
 *         description: Spare counts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare count fetched successfully
 *                 result:
 *                   type: object
 *                   example:
 *                     active: 12
 *                     inactive: 4
 *                     pendingForApproval: 3
 *                     draft: 7
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
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
 * /api/v1/spares/quantities:
 *   get:
 *     summary: Fetch spare quantity details
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve quantity and stock-related details for all spares.
 *
 *       Supports pagination, sorting, and filtering by spare name.
 *
 *       *Optional Query Parameters:*
 *
 *       | Parameter | Type   | Description                          |
 *       |-----------|--------|--------------------------------------|
 *       | name      | string | Filters spares by name (case-insensitive) |
 *       | page      | number | Page number for pagination           |
 *       | limit     | number | Records per page                     |
 *       | sortBy    | string | Field to sort by                     |
 *       | sortOrder | string | "asc" or "desc"                      |
 *
 *     security:
 *       - BearerAuth: []
 *
 *     responses:
 *       '200':
 *         description: Spare quantities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 totalRecords:
 *                   type: number
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "67108fbe35b1a705df6c2a49"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       quantity:
 *                         type: number
 *                         example: 120
 *                       units:
 *                         type: string
 *                         example: "pieces"
 *                       cost:
 *                         type: number
 *                         example: 450
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *                         example: "2025-12-31"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-24T10:15:30.000Z"
 *                       spare:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "67108fbe35b1a705df6c2a49"
 *                           name:
 *                             type: string
 *                             description: Combined (name - specification)
 *                             example: "Pressure Sensor - High Accuracy"
 *                           quantity:
 *                             type: number
 *                             example: 300
 *                           units:
 *                             type: string
 *                             example: "pieces"
 *                           approver:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "670f8c3f82bdc5a1e4d9a0f2"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john.doe@example.com"
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
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
 * /api/v1/spares/spareRequested:
 *   get:
 *     summary: Fetch spare request details
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve all spare requests with spare details, requested quantities, approver info, and request metadata.
 *
 *       Supports pagination, sorting, filtering by spare name, and approver-based filtering.
 *
 *       *Optional Query Parameters:*
 *
 *       | Parameter | Type   | Description                                      |
 *       |-----------|--------|--------------------------------------------------|
 *       | name      | string | Filters by spare name or specification           |
 *       | page      | number | Page number for pagination                       |
 *       | limit     | number | Records per page                                 |
 *       | sortBy    | string | Field to sort by                                 |
 *       | sortOrder | string | "asc" or "desc"                                  |
 *
 *     security:
 *       - BearerAuth: []
 *
 *     responses:
 *       '200':
 *         description: Spare requested list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 totalPages:
 *                   type: number
 *                   example: 5
 *                 totalRecords:
 *                   type: number
 *                   example: 42
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "67109bce21a4c902df6c2d12"
 *                       spare:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "67108fbe35b1a705df6c2a49"
 *                           name:
 *                             type: string
 *                             description: Combined spare name and specification
 *                             example: "Bearing - 6205 ZZ"
 *                           quantity:
 *                             type: number
 *                             example: 300
 *                           units:
 *                             type: string
 *                             example: "pieces"
 *                           approver:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "670f8c3f82bdc5a1e4d9a0f2"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john.doe@example.com"
 *                       requestedQuantity:
 *                         type: number
 *                         example: 10
 *                       utilisedCount:
 *                         type: number
 *                         example: 2
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       remarks:
 *                         type: string
 *                         example: "Required for urgent repair"
 *                       workOrder:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d91234"
 *                       createdBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d93456"
 *                       updatedBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d96789"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-24T10:15:30.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-25T12:30:10.000Z"
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
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
 * /api/v1/spares/spareReplaced:
 *   get:
 *     summary: Fetch spare replaced details
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve all replaced spare records with spare details, replaced quantity,
 *       linked requested spare info, and work order metadata.
 *
 *       Supports pagination, sorting, filtering by spare name or specification,
 *       and approver/creator–based filtering.
 *
 *       *Optional Query Parameters:*
 *
 *       | Parameter | Type   | Description                                      |
 *       |-----------|--------|--------------------------------------------------|
 *       | name      | string | Filters by spare name or specification           |
 *       | page      | number | Page number for pagination                       |
 *       | limit     | number | Records per page                                 |
 *       | sortBy    | string | Field to sort by                                 |
 *       | sortOrder | string | "asc" or "desc"                                  |
 *
 *     security:
 *       - BearerAuth: []
 *
 *     responses:
 *       '200':
 *         description: Spare replaced list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 totalPages:
 *                   type: number
 *                   example: 3
 *                 totalRecords:
 *                   type: number
 *                   example: 18
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "6710acbe21a4c902df6c2181"
 *                       spare:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "67108fbe35b1a705df6c2a49"
 *                           name:
 *                             type: string
 *                             description: Combined (name - specification)
 *                             example: "Motor Bearing - 6205 ZZ"
 *                           quantity:
 *                             type: number
 *                             example: 300
 *                           units:
 *                             type: string
 *                             example: "pieces"
 *                       replacedQuantity:
 *                         type: number
 *                         example: 4
 *                       remarks:
 *                         type: string
 *                         example: "Replaced during preventive maintenance"
 *                       spareRequested:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6710a9e135b1a705df6c2b99"
 *                           requestedQuantity:
 *                             type: number
 *                             example: 6
 *                       workOrder:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d91234"
 *                       createdBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d90001"
 *                       updatedBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d90002"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-24T10:15:30.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-25T12:30:10.000Z"
 *
 *       '401':
 *         description: Unauthorized (Missing or invalid token)
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
 *
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
 * /api/v1/spares/{spareId}:
 *   get:
 *     summary: Fetch detailed spare information
 *     tags:
 *       - Spare
 *     description: |
 *       Retrieve full details of a specific spare, including creator, approver,
 *       asset link, supplier details, images, and quantity information.
 *
 *       The spare name returned is a combined string: **name - specification**.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare to fetch
 *
 *     responses:
 *       '200':
 *         description: Spare details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "67108fbe35b1a705df6c2a49"
 *                 name:
 *                   type: string
 *                   description: Combined name (name - specification)
 *                   example: "Motor Bearing - 6205 ZZ"
 *                 description:
 *                   type: string
 *                   example: "High-quality deep groove bearing"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 partNumber:
 *                   type: string
 *                   example: "BR-6205-ZZ-IND"
 *                 asset:
 *                   type: string
 *                   example: "670f8c3f82bdc5a1e4d95555"
 *                 quantity:
 *                   type: number
 *                   example: 125
 *                 units:
 *                   type: string
 *                   example: "pieces"
 *                 recommendedQuantity:
 *                   type: number
 *                   example: 200
 *                 minimumRequiredQuantity:
 *                   type: number
 *                   example: 50
 *                 cost:
 *                   type: number
 *                   example: 450
 *                 expiryDate:
 *                   type: string
 *                   format: date
 *                   example: "2026-05-30"
 *                 category:
 *                   type: string
 *                   example: "Mechanical"
 *                 isSupplierDetails:
 *                   type: boolean
 *                   example: true
 *                 supplierDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "ABC Industrial Suppliers"
 *                       contact:
 *                         type: string
 *                         example: "+91-9876543210"
 *                       address:
 *                         type: string
 *                         example: "Chennai, Tamil Nadu"
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         example: "https://example.com/uploads/spare.jpg"
 *                       name:
 *                         type: string
 *                         example: "bearing.jpg"
 *                 approver:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d9a0f2"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                 createdBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     name:
 *                       type: string
 *                       example: "Admin User"
 *                 updatedBy:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d92222"
 *                     name:
 *                       type: string
 *                       example: "Maintenance Manager"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-02-24T10:15:30.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-01T15:42:10.000Z"
 *
 *       '400':
 *         description: Invalid spareId or spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid spareId or spare not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/{spareId}/approve:
 *   patch:
 *     summary: Approve a spare
 *     tags:
 *       - Spare
 *     description: |
 *       Approve a spare that is currently in **Pending** status.
 *       Middleware ensures the spare exists and the status is valid for approval.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare to approve
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Approval granted after verification"
 *
 *     responses:
 *       '200':
 *         description: Spare approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare approved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67108fbe35b1a705df6c2a49"
 *                     status:
 *                       type: string
 *                       example: "Approved"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T10:45:22.000Z"
 *
 *       '400':
 *         description: Validation error – spare cannot be approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare status is not valid for approval."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – invalid or missing token
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
 *
 *       '404':
 *         description: Spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/quantities/{quantityId}/approve:
 *   patch:
 *     summary: Approve spare quantity update request
 *     tags:
 *       - Spare Quantities
 *     description: |
 *       Approves a pending spare quantity update request.
 *       Middleware ensures the quantity record exists and is in a valid
 *       status for approval.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: quantityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare quantity record to approve
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Approved after verifying stock update"
 *
 *     responses:
 *       '200':
 *         description: Spare quantity approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare quantity approved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67219fbe35b1a705df6c2b77"
 *                     spare:
 *                       type: string
 *                       example: "67108fbe35b1a705df6c2a49"
 *                     updatedQuantity:
 *                       type: number
 *                       example: 40
 *                     status:
 *                       type: string
 *                       example: "Approved"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T12:22:18.000Z"
 *
 *       '400':
 *         description: Validation error – quantity cannot be approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quantity status is not valid for approval."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Quantity record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare quantity record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/quantities/{quantityId}/reject:
 *   patch:
 *     summary: Reject spare quantity update request
 *     tags:
 *       - Spare Quantities
 *     description: |
 *       Rejects a pending spare quantity update request.
 *       Middleware ensures the quantity record exists and is in a valid
 *       status for rejection.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: quantityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare quantity record to reject
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Rejected due to incorrect stock update request"
 *
 *     responses:
 *       '200':
 *         description: Spare quantity rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare quantity update request rejected successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67219fbe35b1a705df6c2b77"
 *                     spare:
 *                       type: string
 *                       example: "67108fbe35b1a705df6c2a49"
 *                     updatedQuantity:
 *                       type: number
 *                       example: 40
 *                     status:
 *                       type: string
 *                       example: "Rejected"
 *                     remarks:
 *                       type: string
 *                       example: "Rejected due to incorrect stock update request"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T12:22:18.000Z"
 *
 *       '400':
 *         description: Validation error – quantity cannot be rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quantity status is not valid for rejection."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Quantity record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare quantity record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/{spareId}/reject:
 *   patch:
 *     summary: Reject a spare
 *     tags:
 *       - Spare
 *     description: |
 *       Reject a spare that is pending approval.
 *
 *       Middleware ensures:
 *       - The spare exists.
 *       - The spare status is valid for rejection.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare to reject
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Rejected due to incorrect spare details"
 *
 *     responses:
 *       '200':
 *         description: Spare rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare rejected successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67108fbe35b1a705df6c2a49"
 *                     name:
 *                       type: string
 *                       example: "Motor Bearing - 6205 ZZ"
 *                     status:
 *                       type: string
 *                       example: "Rejected"
 *                     remarks:
 *                       type: string
 *                       example: "Rejected due to incorrect spare details"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T10:45:30.000Z"
 *
 *       '400':
 *         description: Spare cannot be rejected due to invalid status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare status is not valid for rejection."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/quantities:
 *   post:
 *     summary: Add quantity for a spare
 *     tags:
 *       - Spare Quantities
 *     description: |
 *       Add a new spare quantity entry.
 *
 *       Middleware ensures:
 *       - The spare exists.
 *       - The request body fields are valid.
 *       - Quantity is created with status **pendingForApproval**.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 20
 *               units:
 *                 type: string
 *                 example: "nos"
 *               cost:
 *                 type: number
 *                 example: 1500
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-15"
 *
 *     responses:
 *       '201':
 *         description: Spare quantity added successfully (pending approval)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare quantity added successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67109abc12de450abc671234"
 *                     quantity:
 *                       type: number
 *                       example: 20
 *                     units:
 *                       type: string
 *                       example: "nos"
 *                     cost:
 *                       type: number
 *                       example: 1500
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2026-01-15"
 *                     status:
 *                       type: string
 *                       example: "pendingForApproval"
 *                     createdBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d93333"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T09:30:15.000Z"
 *
 *       '400':
 *         description: Validation failed or spare cannot accept quantity addition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid quantity value."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/quantities/{quantityId}:
 *   patch:
 *     summary: Update spare quantity details
 *     tags:
 *       - Spare Quantities
 *     description: |
 *       Update an existing spare quantity record.
 *
 *       Middleware ensures:
 *       - The quantity entry exists.
 *       - The parent spare exists.
 *       - The update request fields are valid.
 *       - Updated quantity is marked as **pendingForApproval**.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: quantityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare quantity record to update
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 40
 *               units:
 *                 type: string
 *                 example: "nos"
 *               cost:
 *                 type: number
 *                 example: 1800
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-10"
 *
 *     responses:
 *       '200':
 *         description: Spare quantity updated successfully (pending approval)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare quantity updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67109abc12de450abc671234"
 *                     quantity:
 *                       type: number
 *                       example: 40
 *                     units:
 *                       type: string
 *                       example: "nos"
 *                     cost:
 *                       type: number
 *                       example: 1800
 *                     expiryDate:
 *                       type: string
 *                       format: date
 *                       example: "2026-02-10"
 *                     status:
 *                       type: string
 *                       example: "pendingForApproval"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d93333"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T11:22:45.000Z"
 *
 *       '400':
 *         description: Validation error in update request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid quantity value."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare or quantity record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare quantity not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/spareRequested/{spareRequestedId}/approve:
 *   patch:
 *     summary: Approve a spare request for a work order
 *     tags:
 *       - Spare Requested
 *     description: |
 *       Approve a work order spare requirement request.
 *
 *       Middleware ensures:
 *       - The requested spare entry exists.
 *       - The status is valid for approval.
 *       - The requested quantity does not exceed available stock.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareRequestedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare request to approve
 *
 *     responses:
 *       '200':
 *         description: Spare request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare request approved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6710abc123f2340a9e45cd12"
 *                     spare:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d95555"
 *                     requestedQuantity:
 *                       type: number
 *                       example: 5
 *                     approvedQuantity:
 *                       type: number
 *                       example: 5
 *                     status:
 *                       type: string
 *                       example: "approved"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T12:20:45.000Z"
 *
 *       '400':
 *         description: Validation error or insufficient spare quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Requested quantity (10) exceeds available quantity (4)."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare request entry not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Requested spare record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/spareRequested/{spareRequestedId}/reject:
 *   patch:
 *     summary: Reject a spare request for a work order
 *     tags:
 *       - Spare Requested
 *     description: |
 *       Reject a work order spare requirement request.
 *
 *       Middleware ensures:
 *       - The requested spare entry exists.
 *       - The status is valid for rejection.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareRequestedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare request to reject
 *
 *     responses:
 *       '200':
 *         description: Spare request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare request rejected successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6710abc123f2340a9e45cd12"
 *                     spare:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d95555"
 *                     requestedQuantity:
 *                       type: number
 *                       example: 5
 *                     status:
 *                       type: string
 *                       example: "rejected"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T12:45:20.000Z"
 *
 *       '400':
 *         description: Validation error – invalid status for rejection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare request cannot be rejected in its current status."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare request entry not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Requested spare record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/spareReplaced/{spareReplacedId}:
 *   patch:
 *     summary: Update details of a spare replaced in a work order
 *     tags:
 *       - Spare Replaced
 *     description: |
 *       Edit or update the spare replaced details for a work order.
 *
 *       Middleware ensures:
 *       - The spare replaced entry exists.
 *       - The referenced spare exists.
 *       - The spare requirement entry is valid.
 *       - The associated work order exists and is valid.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareReplacedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare replaced entry to edit
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *               cost:
 *                 type: number
 *                 example: 450
 *               units:
 *                 type: string
 *                 example: "nos"
 *               remarks:
 *                 type: string
 *                 example: "Updated after technician verification"
 *
 *     responses:
 *       '200':
 *         description: Spare replaced details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare replaced details updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6710abc123f2340a9e45cd77"
 *                     spare:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d95555"
 *                     quantity:
 *                       type: number
 *                       example: 3
 *                     units:
 *                       type: string
 *                       example: "nos"
 *                     cost:
 *                       type: number
 *                       example: 450
 *                     remarks:
 *                       type: string
 *                       example: "Updated after technician verification"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T13:20:45.000Z"
 *
 *       '400':
 *         description: Validation error in payload fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid quantity provided."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare replaced entry or spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare replaced record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/spares/spareReplaced/{spareReplacedId}/return:
 *   patch:
 *     summary: Return a quantity of a replaced spare back to stock
 *     tags:
 *       - Spare Replaced
 *     description: |
 *       Return part of the replaced spare quantity back to inventory.
 *
 *       Middleware ensures:
 *       - The spare replaced entry exists.
 *       - The return quantity is valid and does not exceed the replaced quantity.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: spareReplacedId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare replaced entry to return quantity from
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnQuantity:
 *                 type: number
 *                 example: 2
 *               remarks:
 *                 type: string
 *                 example: "Returned as excess material"
 *
 *     responses:
 *       '200':
 *         description: Spare replaced quantity returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Spare replaced quantity returned successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6710abc123f2340a9e45cd77"
 *                     spare:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d95555"
 *                     returnedQuantity:
 *                       type: number
 *                       example: 2
 *                     remainingQuantity:
 *                       type: number
 *                       example: 3
 *                     remarks:
 *                       type: string
 *                       example: "Returned as excess material"
 *                     updatedBy:
 *                       type: string
 *                       example: "670f8c3f82bdc5a1e4d91111"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-14T15:10:30.000Z"
 *
 *       '400':
 *         description: Invalid return quantity or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Return quantity cannot exceed replaced quantity."
 *                 errorInfo:
 *                   type: null
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
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
 *
 *       '404':
 *         description: Spare replaced entry not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spare replaced record not found."
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */
