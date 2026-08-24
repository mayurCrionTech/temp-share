/**
 * @swagger
 * /api/v1/workorders/{workOrders}/requestExtension:
 *   post:
 *     summary: Request a due date extension for a work order
 *     tags:
 *       - WorkOrderDueDate 
 *     description: |
 *       Request  a due date extension
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
 *               workOrder:
 *                 type: string
 *                 description: The ID of the work order
 *               reason:
 *                 type: string
 *                 description: Reason for due date extension
 *               requestedDate:
 *                 type: string
 *                 format: date
 *                 description: The new requested due date
 *             required:
 *               - workOrder
 *               - reason
 *               - requestedDate
 *     responses:
 *       '201':
 *         description: Due date requested successfully
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
 *             example:
 *               message: "DueDate requested successfully"
 *               data:
 *                 id: "605c72e8a1d3c8279c204e11"
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
 *               message: "Invalid requestedDate. Please provide a valid date."
 *               errorInfo: null
 *       '404':
 *         description: Work Order not found
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
 *               message: "Failed! WorkOrder does not exist"
 *               errorInfo: null
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
 * /api/v1/work-orders/{workOrders}/approveExtension:
 *   patch:
 *     summary: Approve a due date extension request for a work order
 *     tags:
 *       - WorkOrderDueDate
 *     description: |
 *       Approve a dure date extension request.
 *       
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
 *                 description: The ID of the due date request
 *               approvedBy:
 *                 type: string
 *                 description: The ID of the approver
 *           example:
 *             id: "60b8d295f1d2c00015b8d73b"
 *             approvedBy: "60b8d295f1d2c00015b8d74a"
 *     responses:
 *       '200':
 *         description: Due date approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "DueDate approved successfully"
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
 *               InvalidWorkOrderId:
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
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
 *       '404':
 *         description: Work order not found
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
 *               message: "Failed! WorkOrder does not exist"
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
 * /api/v1/workorders/{workOrder}/requestExtension:
 *   get:
 *     summary: Fetch due date extension requests for a work order
 *     tags:
 *       - WorkOrderDueDate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the work order to fetch due date requests for
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
 *     responses:
 *       '200':
 *         description: Due date requests fetched successfully
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
 *             example:
 *               message: "DueDateRequest fetched successfully"
 *               data: []
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
 *               MissingWorkOrder:
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
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
 *       '404':
 *         description: Work order not found
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
 *               message: "Failed! WorkOrder does not exist"
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

