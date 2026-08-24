/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/spareRequested:
 *   post:
 *     summary: Request a spare for a work order
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Create a spare request (part required) for a specific work order.
 *
 *       Middleware ensures:
 *       - User authentication.
 *       - Business unit identity is valid.
 *       - Work order exists and is valid.
 *       - Spare exists.
 *       - Requested quantity does not exceed available stock.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the work order for which spare is requested
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spare:
 *                 type: string
 *                 example: "670f8c3f82bdc5a1e4d95555"
 *               requestedQuantity:
 *                 type: number
 *                 example: 3
 *               remarks:
 *                 type: string
 *                 example: "Spare required for motor repair"
 *
 *     responses:
 *       '201':
 *         description: Spare requested successfully
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
 *                   example: "Spares requested successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6710ffe123f2340a9e45cd88"
 *
 *       '400':
 *         description: Validation error or invalid spare quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please Provide the requestedQuantity lesser than Quantity."
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
 *         description: Spare or work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Work order not found."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/spareRequested:
 *   get:
 *     summary: Get all spare requests for a work order
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Fetch the list of spare requests (parts required) for a specific work order.
 *
 *       Middleware ensures:
 *       - User authentication.
 *       - Valid business unit.
 *       - Work order existence.
 *
 *       Supports searching by spare name or specification.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the work order
 *
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by spare name or specification
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *
 *     responses:
 *       '200':
 *         description: Spare requests retrieved successfully
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
 *                   example: "Spare requests fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "671100aa35b1a705df6c2001"
 *                       spare:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "670f8c3f82bdc5a1e4d95555"
 *                           name:
 *                             type: string
 *                             example: "Motor Bearing - 6205 ZZ"
 *                           quantity:
 *                             type: number
 *                             example: 25
 *                           units:
 *                             type: string
 *                             example: "nos"
 *                       requestedQuantity:
 *                         type: number
 *                         example: 3
 *                       utilisedCount:
 *                         type: number
 *                         example: 0
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       remarks:
 *                         type: string
 *                         example: "Required for maintenance"
 *                       workOrder:
 *                         type: string
 *                         example: "670fabcd82bdc5a1e4d91111"
 *                       createdBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d92222"
 *                       updatedBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d92222"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T12:05:22.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T12:05:22.000Z"
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
 *         description: Work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Work order not found."
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
 * /api/v1/workOrders/{workOrder}/spareReplaced:
 *   post:
 *     summary: Add replaced spare for a work order
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Creates a spare replaced entry for the given work order.
 *
 *       Middleware ensures:
 *       - User authentication.
 *       - Valid business unit.
 *       - Work order validation.
 *       - Spare validation.
 *       - Check if the spare was previously requested.
 *       - Validate replaced quantity against requested & available quantity.
 *       - Validate uploaded files (type & size).
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the work order
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               spare:
 *                 type: string
 *                 description: ID of the spare being replaced
 *                 example: "670f8c3f82bdc5a1e4d95555"
 *               replacedQuantity:
 *                 type: number
 *                 description: Quantity being replaced
 *                 example: 2
 *               remarks:
 *                 type: string
 *                 description: Remarks for the replacement
 *                 example: "Bearing replaced during PM"
 *               files:
 *                 type: array
 *                 description: Upload supporting documents or images
 *                 items:
 *                   type: string
 *                   format: binary
 *
 *     responses:
 *       '201':
 *         description: Spare replaced entry created successfully
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
 *                   example: "Spare replaced successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67110abc35b1a705df6c2111"
 *
 *       '400':
 *         description: Validation or bad input error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: string
 *             examples:
 *               QuantityExceeded:
 *                 value:
 *                   message: "Replaced quantity cannot exceed requested quantity."
 *                   errorInfo: null
 *               SpareNotRequested:
 *                 value:
 *                   message: "This spare was not requested for this work order."
 *                   errorInfo: null
 *               FileError:
 *                 value:
 *                   message: "Invalid file type or size."
 *                   errorInfo: null
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
 *
 *       '404':
 *         description: Work order or spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Work order not found."
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
 * /api/v1/workOrders/{workOrder}/spareReplaced:
 *   get:
 *     summary: Get all replaced spares for a work order
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Fetch the list of spares that were replaced under a specific work order.
 *
 *       Middleware ensures:
 *       - User authentication.
 *       - Valid business unit.
 *       - Work order existence and validation.
 *
 *       Supports searching by spare name or specification.
 *
 *     security:
 *       - BearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work order ID
 *
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by spare name or specification (supports partial match)
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *
 *     responses:
 *       '200':
 *         description: Spare replacements retrieved successfully
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
 *                   example: "Spare replacements fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "67110abc35b1a705df6c2200"
 *
 *                       spare:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "670f8c3f82bdc5a1e4d95555"
 *                           name:
 *                             type: string
 *                             example: "Motor Bearing - 6205 ZZ"
 *                           quantity:
 *                             type: number
 *                             example: 25
 *                           units:
 *                             type: string
 *                             example: "nos"
 *
 *                       replacedQuantity:
 *                         type: number
 *                         example: 2
 *
 *                       remarks:
 *                         type: string
 *                         example: "Replaced during PM activity"
 *
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "6711imgc35b1a705df6c2222"
 *                             url:
 *                               type: string
 *                               example: "https://example.com/files/abc.jpg"
 *                             name:
 *                               type: string
 *                               example: "bearing-old.jpg"
 *
 *                       spareRequested:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "671100aa35b1a705df6c2001"
 *                           requestedQuantity:
 *                             type: number
 *                             example: 3
 *
 *                       workOrder:
 *                         type: string
 *                         example: "670fabcd82bdc5a1e4d91111"
 *
 *                       createdBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d92222"
 *
 *                       updatedBy:
 *                         type: string
 *                         example: "670f8c3f82bdc5a1e4d92222"
 *
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T12:05:22.000Z"
 *
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T12:05:22.000Z"
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
 *
 *       '404':
 *         description: Work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Work order not found."
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
 * /api/v1/workOrders/{workOrder}/consumables:
 *   post:
 *     summary: Create Work Order Consumable Request
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Create Consumable request.
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
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consumables:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     consumable:
 *                       type: string
 *                       description: Consumable ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity of consumable used
 *           example:
 *             consumables:
 *               - consumable: "60b8d295f1d2c00015b8d73b"
 *                 quantity: 3
 *     responses:
 *       '201':
 *         description: Consumable requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *             example:
 *               id: "60b8d295f1d2c00015b8d73b"
 *       '400':
 *         description: Client side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingConsumables:
 *                 value:
 *                   message: "The consumables field must be an array of objects"
 *               InvalidArrayElements:
 *                 value:
 *                   message: "Each element in the array should be an object"
 *               InvalidWorkOrderId:
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               WorkOrderNotFound:
 *                 value:
 *                   message: "Failed! WorkOrder does not exist"
 *               SpareNotFound:
 *                 value:
 *                   message: "Provide correct spareId(s) for work order."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Some internal server error"
 */

/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/toolsRequired:
 *   post:
 *     summary: Create Work Order Tool Required Request
 *     tags:
 *       - WorkOrderPartRequirement
 *     description: |
 *       Create work order tool required request 
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
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toolsRequired:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tool:
 *                       type: string
 *                       description: Tool ID
 *                     quantity:
 *                       type: number
 *                       description: Quantity of tools required
 *           example:
 *             toolsRequired:
 *               - tool: "60b8d295f1d2c00015b8d73b"
 *                 quantity: 2
 *     responses:
 *       '201':
 *         description: ToolRequired requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *             example:
 *               id: "60b8d295f1d2c00015b8d73b"
 *       '400':
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingToolsRequired:
 *                 value:
 *                   message: "The toolsRequired field must be an array of objects"
 *               InvalidArrayElements:
 *                 value:
 *                   message: "Each element in the array should be an object"
 *               InvalidWorkOrderId:
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *               MissingWorkOrderId:
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *       '401':
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found - Resource does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               WorkOrderNotFound:
 *                 value:
 *                   message: "Failed! WorkOrder does not exist"
 *               ToolNotFound:
 *                 value:
 *                   message: "Provide correct toolId(s) for work order."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Some internal server error"
 */

