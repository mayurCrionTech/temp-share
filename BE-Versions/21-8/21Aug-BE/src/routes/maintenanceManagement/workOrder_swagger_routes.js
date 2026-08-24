/**
 * @swagger
 * /api/v1/workOrders:
 *   post:
 *     summary: Create a new work order
 *     description: |
 *       This endpoint is to create a work order.
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
 *       - Work Orders
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
 *                 example: "Routine Checkup"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a27e7f7b369e3b5e258"]
 *               priority:
 *                 type: string
 *                 example: "High"
 *               asset:
 *                 type: string
 *                 example: "669a1a28e7f7b369e3b5e260"
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-19T07:10:56.064Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-20T07:10:56.064Z"
 *               estimatedDays:
 *                 type: integer
 *                 example: 2
 *               estimatedHours:
 *                 type: integer
 *                 example: 5
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6682640ace2038006d1892c2"]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a27e7f7b369e3b5e258"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a27e7f7b369e3b5e259"]
 *     responses:
 *       '201':
 *         description: Work order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder created successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "669a1a28e7f7b369e3b5e260"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingRequiredFields:
 *                 summary: Required fields are missing   
 *                 value:
 *                   message: "The following fields are required: name, departments, priority, asset, startAt, endAt, estimatedDays, estimatedHours, assignees."
 *                   errorInfo: null
 *               MissingTasks:
 *                 summary: Missing Tasks
 *                 value:
 *                   message: Tasks must be a non-empty array
 *                   errorInfo: null
 *               MissingDepartments:
 *                 summary: Missing Departments
 *                 value:
 *                   message: Departments must be a non-empty array
 *                   errorInfo: null
 *               MissingAssignees:
 *                 summary: Missing Assignees
 *                 value:
 *                   message: Assignees must be a non-empty array
 *                   errorInfo: null
 *               MissingDocuments:
 *                 summary: Missing Documents
 *                 value:
 *                   message: Documents must be a non-empty array
 *                   errorInfo: null
 *               MissingExistingTeams:
 *                 summary: Missing Existing Teams
 *                 value:
 *                   message: ExistingTeams must be a non-empty array
 *                   errorInfo: null
 *               MissingTasksDeleted:
 *                 summary: Missing TasksDeleted
 *                 value:
 *                   message: TasksDeleted must be a non-empty array
 *                   errorInfo: null
 *               MissingTasksToBeAdded:
 *                 summary: Missing TasksToBeAdded
 *                 value:
 *                   message: TasksToBeAdded must be a non-empty array
 *                   errorInfo: null
 *               MissingTaskToBeEdited:
 *                 summary: Missing TaskToBeEdited
 *                 value:
 *                   message: taskToBeEdited must be a non-empty array
 *                   errorInfo: null
 *               InvalidAssetId:
 *                 summary: Invalid asset ID
 *                 value:
 *                   message: "Asset id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               MissingDepartmentIds:
 *                 summary: Missing department IDs
 *                 value:
 *                   message: "Department ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               InvalidDepartmentIds:
 *                 summary: Invalid department IDs
 *                 value:
 *                   message: "Invalid department IDs"
 *                   errorInfo: null
 *               InvalidPriority:
 *                 summary: Invalid priority value
 *                 value:
 *                   message: "Please provide valid Priority"
 *                   errorInfo: null
 *               InvalidStatus:
 *                 summary: Invalid status value
 *                 value:
 *                   message: "Please provide valid Status"
 *                   errorInfo: null
 *               DuplicateWorkOrder:
 *                 summary: Work order name already exists
 *                 value:
 *                   message: "Duplicate Workorder Name: Routine Checkup"
 *                   errorInfo: null
 *               InvalidAssignee:
 *                 summary: Assignee not found in the department
 *                 value:
 *                   message: "Failed! Assignee does not exist in Department"
 *                   errorInfo: null
 *               InvalidStartDateFormat:
 *                 summary: Invalid Start Date Format
 *                 value:
 *                   message: "Invalid date format provided for Start Date."
 *                   errorInfo: null
 *               InvalidEndDateFormat:
 *                 summary: Invalid End Date Format
 *                 value:
 *                   message: "Invalid date format provided for End Date."
 *                   errorInfo: null
 *               MissingStartDate:
 *                 summary: Missing start date
 *                 value:
 *                   message: Failed! Please enter the start date
 *                   errorInfo: null
 *               MissingEndDate:
 *                 summary: Missing end date
 *                 value:
 *                   message: Failed! Please enter the end date
 *                   errorInfo: null
 *               InvalidStartEndDate:
 *                 summary: Start date must be before end date
 *                 value:
 *                   message: "The end date and time must be after the start date and time"
 *                   errorInfo: null
 *               PastStartDate:
 *                 summary: Start date is in the past
 *                 value:
 *                   message: "The Start Date and time must be after the Current Time"
 *                   errorInfo: null
 *               InvalidEstimatedTime:
 *                 summary: Invalid Estimated time 
 *                 value:
 *                   message: "Please provide valid Estimation Days and Estimation Hours"
 *                   errorInfo: null
 *               TeamDoesNotExist:
 *                 summary: Team does not exist
 *                 value:
 *                   message: Failed! Team does not exist in the department
 *                   errorInfo: null
 *               MissingDocumentID:
 *                 summary: Missing document ID
 *                 value:
 *                   message: Failed! DocumentId is required
 *                   errorInfo: null
 *               InvalidDocumentId:
 *                 summary: Document ID is not valid
 *                 value:
 *                   message: "Failed! DocumentId is not a valid file id"
 *                   errorInfo: null
 *               InvalidDocumentFileId:
 *                 summary: Invalid Document file ID
 *                 value:
 *                   message: "Failed! Invalid Document file id"
 *                   errorInfo: null
 *               InvalidDocument:
 *                 summary: Invalid Document 
 *                 value:
 *                   message: "Failed! Invalid Document. File id is not a workorder file"
 *                   errorInfo: null
 *               MissingImageID:
 *                 summary: Missing image ID
 *                 value:
 *                   message: Failed! Image Id is required
 *                   errorInfo: null
 *               InvalidImageId:
 *                 summary: Image ID is not valid
 *                 value:
 *                   message: "Failed! Image Id is not a valid file id"
 *                   errorInfo: null
 *               InvalidImageFileId:
 *                 summary: Image file ID is not valid
 *                 value:
 *                   message: "Failed! Invalid image file id"
 *                   errorInfo: null
 *               InvalidImage:
 *                 summary: Invalid image 
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not a workorder file"
 *                   errorInfo: null
 *               ValidationError:
 *                 summary: Validation Error
 *                 value:
 *                   message: Validation Error! Check all entries are correct
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/constants:
 *   get:
 *     summary: Retrieve work order constants
 *     description: Fetches available statuses and priority levels for work orders.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: WorkOrder constants fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder Constants Fetched Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: object
 *                       properties:
 *                         draft:
 *                           type: string
 *                           example: "draft"
 *                         scheduled:
 *                           type: string
 *                           example: "scheduled"
 *                         accepted:
 *                           type: string
 *                           example: "accepted"
 *                         onHold:
 *                           type: string
 *                           example: "onHold"
 *                         completed:
 *                           type: string
 *                           example: "completed"
 *                         expired:
 *                           type: string
 *                           example: "expired"
 *                     priority:
 *                       type: object
 *                       properties:
 *                         High_P1:
 *                           type: string
 *                           example: "High-P1"
 *                         Medium_P2:
 *                           type: string
 *                           example: "Medium-P2"
 *                         Low_P3:
 *                           type: string
 *                           example: "Low-P3"
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
 *         description: Internal Server Error 
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/statusCount:
 *   get:
 *     summary: Retrieve work order status counts
 *     description: |
 *       Fetches the count of work orders categorized by their statuses.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: asset
 *         required: false
 *         description: Asset ID to filter work orders by a specific asset
 *         schema:
 *           type: string
 *           example: 6615a9c0d8f123456789abcd
 *     responses:
 *       '200':
 *         description: WorkOrder status count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder Status count fetched successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     totalWorkOrders:
 *                       type: integer
 *                       example: 50
 *                     completedWorkOrders:
 *                       type: integer
 *                       example: 20
 *                     onHoldWorkOrders:
 *                       type: integer
 *                       example: 5
 *                     acceptedWorkOrders:
 *                       type: integer
 *                       example: 8
 *                     expiredWorkOrders:
 *                       type: integer
 *                       example: 3
 *                     scheduledWorkOrders:
 *                       type: integer
 *                       example: 10
 *                     draftWorkOrders:
 *                       type: integer
 *                       example: 4
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
 *         description: Internal Server Error 
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}:
 *   patch:
 *     summary: Edit an existing work order
 *     description: Updates the details of an existing work order, including priority, status, start date, end date, assignees, and documents.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the work order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Routine maintenance update"
 *               priority:
 *                 type: string
 *                 example: "High-P1"
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-10T08:00:00Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-10T12:00:00Z"
 *               estimatedDays:
 *                 type: integer
 *                 example: 1
 *               estimatedHours:
 *                 type: integer
 *                 example: 4
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6682640ace2038006d1892c2"]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a27e7f7b369e3b5e258"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a27e7f7b369e3b5e259"]
 *     responses:
 *       '200':
 *         description: WorkOrder Edited Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder Edited Successfully"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderid :
 *                 summary: Missing Work Order id
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid Work Order ID"
 *                   errorInfo: null
 *               MissingTasks:
 *                 summary: Missing Tasks
 *                 value:
 *                   message: Tasks must be a non-empty array
 *                   errorInfo: null
 *               MissingDepartments:
 *                 summary: Missing Departments
 *                 value:
 *                   message: Departments must be a non-empty array
 *                   errorInfo: null
 *               MissingAssignees:
 *                 summary: Missing Assignees
 *                 value:
 *                   message: Assignees must be a non-empty array
 *                   errorInfo: null
 *               MissingDocuments:
 *                 summary: Missing Documents
 *                 value:
 *                   message: Documents must be a non-empty array
 *                   errorInfo: null
 *               MissingExistingTeams:
 *                 summary: Missing Existing Teams
 *                 value:
 *                   message: ExistingTeams must be a non-empty array
 *                   errorInfo: null
 *               MissingTasksDeleted:
 *                 summary: Missing TasksDeleted
 *                 value:
 *                   message: TasksDeleted must be a non-empty array
 *                   errorInfo: null
 *               MissingTasksToBeAdded:
 *                 summary: Missing TasksToBeAdded
 *                 value:
 *                   message: TasksToBeAdded must be a non-empty array
 *                   errorInfo: null
 *               MissingTaskToBeEdited:
 *                 summary: Missing TaskToBeEdited
 *                 value:
 *                   message: taskToBeEdited must be a non-empty array
 *                   errorInfo: null
 *               InvalidPriority:
 *                 summary: Invalid priority value
 *                 value:
 *                   message: "Please provide valid Priority"
 *                   errorInfo: null
 *               InvalidStatus:
 *                 summary: Invalid status value
 *                 value:
 *                   message: "Please provide valid Status"
 *                   errorInfo: null 
 *               DuplicateWorkOrder:
 *                 summary: Work order name already exists
 *                 value:
 *                   message: "Duplicate Workorder Name: Routine Checkup"
 *                   errorInfo: null
 *               InvalidAssignee:
 *                 summary: Assignee not found in the department
 *                 value:
 *                   message: "Failed! Assignee does not exist in Department"
 *                   errorInfo: null
 *               CannotUpdateStartAt :
 *                 summary: Cannot Update Start At
 *                 value:
 *                   message: "Cannot Update Start At as there is an existing maintenance plan matching the criteria"
 *                   errorInfo: null
 *               InvalidStartDateFormat:
 *                 summary: Invalid Start Date Format
 *                 value:
 *                   message: "Invalid date format provided for Start Date."
 *                   errorInfo: null
 *               InvalidEndDateFormat:
 *                 summary: Invalid End Date Format
 *                 value:
 *                   message: "Invalid date format provided for End Date."
 *                   errorInfo: null
 *               MissingStartDate:
 *                 summary: Missing start date
 *                 value:
 *                   message: Failed! Please enter the start date
 *                   errorInfo: null
 *               MissingEndDate:
 *                 summary: Missing end date
 *                 value:
 *                   message: Failed! Please enter the end date
 *                   errorInfo: null
 *               InvalidStartEndDate:
 *                 summary: Start date must be before end date
 *                 value:
 *                   message: "The end date and time must be after the start date and time"
 *                   errorInfo: null
 *               PastStartDate:
 *                 summary: Start date is in the past
 *                 value:
 *                   message: "The Start Date and time must be after the Current Time"
 *                   errorInfo: null
 *               InvalidEstimatedTime:
 *                 summary: Invalid Estimated time 
 *                 value:
 *                   message: "Please provide valid Estimation Days and Estimation Hours"
 *                   errorInfo: null
 *               TeamDoesNotExist:
 *                 summary: Team does not exist
 *                 value:
 *                   message: Failed! Team does not exist in the department
 *                   errorInfo: null
 *               MissingDocumentID:
 *                 summary: Missing document ID
 *                 value:
 *                   message: Failed! DocumentId is required
 *                   errorInfo: null
 *               InvalidDocumentId:
 *                 summary: Document ID is not valid
 *                 value:
 *                   message: "Failed! DocumentId is not a valid file id"
 *                   errorInfo: null
 *               InvalidDocumentFileId:
 *                 summary: Invalid Document file ID
 *                 value:
 *                   message: "Failed! Invalid Document file id"
 *                   errorInfo: null
 *               InvalidDocument:
 *                 summary: Invalid Document 
 *                 value:
 *                   message: "Failed! Invalid Document. File id is not a workorder file"
 *                   errorInfo: null
 *               TaskDoesNotExist:
 *                 summary: Task does not exist
 *                 value:
 *                   message: "Failed! Task does not exist"
 *                   errorInfo: null
 *               InvalidTaskId:
 *                 summary: Invalid Task IDs in request
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
 *                   errorInfo:
 *                     invalidTaskIds: ["669a1a27e7f7b369e3b5e258", "669a1a28e7f7b369e3b5e260"]
 *               MissingImageId:
 *                 summary: Missing Image ID is not valid
 *                 value:
 *                   message: "Failed! ImageId is required"
 *                   errorInfo: null
 *               InvalidImageId:
 *                 summary: Invalid Image ID
 *                 value:
 *                   message: "Failed! ImageId is not a valid file id"
 *                   errorInfo: null
 *               InvalidImageFileId:
 *                 summary: Invalid Image file ID
 *                 value:
 *                   message: "Failed! Invalid Image file id"
 *                   errorInfo: null
 *               InvalidImage:
 *                 summary: Invalid Image 
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not a workorder file"
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders:
 *   get:
 *     summary: Retrieve a list of work orders
 *     description: |
 *       Fetches a list of work orders
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter work orders by department ID.
 *       - in: query
 *         name: asset
 *         schema:
 *           type: string
 *         description: Filter work orders by asset ID.
 *       - in: query
 *         name: maintenanceId
 *         schema:
 *           type: string
 *         description: Filter work orders by maintenance plan ID.
 *     responses:
 *       '200':
 *         description: WorkOrders Fetched Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrders Fetched Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           name:
 *                             type: string
 *                             example: "Routine Maintenance"
 *                           status:
 *                             type: string
 *                             example: "scheduled"
 *                           priority:
 *                             type: string
 *                             example: "High-P1"
 *                           startAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-10T08:00:00Z"
 *                           endAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-10T12:00:00Z"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingDepartmentId:
 *                 summary: Missing Department ID
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               DepartmentNotExist:
 *                 summary: Department does not exist
 *                 value:
 *                   message: "Failed! Department does not exist"
 *                   errorInfo: null
 *               MissingMaintenancePlanId:
 *                 summary: Missing Maintenance Plan ID
 *                 value:
 *                   message: "MaintenancePlan id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidMaintenancePlanId:
 *                 summary: Invalid Maintenance Plan ID
 *                 value:
 *                   message: "Failed! Invalid maintenancePlan Id"
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
 *                   example: "Asset not found"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               AssetNotFound:
 *                 summary: Asset not found
 *                 value:
 *                   message: "Failed! Asset does not exist."
 *                   errorInfo: null
 *               MaintenancePlanDoesNotExist:
 *                 summary: Maintenance plan does not exist
 *                 value:
 *                   message: "Failed! MaintenancePlan does not exist."
 *                   errorInfo: null
 *       '500':
 *         description: Internal Server Error 
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/tasks/{task}/images:
 *   get:
 *     summary: Retrieve images associated with a specific work order task
 *     description: Fetches task-related images for a given work order task ID.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID within the work order.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of images per page.
 *     responses:
 *       '200':
 *         description: Task images fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tasks Fetched Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 10
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/task-image.jpg"
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-07-10T08:00:00Z"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               TaskDoesNotExist:
 *                 summary: Task does not exist
 *                 value:
 *                   message: "Failed! Task does not exist"
 *                   errorInfo: null
 *               InvalidTaskIds:
 *                 summary: Invalid Task IDs
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/tasks/{task}/images:
 *   post:
 *     summary: Upload images for a specific work order task
 *     description: Allows users to upload multiple images for a given work order task.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID within the work order.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files to upload.
 *     responses:
 *       '201':
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/task-image.jpg"
 *       '207':
 *         description: Some images failed to upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded partially"
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/task-image.jpg"
 *                     failures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "failed_image"
 *                           extension:
 *                             type: string
 *                             example: "png"
 *                           arrayPosition:
 *                             type: integer
 *                             example: 2
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               TaskDoesNotExist:
 *                 summary: Task does not exist
 *                 value:
 *                   message: "Failed! Task does not exist"
 *                   errorInfo: null
 *               InvalidTaskIds:
 *                 summary: Invalid Task IDs
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
 *                   errorInfo: null
 *               FilesNotProvided:
 *                 summary: No files uploaded
 *                 value:
 *                   message: "Files not provided"
 *                   errorInfo: null
 *               TooManyFiles:
 *                 summary: Exceeded file upload limit
 *                 value:
 *                   message: "You can only upload a maximum of 20 files at a time"
 *                   errorInfo: null
 *               InvalidFiles:
 *                 summary: Invalid files provided
 *                 value:
 *                   message: "Failed! Invalid files provided"
 *                   errorInfo: null
 *               InvalidFileExtension:
 *                 summary: Invalid file extension
 *                 value:
 *                   message: "Invalid file extension"
 *                   errorInfo: null
 *               FileSizeExceeded:
 *                 summary: File size exceeds limit
 *                 value:
 *                   message: "File size exceeds limit for JPG files."
 *                   errorInfo: 
 *                     maxSize: "5 MB"
 *                     fileSize: "10 MB"
 *               MissingModuleName:
 *                 summary: Missing Module Name
 *                 value:
 *                   message: "Both moduleName and moduleId must be provided together"
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/remarks:
 *   post:
 *     summary: Add a remark to a specific work order
 *     description: |
 *       Allows users to add a remark to a given work order.
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
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark:
 *                 type: string
 *                 example: "This work order requires urgent attention."
 *     responses:
 *       '201':
 *         description: Remark added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Remark added successfully"
 *                 responseObject:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "669a1a27e7f7b369e3b5e258"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               ValidationError:
 *                 summary: ValidationError
 *                 value:
 *                   message: "Client side error"
 *                   errorInfo: { "Validation error": "Remark is required" }
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/remarks:
 *   get:
 *     summary: Fetch remarks for a specific work order
 *     description: |
 *       Retrieves remarks associated with the given work order.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default is all).
 *     responses:
 *       '200':
 *         description: Work order remarks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrders Remarks Fetched Successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "669a1a27e7f7b369e3b5e258"
 *                       remark:
 *                         type: string
 *                         example: "Urgent maintenance required"
 *                       createdBy:
 *                         type: string
 *                         example: "John Doe"
 *                       updatedBy:
 *                         type: string
 *                         example: "Jane Smith"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-05T14:30:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-06T10:15:00Z"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}:
 *   get:
 *     summary: Fetch a specific work order
 *     description: |
 *       Retrieves the details of a work order by its ID.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *     responses:
 *       '200':
 *         description: Work order fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder Fetched Successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "669a1a27e7f7b369e3b5e258"
 *                     name:
 *                       type: string
 *                       example: "Routine Maintenance"
 *                     priority:
 *                       type: string
 *                       example: "High"
 *                     status:
 *                       type: string
 *                       example: "scheduled"
 *                     startAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-05T14:30:00Z"
 *                     endAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-06T10:15:00Z"
 *                     estimatedDays:
 *                       type: integer
 *                       example: 2
 *                     estimatedHours:
 *                       type: integer
 *                       example: 5
 *                     assignees:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "John Doe"
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60b8d6e7c45f5d001f8b4567"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/document.pdf"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60b8d6e7c45f5d001f8b4568"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/image.jpg"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
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
 *         description: Work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder not found"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/accept:
 *   post:
 *     summary: Accept a work order
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID to be accepted.
 *     responses:
 *       '200':
 *         description: Work order accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder Accepted Successfully"
 *                 data:
 *                   type: null
 *                   example: null
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
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
 *                   example: "Failed! WorkOrder does not exist"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/putOnHold:
 *   post:
 *     summary: Put a work order on hold
 *     description: Updates the status of a work order to "onHold" by the authenticated user.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID to be put on hold.
 *     responses:
 *       '200':
 *         description: Work order put on hold successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder Put OnHold Successfully"
 *                 data:
 *                   type: null
 *                   example: null
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               WorkOrderNotExist:
 *                 summary: Work Order does not exist
 *                 value:
 *                   message: "Failed! WorkOrder does not exist"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
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
 *         description: Work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! WorkOrder does not exist"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/complete:
 *   post:
 *     summary: Complete a work order
 *     description: Updates the status of a work order to "completed" by the authenticated user.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID to be completed.
 *     responses:
 *       '200':
 *         description: Work order completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder Completed Successfully"
 *                 data:
 *                   type: null
 *                   example: null
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               MissingWorkOrderId:
 *                 summary: Work Order ID missing
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
 *         description: Work order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! WorkOrder does not exist"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/tasks/{task}:
 *   patch:
 *     summary: Update the status of a work order task
 *     description: Marks a task as completed and updates associated images.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the work order.
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to update.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Image file IDs associated with the task.
 *             example:
 *               images: ["65b45d8aef4f8c001fb1d290", "65b45d8aef4f8c001fb1d291"]
 *     responses:
 *       '200':
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder TaskStatus Changed Successfully"
 *                 data:
 *                   type: null
 *                   example: null
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Invalid Task IDs"
 *                 errorInfo:
 *                   type: object
 *                   example: { "invalidTaskIds": ["65b45d8aef4f8c001fb1d290"] }
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: WorkOrder ID is missing
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid WorkOrder Id
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               TaskDoesNotExist:
 *                 summary: Task does not exist
 *                 value:
 *                   message: "Failed! Task does not exist"
 *                   errorInfo: null
 *               InvalidTaskIDs:
 *                 summary: Invalid Task IDs
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
 *                   errorInfo: { "invalidTaskIds": ["65b45d8aef4f8c001fb1d290"] }
 *               InvalidImageId: 
 *                 summary: Image ID is not valid
 *                 value:
 *                   message: "Failed! ImageId is not a valid file id"
 *                   errorInfo: null
 *               MissingImageId: 
 *                 summary: Missing Image Id
 *                 value:
 *                   message: "Failed! ImageId is required"
 *                   errorInfo: null
 *               ImageNotFound: 
 *                 summary: Invaild Image file Id
 *                 value:
 *                   message: "Failed! Invalid Image File id"
 *                   errorInfo: null
 *               ImageNotForWorkOrder: 
 *                 summary: Invalid Image 
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not an workorder file"
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
 *                 summary: No Token Provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
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
 *                   example: "Failed! WorkOrder does not exist"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/images:
 *   post:
 *     summary: Upload an image for a Work Order
 *     description: Allows users to upload a single image and associate it with a Work Order.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload.
 *     responses:
 *       '201':
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "669a1a27e7f7b369e3b5e258"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/workorder-image.jpg"
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               FileNotProvided:
 *                 summary: No file uploaded
 *                 value:
 *                   message: "File not provided"
 *                   errorInfo: null
 *               InvalidFileExtension:
 *                 summary: Invalid file extension
 *                 value:
 *                   message: "Invalid file extension"
 *                   errorInfo: null
 *               FileSizeExceeded:
 *                 summary: File size exceeds limit
 *                 value:
 *                   message: "File size exceeds limit for JPG files."
 *                   errorInfo: 
 *                     maxSize: "5 MB"
 *                     fileSize: "10 MB"
 *               MissingModuleName:
 *                 summary: Missing Module Name
 *                 value:
 *                   message: "Both moduleName and moduleId must be provided together"
 *                   errorInfo: null
 *               UserIdNotProvided:
 *                 summary: User ID missing
 *                 value:
 *                   message: "User id not provided"
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
 *         description: Work Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/images/bulkUpload:
 *   post:
 *     summary: Bulk upload images for a specific work order
 *     description: Allows users to upload multiple images for a given work order.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files to upload.
 *     responses:
 *       '201':
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/workorder-image.jpg"
 *       '207':
 *         description: Some images failed to upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded partially"
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/workorder-image.jpg"
 *                     failures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "failed_image"
 *                           extension:
 *                             type: string
 *                             example: "png"
 *                           arrayPosition:
 *                             type: integer
 *                             example: 2
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
 *                 value:
 *                   message: "Failed! Invalid WorkOrder Id"
 *                   errorInfo: null
 *               FilesNotProvided:
 *                 summary: No files uploaded
 *                 value:
 *                   message: "Files not provided"
 *                   errorInfo: null
 *               TooManyFiles:
 *                 summary: Exceeded file upload limit
 *                 value:
 *                   message: "You can only upload a maximum of 20 files at a time"
 *                   errorInfo: null
 *               InvalidFiles:
 *                 summary: Invalid files provided
 *                 value:
 *                   message: "Failed! Invalid files provided"
 *                   errorInfo: null
 *               InvalidFileExtension:
 *                 summary: Invalid file extension
 *                 value:
 *                   message: "Invalid file extension"
 *                   errorInfo: null
 *               FileSizeExceeded:
 *                 summary: File size exceeds limit
 *                 value:
 *                   message: "File size exceeds limit for JPG files."
 *                   errorInfo: 
 *                     maxSize: "5 MB"
 *                     fileSize: "10 MB"
 *               MissingModuleName:
 *                 summary: Missing Module Name
 *                 value:
 *                   message: "Both moduleName and moduleId must be provided together"
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
 *                   example: "Failed! Work Order does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/spares:
 *   get:
 *     summary: Get spares for a specific work order
 *     description: Fetches the list of spares associated with a given work order.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *     responses:
 *       '200':
 *         description: Spares fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spares fetch Successfully"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "669a1a27e7f7b369e3b5e258"
 *                       name:
 *                         type: string
 *                         example: "Spare Part A"
 *                       quantity:
 *                         type: integer
 *                         example: 5
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
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
 *                   example: "Failed! WorkOrder does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/images:
 *   get:
 *     summary: Get images for a specific work order
 *     description: |
 *       Retrieves a list of images associated with the given work order.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: Work Order ID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of images per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "createdAt"
 *         description: Field to sort images by.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order.
 *     responses:
 *       '200':
 *         description: Images fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images for workorder fetched successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     totalCount:
 *                       type: integer
 *                       example: 15
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "669a1a27e7f7b369e3b5e258"
 *                           name:
 *                             type: string
 *                             example: "workorder_image.jpg"
 *                           url:
 *                             type: string
 *                             example: "https://example.com/workorder_image.jpg"
 *       '400':
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
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
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
 *                   example: "Failed! WorkOrder does not exist."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders:
 *   delete:
 *     summary: Delete multiple work orders
 *     description: Deletes the specified work orders by marking them as deleted.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workOrders:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of work order IDs to delete.
 *                 example: ["66b9fe45278a269d2a8a8f48"]
 *     responses:
 *       '200':
 *         description: Work orders deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workorder Deleted Successfully"
 *       '400':
 *         description: Bad request 
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
 *               InvalidWorkOrderIds:
 *                 summary: Invalid Work Order IDs
 *                 value:
 *                   message: "Failed! Invalid Workorder IDs"
 *                   errorInfo:
 *                     invalidWorkOrderIds: ["66b9fe45278a269d2a8a8f78", "66b9fe45278a269d2a8a8f79"]
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
 *         description: Internal Server Error 
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/workOrders/{workOrder}/copy:
 *   get:
 *     summary: Copy a work order
 *     description: |
 *       Creates a duplicate of an existing work order along with its associated files and images.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Work Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrder
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the work order to be copied.
 *     responses:
 *       '200':
 *         description: Work order copied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WorkOrder Copied successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     workOrder:
 *                       type: object
 *                       description: The newly created copy of the work order.
 *       '400':
 *         description: Bad request 
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
 *               MissingWorkOrderId:
 *                 summary: Missing Work Order ID
 *                 value:
 *                   message: "WorkOrder id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidWorkOrderId:
 *                 summary: Invalid Work Order ID
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
 *                   example: "Failed! WorkOrder does not exist"
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/
