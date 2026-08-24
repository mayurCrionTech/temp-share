/**
 * @swagger
 * /api/v1/maintenanceplans:
 *   post:
 *     summary: Create a new maintenance plan
 *     description: |
 *       This endpoint is used to create a new maintenance plan.
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
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: false
 *         description: If true, creates the maintenance plan as a draft.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - departments
 *               - priority
 *               - asset
 *               - startAt
 *               - endAt
 *               - estimatedDays
 *               - estimatedHours
 *               - assignees
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Monthly AC Maintenance"
 *               description:
 *                 type: string
 *                 example: "Routine check and servicing of pump system"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["668a1a27e7f7b369e3b5e258"]
 *               priority:
 *                 type: string
 *                 example: "High"
 *               asset:
 *                 type: string
 *                 example: "669a1a27e7f7b369e3b5e258"
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
 *                 example: 1
 *               estimatedHours:
 *                 type: integer
 *                 example: 5
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["668a1a27e7f7b369e3b5e267", "668a1a27e7f7b369e3b5e268"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["668a1a27e7f7b369e3b5e333", "668a1a27e7f7b369e3b5e334"]
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6682640ace2038006d1892c2"]
 *               existingTeams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: ["6682640ace2038006d189876"]
 *                     noOfMembersRequired:
 *                       type: number
 *                       example: 2
 *               localTeams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Team A"
 *                     noOfMembersRequired:
 *                       type: number
 *                       example: 2
 *               addToAssetHistory:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               isRecurrence:
 *                 type: boolean
 *                 example: true
 *               recurrenceDetails:
 *                 type: object
 *                 properties:
 *                   frequency:
 *                     type: number
 *                     example: 1
 *                   timePeriod:
 *                     type: string
 *                     example: "month"
 *                   recurrOn:
 *                     type: string
 *                     example: "onlyOnWeekDays"
 *                   occurDays:
 *                     type: string
 *                     example: "monday"
 *                   specificDay:
 *                     type: string
 *                     example: "First Monday of the month"
 *     responses:
 *       '201':
 *         description: Maintenance plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: MaintenancePlan created successfully
 *                 id:
 *                   type: string
 *                   example: 669a1a28e7f7b369e3b5e260
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
 *               MissingRequiredFields:
 *                 summary: Missing Required Fields
 *                 value:
 *                   message: The following fields are required - name, departments, priority, asset, startAt, endAt, estimatedDays, estimatedHours, assignees
 *                   errorInfo: null
 *               MissingAssetId:
 *                 summary: Missing asset Id
 *                 value:
 *                   message: Asset Id must be non-empty string in req.params or req.body
 *                   errorInfo: null
 *               MissingDepartmentId:
 *                 summary: Missing Department Id
 *                 value:
 *                   message: Department ids must be non-empty array of strings
 *                   errorInfo: null
 *               MissingRecurrenceDetail:
 *                 summary: Missing Recurrence details
 *                 value:
 *                   message: Failed! Provide Recurrence details in req.body
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
 *               InvalidFrequency:
 *                 summary: Invalid Frequency
 *                 value:
 *                   message: Failed! Frequency must be positive number
 *                   errorInfo: null
 *               InvalidPriority:
 *                 summary: Invalid Priority Value
 *                 value:
 *                   message: "Please provide a valid Priority."
 *                   errorInfo: null
 *               InvalidDepartmentIds:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: "Failed! Invalid Department ids."
 *                   invalidDepartments: ["6641959acbe6ea3941e60789", "6641959acbe6ea3941e60788"]
 *               InvalidTimePeriod:
 *                 summary: Invalid Time Period
 *                 value:
 *                   message: "Failed! Time Period must be one of hour, day, week, month, year."
 *                   errorInfo: null
 *               InvalidRecurrOn:
 *                 summary: Invalid RecurrOn
 *                 value:
 *                   message: "Failed! recurrOn must be one of daily, weekly, monthly."
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
 *               InvalidDocumentID:
 *                 summary: Invalid Document ID
 *                 value:
 *                   message: "Failed! DocumentId is not a valid file id."
 *                   errorInfo: null
 *               InvalidDocumentId:
 *                 summary: Invalid document file ID
 *                 value:
 *                   message: "Failed! Invalid document file ID"
 *                   errorInfo: null
 *               InvalidDocument:
 *                 summary: Invalid Document 
 *                 value:
 *                   message: "Failed! Invalid Document. File id is not a maintenancePlan file."
 *                   errorInfo: null
 *               InvalidImageID:
 *                 summary: Invalid Image ID
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not a maintenancePlan file."
 *                   errorInfo: null
 *               DuplicateMaintenancePlanName:
 *                 summary: Duplicate Maintenance Plan Name
 *                 value:
 *                   message: Failed! Duplicate MaintenancePlan Name - ["6841959acbe6ea3941e6078"]
 *                   errorInfo: null
 *               AssigneeNotinDepartment:
 *                 summary: Assignee Not in Department
 *                 value:
 *                   message: "Failed! Assignee does not exist in Department"
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
 *               StartDateInPast:
 *                 summary: Start date in past
 *                 value:
 *                   message: The Start Date and time must be after the Current Time
 *                   errorInfo: null
 *               EndDateBeforeStartDate:
 *                 summary: End Date Before Start Date
 *                 value:
 *                   message: The end date and time must be after the start date and time
 *                   errorInfo: null
 *               EstimationExceedsDuration:
 *                 summary: Estimation exceeds Duration
 *                 value:
 *                   message: Please provide valid Estimation Days and Estimation Hours
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
 *                   example: Failed! Asset does not exist
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
 * /api/v1/maintenancePlans:
 *   get:
 *     summary: Retrieve a list of maintenance plans
 *     description: |
 *       This endpoint is to fetch a list of maintenance plan.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     parameters:
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
 *         description: Number of items per page.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Maintenance plans fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: MaintenancePlans Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 4
 *                     totalDataCount:
 *                       type: integer
 *                       example: 19
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Maintenance Plan 1
 *                           number:
 *                             type: string
 *                             example: MP-1001
 *                           priority:
 *                             type: string
 *                             example: High
 *                           startAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-07-19T07:10:56.064Z
 *                           endAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-07-25T07:10:56.064Z
 *                           status:
 *                             type: string
 *                             example: Scheduled
 *                           isRecurrence:
 *                             type: boolean
 *                             example: true
 *                           recurrenceDetails:
 *                             type: object
 *                             properties:
 *                               frequency:
 *                                 type: number
 *                                 example: 3
 *                           scheduledTime:
 *                             type: string
 *                             example: "2025-04-07T07:20:00.534+00:00"
 *                           asset:
 *                             type: string
 *                             example: "643fd23e1b2743e4bce215ab"
 *                           assignees:
 *                             type: array
 *                             example: ["643fa1b21a2748e4bce20001"]
 *                           departments:
 *                             type: array
 *                             example: ["643fa1b21a2748e4bce20000"]
 *                           existingTeams:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Team Alpha"
 *                                 noOfMembersRequired:
 *                                   type: integer
 *                                   example: 3
 *                           id:
 *                             type: string
 *                             example: 669a1a28e7f7b369e3b5e260
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
 *               MissingDepartmentID:
 *                 summary: Missing Department ID
 *                 value:
 *                   message: Department Id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               DepartmentNotExist:
 *                 summary: Department does not exist
 *                 value:
 *                   message: Failed! Department does not exist
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
 *                   example: Failed! Asset does not exist
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
 * /api/v1/maintenancePlans/statusCount:
 *   get:
 *     summary: Fetch the count of maintenance plans by status
 *     description: |
 *       Retrieves the count of total, scheduled, and draft maintenance plans.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     parameters:
 *       - in: query
 *         name: asset
 *         schema:
 *           type: string
 *         description: Filter maintenance plans by a specific asset ID.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Maintenance plan status count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: MaintenancePlan Status count fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     totalMaintenancePlans:
 *                       type: integer
 *                       example: 25
 *                     scheduledMaintenancePlans:
 *                       type: integer
 *                       example: 10
 *                     draftMaintenancePlans:
 *                       type: integer
 *                       example: 5
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
 *         description: Internal Server Erro
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
 * /api/v1/maintenancePlans/{maintenancePlan}:
 *   get:
 *     summary: Fetch a specific maintenance plan
 *     description: |
 *       Retrieves details of a specific maintenance plan by its ID.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     parameters:
 *       - in: path
 *         name: maintenancePlan
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the maintenance plan to retrieve.
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name]
 *         description: Fetch maintenance plan by name instead of ID.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Maintenance plan fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: maintenancePlan Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 669a1a28e7f7b369e3b5e260
 *                     name:
 *                       type: string
 *                       example: Routine Equipment Check
 *                     number:
 *                       type: string
 *                       example: "MP-2025-001"
 *                     priority:
 *                       type: string
 *                       example: "High-P1"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *                     startAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-07-19T07:10:56.064Z
 *                     endAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-07-21T12:30:00.000Z
 *                     description:
 *                       type: string
 *                       example: "Monthly checkup for all water pumps"
 *                     estimatedDays:
 *                       type: number
 *                       example: 1
 *                     estimatedHours:
 *                       type: number
 *                       example: 8
 *                     isRecurrence:
 *                       type: boolean
 *                       example: true
 *                     recurrenceDetails:
 *                       type: object
 *                       properties:
 *                         frequency:
 *                           type: string
 *                           example: "Monthly"
 *                     scheduledTime:
 *                       type: string
 *                       example: "2024-07-21T12:30:00.000Z"
 *                     isWorkPermitRequired:
 *                       type: boolean
 *                       example: false
 *                     isMaintenanceScheduled:
 *                       type: boolean
 *                       example: true
 *                     addToAssetHistory:
 *                       type: boolean
 *                       example: false
 *                     asset:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6615cabcde00000123456789"
 *                         name:
 *                           type: string
 *                           example: "Main Water Pump"
 *                     assignees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         example: "6615cabcd4567890abcdef12"
 *                     departments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6615dep00012345678abcde1"
 *                     existingTeams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72ef1e153a2b6c8e4d47"
 *                           noOfMembersRequired:
 *                             type: integer
 *                             example: 2
 *                     localTeams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Pump Team"
 *                           noOfMembersRequired:
 *                             type: integer
 *                             example: 2
 *                     tasks:
 *                       type: array
 *                       description: IDs of associated tasks
 *                       items:
 *                         type: string
 *                       example: ["605c72ef1e153a2b6c8e4d48"]
 *                     createdBy:
 *                       type: string
 *                       example: "6615admin1234567890abcded"
 *                     updatedBy:
 *                       type: string
 *                       example: "6615admin1234567890abcded"
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://your-domain.com/uploads/docs/doc1.pdf"
 *                           name:
 *                             type: string
 *                             example: "Pump_Manual.pdf"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://your-domain.com/uploads/images/image1.jpg"
 *                           name:
 *                             type: string
 *                             example: "Pump.jpg"
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
 *               InvalidMaintenancePlanId:
 *                 summary: Invalid maintenancePlan ID
 *                 value:
 *                   message: "Failed! Invalid maintenancePlan Id"
 *                   errorInfo: null
 *               MissingMaintenancePlanId:
 *                 summary: MaintenancePlan ID missing in request
 *                 value:
 *                   message: "maintenancePlan id must be a non-empty string in req.params or req.body"
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
 *                   example: "Failed! maintenancePlan does not exist."
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
 * /api/v1/maintenancePlans:
 *   delete:
 *     summary: Delete multiple maintenance plans
 *     description: Deletes multiple maintenance plans based on provided IDs.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenancePlans:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["669a1a28e7f7b369e3b5e260", "669a1b39e7f7b369e3b5e261"]
 *     responses:
 *       '200':
 *         description: Maintenance plans deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "maintenancePlans Deleted Successfully"
 *                 errorInfo:
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
 *                   example: "Failed! Invalid Workorder IDs"
 *                 errorInfo:
 *                   type: object
 *                   properties:
 *                     invalidMaintenanceIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: ["669a1c58e7f7b369e3b5e263", "invalid-id"]
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
 * /api/v1/maintenancePlans/{maintenancePlan}:
 *   patch:
 *     summary: Edit a maintenance plan 
 *     description: |
 *       Updates an existing maintenance plan based on provided parameters.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       | createdBy     | Automatically set from user token   |
 *       | updatedBy     | Automatically set from logged-in user    |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenancePlan
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the maintenance plan to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Maintenance Plan"
 *               number:
 *                 type: string
 *                 example: "009"
 *               description:
 *                 type: string
 *                 example: Updated description of the plan
 *               priority:
 *                 type: string
 *                 example: "High"
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-19T08:00:00.000Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-20T18:00:00.000Z"
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6682640ace2038006d1892c2"]
 *               estimatedDays:
 *                 type: integer
 *                 example: 2
 *               estimatedHours:
 *                 type: integer
 *                 example: 12
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://your-domain.com/uploads/docs/doc2.pdf"
 *                     name:
 *                       type: string
 *                       example: "Updated_Manual.pdf"
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://your-domain.com/uploads/images/image2.jpg"
 *                     name:
 *                       type: string
 *                       example: "UpdatedPump.jpg"
 *               existingTeams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6615team00123456789abcde2"
 *                     noOfMembersRequired:
 *                       type: integer
 *                       example: 3
 *               localTeams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Team A"
 *                     noOfMembersRequired:
 *                       type: integer
 *                       example: 3
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       '200':
 *         description: Maintenance plan edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "MaintenancePlan Edited Successfully"
 *                 errorInfo:
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
 *                   type: array
 *                   items:
 *                     type: string
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
 *               MissingMaintenancePlanId:
 *                 summary: Maintenance plan ID is missing
 *                 value:
 *                   message: "MaintenancePlan id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidMaintenancePlanId:
 *                 summary: Invalid maintenance plan ID
 *                 value:
 *                   message: "Failed! Invalid maintenancePlan Id"
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
 *               DuplicateMaintenancePlanName:
 *                 summary: Duplicate maintenance plan name
 *                 value:
 *                   message: "Duplicate MaintenancePlan Name : SamplePlan"
 *                   errorInfo: null
 *               InvalidAssigneeDepartment:
 *                 summary: Assignee does not exist in the department
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
 *                   message: Failed! Please enter start date
 *                   errorInfo: null
 *               MissingEndDate:
 *                 summary: Missing end date
 *                 value:
 *                   message: Failed! Please enter end date
 *                   errorInfo: null
 *               StartDateInPast:
 *                 summary: Start date in past
 *                 value:
 *                   message: The Start Date and time must be after the Current Time
 *                   errorInfo: null
 *               EndDateBeforeStartDate:
 *                 summary: End Date Before Start Date
 *                 value:
 *                   message: The end date and time must be after the start date and time
 *                   errorInfo: null
 *               InvalidEstimation:
 *                 summary: Invalid Estimation days and hours
 *                 value:
 *                   message: "Please provide valid Estimation Days and Estimation Hours"
 *                   errorInfo: null
 *               InvalidTaskIds:
 *                 summary: Some tasks do not exist
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
 *                   errorInfo:
 *                     invalidTaskIds: ["669a1c58e7f7b369e3b5e263", "invalid-id"]
 *               InvalidDocumentId:
 *                 summary: Document ID is invalid
 *                 value:
 *                   message: "Failed! DocumentId is not a valid file id"
 *                   errorInfo: null
 *               InvalidDocument:
 *                 summary: Document is invalid
 *                 value:
 *                   message: "Failed! Invalid document. File id is not an maintenancePlan file"
 *                   errorInfo: null
 *               InvalidImageId:
 *                 summary: Image ID is invalid
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not an maintenancePlan file"
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
 *               InvalidDocumentID:
 *                 summary: Invalid document file ID
 *                 value:
 *                   message: "Failed! Invalid document file ID"
 *                   errorInfo: null
 *               TaskDoesNotExist:
 *                 summary: Task does not exist
 *                 value:
 *                   message: Failed! Task does not exist 
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
 *                   example: "Failed! maintenancePlan does not exist."
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
 *                   example: "Internal server error"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/maintenancePlans/{maintenancePlan}/versions:
 *   get:
 *     summary: Retrieve all versions of a maintenance plan
 *     description: Fetches all historical versions of a given maintenance plan.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenancePlan
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the maintenance plan whose versions are to be fetched.
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *         description: Fetch maintenance plan using the field (e.g., name).
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of records per page
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       '200':
 *         description: Maintenance plan versions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Maintenance Versions fetch Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     totalCount:
 *                       type: integer
 *                       example: 15
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6615abc1234567890def1234"
 *                           name:
 *                             type: string
 *                             example: "Monthly Pump Maintenance"
 *                           number:
 *                             type: string
 *                             example: "MPM-001"
 *                           version:
 *                             type: integer
 *                             example: 3
 *                           priority:
 *                             type: string
 *                             example: "High-P1"
 *                           startAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-01T08:00:00Z"
 *                           endAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-02T17:00:00Z"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-01T10:00:00Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-01T12:00:00Z"
 *                           status:
 *                             type: string
 *                             example: active
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
 *               MissingMaintenancePlanId:
 *                 summary: Maintenance plan ID is missing
 *                 value:
 *                   message: "MaintenancePlan id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidMaintenancePlanId:
 *                 summary: Invalid maintenance plan ID
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
 *                   example: "Failed! maintenancePlan does not exist."
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
 *                   example: "An unexpected error occurred while fetching maintenance plan versions"
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/maintenancePlans/{maintenancePlan}/versions/{version}:
 *   get:
 *     summary: Retrieve a specific version of a maintenance plan
 *     description: |
 *       Fetches a specific historical version of a given maintenance plan.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Maintenance Plan
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenancePlan
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the maintenance plan whose version is to be fetched.
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: The version ID of the maintenance plan.
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *         description: Fetch maintenance plan using the field (e.g., name).
 *     responses:
 *       '200':
 *         description: Maintenance plan version fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "maintenancePlan Version Fetched Successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6615abc1234567890def1234"
 *                     name:
 *                       type: string
 *                       example: Monthly Inspection
 *                     number:
 *                       type: string
 *                       example: MIP-2025
 *                     description:
 *                       type: string
 *                       example: Routine monthly inspection for HVAC
 *                     priority:
 *                       type: string
 *                       example: "High-P1"
 *                     startAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-01T08:00:00Z"
 *                     endAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-01T17:00:00Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-01T17:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-01T17:00:00Z"
 *                     status:
 *                       type: string
 *                       example: active
 *                     estimatedDays:
 *                       type: number
 *                       example: 1
 *                     estimatedHours:
 *                       type: number
 *                       example: 8
 *                     isRecurrence:
 *                       type: boolean
 *                       example: true
 *                     recurrenceDetails:
 *                       type: object
 *                       nullable: true
 *                     isWorkPermitRequired:
 *                       type: boolean
 *                       example: false
 *                     isMaintenanceScheduled:
 *                       type: boolean
 *                       example: true
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://example.com/docs/maintenance.pdf"
 *                           name:
 *                             type: string
 *                             example: "maintenance.pdf"
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://example.com/images/hvac.png"
 *                           name:
 *                             type: string
 *                             example: "hvac.png"
 *                     departments:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "6615jhk00123456789abcde0"
 *                     assignees:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "66hdfd00123456789abcde0"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "9964fg00123456789abcde0"
 *                     existingTeams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6615team00123456789abcde2"
 *                           noOfMembersRequired:
 *                             type: integer
 *                             example: 2
 *                     localTeams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Team A"
 *                           noOfMembersRequired:
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
 *               MissingMaintenancePlanId:
 *                 summary: Maintenance plan ID is missing
 *                 value:
 *                   message: "MaintenancePlan id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidMaintenancePlanId:
 *                 summary: Invalid maintenance plan ID
 *                 value:
 *                   message: "Failed! Invalid MaintenancePlan Id"
 *                   errorInfo: null
 *               InvalidVersionId:
 *                 summary: Invalid maintenance version ID
 *                 value:
 *                   message: "Failed! Invalid MaintenanceVersion Id"
 *                   errorInfo: null
 *               VersionDoesNotExist:
 *                 summary: Version does not exist for this maintenance plan
 *                 value:
 *                   message: "Failed! MaintenanceVersion does not exist for this MaintenancePlan"
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
 *                   example: "MaintenancePlan Version not found"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MaintenancePlanVersionNotFound:
 *                 summary: MaintenancePlan Version not found
 *                 value:
 *                   message: MaintenancePlan Version not found
 *                   errorInfo: null
 *               MaintenanceplanNotExist:
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
