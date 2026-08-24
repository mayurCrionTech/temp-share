/**
 * @swagger
 * /api/v1/checklists/general-details:
 *   post:
 *     summary: Create a new checklist
 *     tags:
 *       - Checklist
 *     description: |
 *      Creates a new checklist with the provided details, optionally as a draft. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |

 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isDraft
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Indicates whether the checklist should be saved as a draft.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the checklist (required for non-draft).
 *                 example: "Daily Maintenance Check"
 *               documentNumber:
 *                 type: string
 *                 description: Unique document number for the checklist (optional).
 *                 example: "CHK-001"
 *               startDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the checklist (required for non-draft).
 *                 example: "2025-04-15T08:00:00Z"
 *               endDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the checklist (required for non-draft).
 *                 example: "2025-04-15T17:00:00Z"
 *               assetId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: ID of the associated asset (required for non-draft).
 *                 example: "507f191e810c19729de860ea"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of department IDs (required for non-draft).
 *                 example: ["64a62cdbe341fa456e123abc"]
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of assignee user IDs (required for non-draft).
 *                 example: ["507f191e810c19729de860ea"]
 *               description:
 *                 type: string
 *                 description: Description of the checklist (optional).
 *                 example: "Routine inspection of equipment."
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of team IDs (optional).
 *                 example: ["64a62cdbe341fa456e123def"]
 *             required:
 *               - name
 *               - startDateAndTime
 *               - endDateAndTime
 *               - assetId
 *               - departments
 *               - assignees
 *     responses:
 *       '201':
 *         description: Checklist created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist created successfully"
 *               result:
 *                 checklistId: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingIsDraft:
 *                 value:
 *                   message: "Client side error"
 *                   errorInfo: "Please add isDraft query in request query"
 *               DuplicateName:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Checklist name already exist"
 *               DuplicateDocumentNumber:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Checklist document number already exist"
 *               ValidationError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Validation error: departments is required, assignees is required"
 *               MissingRequiredFields:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please enter name."
 *               DbSaveFailed:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Document is not saved in db"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/create-template:
 *   post:
 *     summary: Create a new template
 *     tags:
 *       - Checklist
 *     description: |
 *       create new template
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 * 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isGeneralTemplate
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Indicates whether the template is general or associated with a checklist
 *       - in: query
 *         name: checklistId
 *         schema:
 *           type: string
 *         description: Checklist ID (required if isGeneralTemplate is false)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Safety Inspection"
 *               description:
 *                 type: string
 *                 example: "A template for safety inspections."
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Fire Extinguisher Check"
 *                     type:
 *                       type: string
 *                       example: "boolean"
 *                     required:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       '201':
 *         description: Template has been saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Template has been saved successfully."
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7b2b3c8b634001f6e4a5b"
 *                     name:
 *                       type: string
 *                       example: "Safety Inspection"
 *       '400':
 *         description: Client-side error (Missing checklistId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               InvalidChecklistId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide checklistId in request query"
 *               InvalidisGeneraltemplateId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide isGeneralTemplate status in request query"
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
 * /api/v1/checklists/fill-entries/{entryId}:
 *   patch:
 *     summary: Fill checklist entry data
 *     tags:
 *       - Checklist
 *     description: 
 *        Updates the data for a specific checklist entry identified by entryID. 
 *       *Internally Populated Fields:*
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist entry to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     index:
 *                       type: integer
 *                       description: The index of the data field (must match template).
 *                       example: 1
 *                     fieldValue:
 *                       oneOf:
 *                         - type: string
 *                         - type: number
 *                         - type: array
 *                           items:
 *                             type: string
 *                       description: The value for the field (cannot be empty).
 *                       example: "25"
 *                   required:
 *                     - index
 *                     - fieldValue
 *                 description: List of field index-value pairs to update.
 *                 example:
 *                   - index: 1
 *                     fieldValue: "25"
 *                   - index: 2
 *                     fieldValue: "Operational"
 *             required:
 *               - data
 *     responses:
 *       '200':
 *         description: Entry filled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Entry filled successfully"
 *               result: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please select correct entry"
 *               IncorrectDataLength:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Request data is not correct"
 *               MissingIndex:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Index is required in request data"
 *               EmptyFieldValue:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Field value for index 1 cannot be empty"
 *               ThresholdExceeded:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "The entered value of Temperature exceeds the threshold limit."
 *               InvalidNotificationData:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Invalid Notification Data. Please provide valid String for activity, message, objectName."
 *               InvalidModuleId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Invalid objectId or triggeredBy"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists:
 *   get:
 *     summary: Retrieve all checklists for a user
 *     tags:
 *       - Checklist
 *     description: |
 *       Fetch a piginated list of checklists where the authenticated user is either the creator or an assignee.
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *           minimum: 1
 *           default: 15
 *         description: Number of checklists per page.
 *     responses:
 *       '200':
 *         description: Checklists retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "checklists"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 2
 *                 totalDataCount: 20
 *                 data:
 *                   - generalDetails:
 *                       _id: "64a62cdbe341fa456e123abc"
 *                       checklistNumber: 1
 *                       name: "Daily Maintenance"
 *                       documentNumber: "CHK-001"
 *                       isRecurrence: false
 *                       timePeriod: null
 *                       templatesStatus: null
 *                       asset: "Compressor A"
 *                       departments: ["Maintenance", "Operations"]
 *                       assignees: ["John Doe", "Jane Smith"]
 *                       teams: ["Team Alpha"]
 *                       frequency: null
 *                       createdAt: "2025-04-15T08:00:00.000Z"
 *                       updatedAt: "2025-04-15T08:00:00.000Z"
 *                       checklistStatus: "scheduled"
 *                       note: "Routine check"
 *                     templateStatuses:
 *                       - status: "completed"
 *                         count: 5
 *                       - status: "pendingForApproval"
 *                         count: 2
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               NoChecklists:
 *                 value:
 *                   message: "client side error"
 *                   messageInfo: "No checklist are available"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/{checklistId}:
 *   get:
 *     summary: Retrieve checklist details
 *     tags:
 *       - Checklist
 *     description: |
 *       Fetches detailed information about specific checklist identified by checklistId .
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist to retrieve (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     responses:
 *       '200':
 *         description: Checklist details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist details"
 *               result:
 *                 _id: "64a62cdbe341fa456e123abc"
 *                 checklistNumber: 1
 *                 name: "Daily Maintenance Check"
 *                 documentNumber: "CHK-001"
 *                 isRecurrence: false
 *                 timePeriod: null
 *                 templatesStatus: null
 *                 asset: "Compressor A"
 *                 departments: ["Maintenance", "Operations"]
 *                 assignees: ["John Doe", "Jane Smith"]
 *                 createdAt: "2025-04-15T08:00:00.000Z"
 *                 updatedAt: "2025-04-15T08:00:00.000Z"
 *                 checklistStatus: "scheduled"
 *                 isActive: true
 *                 startDateAndTime: "2025-04-15T08:00:00.000Z"
 *                 endDateAndTime: "2025-04-15T17:00:00.000Z"
 *                 recurrenceDetails: {}
 *                 userSpecificDetails: {}
 *                 description: "Routine inspection of equipment"
 *                 teams: ["Team Alpha"]
 *                 structureId: "64a62cdbe341fa456e123def"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidChecklistId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide checklistId."
 *               ChecklistNotFound:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Failed to retrieve checklist"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/{checklistId}/entries:
 *   get:
 *     summary: Retrieve checklist entries
 *     description: |
 *       Fetches a paginated list of entries for a specific checklist identified by `checklistId`. Entries are filtered 
 *       by the authenticated user (as operator or creator) and an optional status. Returns entry details including 
 *       entry number, status, creation date, and updater’s name. The request must include a valid business unit, 
 *       validated by the `verifyBusinessUnit` middleware. Authentication is required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist to retrieve entries for (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter entries by status (e.g., 'pendingForApproval', 'completed').
 *         example: "pendingForApproval"
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
 *           minimum: 1
 *           default: 15
 *         description: Number of entries per page.
 *     responses:
 *       '200':
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               EntriesFound:
 *                 value:
 *                   message: "Entries related to the checklist"
 *                   result:
 *                     currentPage: 1
 *                     totalPageCount: 2
 *                     totalDataCount: 20
 *                     data:
 *                       - checklistId: "64a62cdbe341fa456e123abc"
 *                         entryNumber: "ENT-001"
 *                         entryCreatedAt: "2025-04-15T08:00:00.000Z"
 *                         status: "pendingForApproval"
 *                         updatedBy: "John Doe"
 *                         createdAt: "2025-04-15T08:00:00.000Z"
 *                       - checklistId: "64a62cdbe341fa456e123abc"
 *                         entryNumber: "ENT-002"
 *                         entryCreatedAt: "2025-04-15T09:00:00.000Z"
 *                         status: "completed"
 *                         updatedBy: "Jane Smith"
 *                         createdAt: "2025-04-15T09:00:00.000Z"
 *               NoEntries:
 *                 value:
 *                   message: "No entries"
 *                   result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidChecklistId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide checklist Id."
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/{checklistId}/versions:
 *   get:
 *     summary: Retrieve checklist versions
 *     description: |
 *       Fetches a paginated list of versions (structures) for a specific checklist identified by `checklistId`. Only 
 *       versions created by the authenticated user are returned. Includes pagination details and version metadata. The 
 *       request must include a valid business unit, validated by the `verifyBusinessUnit` middleware. Authentication is 
 *       required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist to retrieve versions for (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
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
 *           minimum: 1
 *           default: 15
 *         description: Number of versions per page.
 *     responses:
 *       '200':
 *         description: Checklist versions retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist versions"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 2
 *                 totalDataCount: 20
 *                 data:
 *                   - _id: "64a62cdbe341fa456e123abc"
 *                     checklistId: "64a62cdbe341fa456e123def"
 *                     version: 1
 *                     templateId: "64a62cdbe341fa456e123ghi"
 *                     isActive: true
 *                     createdBy: "64a62cdbe341fa456e123jkl"
 *                     createdAt: "2025-04-15T08:00:00.000Z"
 *                   - _id: "64a62cdbe341fa456e123mno"
 *                     checklistId: "64a62cdbe341fa456e123def"
 *                     version: 2
 *                     templateId: "64a62cdbe341fa456e123pqr"
 *                     isActive: false
 *                     createdBy: "64a62cdbe341fa456e123jkl"
 *                     createdAt: "2025-04-15T09:00:00.000Z"
 *       '404':
 *         description: No versions found
 *         content:
 *           application/json:
 *             example:
 *               message: "No versions"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidChecklistId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide checklist Id."
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/entry/{entryId}:
 *   get:
 *     summary: Retrieve checklist entry details
 *     description: |
 *       Fetches detailed information about a specific checklist entry identified by `entryId`. Includes entry metadata 
 *       (e.g., status, data, updatedBy), associated checklist details (e.g., name, asset, departments), and checklist 
 *       structure data (e.g., images, note). The authenticated user’s access is assumed to be validated. The request 
 *       must include a valid business unit, validated by the `verifyBusinessUnit` middleware. Authentication is 
 *       required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist entry to retrieve (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     responses:
 *       '200':
 *         description: Checklist entry details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist entry details"
 *               result:
 *                 checklistEntry:
 *                   _id: "64a62cdbe341fa456e123abc"
 *                   entryNumber: "ENT-001"
 *                   entryCreatedAt: "2025-04-15T08:00:00.000Z"
 *                   checklistId: "64a62cdbe341fa456e123def"
 *                   status: "pendingForApproval"
 *                   updatedBy: "John Doe"
 *                   createdAt: "2025-04-15T08:00:00.000Z"
 *                   updatedAt: "2025-04-15T08:00:00.000Z"
 *                   data:
 *                     - index: 1
 *                       fieldValue: "25"
 *                       asset: "Compressor A"
 *                     - index: 2
 *                       fieldValue: "Operational"
 *                       asset: "Compressor A"
 *                 checklistDetails:
 *                   _id: "64a62cdbe341fa456e123def"
 *                   checklistNumber: 1
 *                   name: "Daily Maintenance Check"
 *                   documentNumber: "CHK-001"
 *                   isRecurrence: false
 *                   timePeriod: null
 *                   templatesStatus: null
 *                   asset: "Compressor A"
 *                   departments: ["Maintenance", "Operations"]
 *                   assignees: ["John Doe", "Jane Smith"]
 *                   createdAt: "2025-04-15T08:00:00.000Z"
 *                   updatedAt: "2025-04-15T08:00:00.000Z"
 *                   checklistStatus: "scheduled"
 *                   isActive: true
 *                   startDateAndTime: "2025-04-15T08:00:00.000Z"
 *                   endDateAndTime: "2025-04-15T17:00:00.000Z"
 *                   recurrenceDetails: {}
 *                   userSpecificDetails: {}
 *                   description: "Routine inspection of equipment"
 *                   teams: ["Team Alpha"]
 *                 image: ["64a62cdbe341fa456e123ghi"]
 *                 note: "Ensure equipment is powered off"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "client side error"
 *                   messageInfo: "Add correct entryId"
 *               MissingEntryId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide entryId."
 *               NoEntriesAvailable:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "No entries available"
 *               EntryNotFound:
 *                 value:
 *                   message: "client side error"
 *                   messageInfo: "Failed to retrieve entry details"
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
 * /api/v1/checklists/checklistStatus/count:
 *   get:
 *     summary: Retrieve checklist status counts
 *     description: |
 *       Fetches the total count of checklists associated with the authenticated user (as creator or assignee), along 
 *       with counts of checklists in 'completed' and 'pendingForApproval' statuses. The request must include a valid 
 *       business unit, validated by the `verifyBusinessUnit` middleware. Authentication is required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     responses:
 *       '200':
 *         description: Checklist status counts retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist status count details"
 *               result:
 *                 total: 50
 *                 completed: 30
 *                 pendingForApproval: 10
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               CountFailed:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Failed to get status count for checklist"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/general/templates:
 *   get:
 *     summary: Retrieve all general templates
 *     description: |
 *       Fetches a paginated list of general templates (where `isGeneralTemplate` is true). Returns template details 
 *       including ID, name, creator, and creation date, sorted by creation date in descending order. The request must 
 *       include a valid business unit, validated by the `verifyBusinessUnit` middleware. Authentication is required via 
 *       a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
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
 *           minimum: 1
 *           default: 15
 *         description: Number of templates per page.
 *     responses:
 *       '200':
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               TemplatesFound:
 *                 value:
 *                   message: "All the templates"
 *                   result:
 *                     currentPage: 1
 *                     totalPageCount: 2
 *                     totalDataCount: 20
 *                     data:
 *                       - _id: "64a62cdbe341fa456e123abc"
 *                         templateName: "Standard Inspection"
 *                         createdBy: "64a62cdbe341fa456e123def"
 *                         createdAt: "2025-04-15T08:00:00.000Z"
 *                       - _id: "64a62cdbe341fa456e123ghi"
 *                         templateName: "Safety Audit"
 *                         createdBy: "64a62cdbe341fa456e123def"
 *                         createdAt: "2025-04-15T09:00:00.000Z"
 *               NoTemplates:
 *                 value:
 *                   message: "No templates"
 *                   result: []
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
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/{checklistId}:
 *   patch:
 *     summary: Update checklist details
 *     description: |
 *       Updates the details of an existing checklist identified by `checklistId`. Supports partial updates to fields 
 *       like name, document number, departments, and dates. Ensures uniqueness of name and document number, validates 
 *       required fields for non-draft checklists, and sets the status to 'scheduled'. The authenticated user is recorded 
 *       as the updater. The request must include a valid business unit, validated by the `verifyBusinessUnit` middleware. 
 *       Authentication is required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checklistId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the checklist (optional, validated for uniqueness).
 *                 example: "Updated Maintenance Check"
 *               documentNumber:
 *                 type: string
 *                 description: Unique document number for the checklist (optional, validated for uniqueness).
 *                 example: "CHK-002"
 *               startDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the checklist (required for non-draft).
 *                 example: "2025-04-16T08:00:00Z"
 *               endDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the checklist (required for non-draft).
 *                 example: "2025-04-16T17:00:00Z"
 *               assetId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: ID of the associated asset (required for non-draft).
 *                 example: "507f191e810c19729de860ea"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of department IDs (required for non-draft).
 *                 example: ["64a62cdbe341fa456e123abc"]
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of assignee user IDs (required for non-draft).
 *                 example: ["507f191e810c19729de860ea"]
 *               description:
 *                 type: string
 *                 description: Description of the checklist (optional).
 *                 example: "Updated routine inspection."
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of team IDs (optional).
 *                 example: ["64a62cdbe341fa456e123def"]
 *               isDraft:
 *                 type: boolean
 *                 description: Whether the checklist remains a draft (defaults to true).
 *                 example: false
 *               recurrenceDetails:
 *                 type: object
 *                 description: Recurrence configuration (ignored in drafts).
 *                 example: {}
 *               userSpecificDetails:
 *                 type: object
 *                 description: User-specific configuration (ignored in drafts).
 *                 example: {}
 *     responses:
 *       '200':
 *         description: Checklist updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist update"
 *               result: "Checklist updated successfully"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingChecklistId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide checklistId."
 *               DuplicateName:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Checklist name already exist"
 *               DuplicateDocumentNumber:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Checklist document number already exist"
 *               ValidationError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Validation error: name is required"
 *               MissingRequiredFields:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please enter name."
 *               DuplicateKey:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Duplicate key error: name already exists."
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/checklistStructure/{structureId}:
 *   patch:
 *     summary: Update checklist structure details
 *     description: |
 *       Updates the structure of a checklist identified by `structureId` by deactivating the existing structure, 
 *       creating a new template with updated data sets, and inserting a new structure with an incremented version. 
 *       Retains existing images and notes if not updated. The authenticated user is recorded as the updater, while the 
 *       original creator is preserved. The request must include a valid business unit, validated by the 
 *       `verifyBusinessUnit` middleware. Authentication is required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: structureId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist structure to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataSets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     index:
 *                       type: integer
 *                       description: Index of the data field.
 *                       example: 1
 *                     fieldName:
 *                       type: string
 *                       description: Name of the field.
 *                       example: "Temperature"
 *                     type:
 *                       type: string
 *                       description: Data type of the field (e.g., number, string).
 *                       example: "number"
 *                     lowerBound:
 *                       type: number
 *                       description: Lower bound for number fields (optional).
 *                       example: 0
 *                     upperBound:
 *                       type: number
 *                       description: Upper bound for number fields (optional).
 *                       example: 100
 *                     criticalPoint1:
 *                       type: number
 *                       description: First critical point for alerts (optional).
 *                       example: 90
 *                     criticalPoint2:
 *                       type: number
 *                       description: Second critical point for alerts (optional).
 *                       example: 95
 *                 description: Updated data sets for the new template (required).
 *                 example:
 *                   - index: 1
 *                     fieldName: "Temperature"
 *                     type: "number"
 *                     lowerBound: 0
 *                     upperBound: 100
 *                   - index: 2
 *                     fieldName: "Status"
 *                     type: "string"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of image IDs or URLs (optional, defaults to existing images).
 *                 example: ["64a62cdbe341fa456e123abc"]
 *               note:
 *                 type: string
 *                 description: Additional notes for the structure (optional, defaults to existing note).
 *                 example: "Updated inspection notes."
 *             required:
 *               - dataSets
 *     responses:
 *       '200':
 *         description: Checklist structure updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist structure updated successfully"
 *               result:
 *                 structureId: "64a62cdbe341fa456e123def"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingStructureId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide structureId."
 *               InvalidStructureId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Invalid structureId."
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/templates/{templateId}:
 *   patch:
 *     summary: Update a specific checklist template
 *     tags:
 *       - Checklist 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the template to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Monthly Report Template"
 *               description:
 *                 type: string
 *                 example: "Updated template for monthly financial reports"
 *     responses:
 *       '200':
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Checklist template updated successfully
 *                 result:
 *                   type: array
 *                   example: []
 *       '400':
 *         description: Bad request (Missing template ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide templateId.
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (1)':
 *         description: Bad request (General client-side error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some client-side error occurred
 *                 errorInfo:
 *                   type: string
 *                   example: "Validation error: Name is required"
 */

/**
 * @swagger
 * /api/v1/checklists/versions/{structureId}:
 *   get:
 *     summary: Retrieve checklist structure version details
 *     description: |
 *       Fetches details of a specific checklist structure version identified by `structureId`. Includes structure 
 *       metadata (e.g., images, note) and associated template data sets. The request must include a valid business unit, 
 *       validated by the `verifyBusinessUnit` middleware. Authentication is required via a Bearer token.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: structureId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist structure to retrieve (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     responses:
 *       '200':
 *         description: Version details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Version Details"
 *               result:
 *                 - _id: "64a62cdbe341fa456e123abc"
 *                   images: ["64a62cdbe341fa456e123def"]
 *                   note: "Inspection guidelines"
 *                   dataSets:
 *                     - index: 1
 *                       fieldName: "Temperature"
 *                       type: "number"
 *                       lowerBound: 0
 *                       upperBound: 100
 *                     - index: 2
 *                       fieldName: "Status"
 *                       type: "string"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingStructureId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide structureId."
 *               NoVersionDetails:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "No version details available"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/templates/{templateId}:
 *   get:
 *     summary: Retrieve template details
 *     description: |
 *       Fetches details of a specific template identified by `templateId`.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the template to retrieve (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     responses:
 *       '200':
 *         description: Template details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Template Details"
 *               result:
 *                 dataSets:
 *                   - index: 1
 *                     fieldName: "Temperature"
 *                     type: "number"
 *                     lowerBound: 0
 *                     upperBound: 100
 *                   - index: 2
 *                     fieldName: "Status"
 *                     type: "string"
 *                 createdBy: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingTemplateId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide templateId."
 *               NoTemplateExists:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "No template exists"
 *               TemplateNotFound:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "There is no templates"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/templates/{templateId}:
 *   patch:
 *     summary: Update template details
 *     description: |
 *       Updates the details of an existing template identified by `templateId`.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the template to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the template (optional, validated for uniqueness).
 *                 example: "Updated Inspection Template"
 *               dataSets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     index:
 *                       type: integer
 *                       description: Index of the data field.
 *                       example: 1
 *                     fieldName:
 *                       type: string
 *                       description: Name of the field.
 *                       example: "Temperature"
 *                     type:
 *                       type: string
 *                       description: Data type of the field (e.g., number, string).
 *                       example: "number"
 *                     lowerBound:
 *                       type: number
 *                       description: Lower bound for number fields (optional).
 *                       example: 0
 *                     upperBound:
 *                       type: number
 *                       description: Upper bound for number fields (optional).
 *                       example: 100
 *                 description: Updated data sets for the template (optional).
 *                 example:
 *                   - index: 1
 *                     fieldName: "Temperature"
 *                     type: "number"
 *                     lowerBound: 0
 *                     upperBound: 100
 *                   - index: 2
 *                     fieldName: "Status"
 *                     type: "string"
 *     responses:
 *       '200':
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Checklist tempalate updated successfully"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingTemplateId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide templateId."
 *               InvalidTemplateId:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Invalid templateId."
 *               DuplicateName:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Duplicate template name, Please change the template name!"
 *               NoAccess:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "You don't have access to update template"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklists/timePeriodDetails:
*   get:
 *     summary: Get checklist time period options
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     description: Returns available time periods for recurrence settings in checklists.
 *     responses:
 *       200:
 *         description: Successfully retrieved time period options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Checklist time periods
 *                 data:
 *                   type: array
 *                   example: ["hour", "day", "week", "month"]
 *       400:
 *         description: Client side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Client side error
 *                 error:
 *                   type: string
 *                   example: Error details
 */



/**
 * @swagger
 * /api/v1/checklists/field/{check-uniqueness}:
 *   post:
 *     summary: Check field uniqueness for checklists
 *     description: |
 *       Validates the uniqueness of a specified field value in the checklist collection.
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             minProperties: 1
 *             maxProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 description: Checklist name to check for uniqueness.
 *                 example: "Maintenance Check"
 *               documentNumber:
 *                 type: string
 *                 description: Document number to check for uniqueness.
 *                 example: "CHK-001"
 *             example:
 *               name: "Maintenance Check"
 *     responses:
 *       '200':
 *         description: Value is unique
 *         content:
 *           application/json:
 *             example:
 *               message: "Value is unique"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               EmptyField:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Field <name> is required and cannot be empty"
 *               NonUniqueValue:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "name already exists"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklist/entry-status/{entryId}:
 *   patch:
 *     summary: Update checklist entry status
 *     description: |
 *       Updates the status of a checklist entry identified by `entryId`. 
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist entry to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["revised", "approved", "completed"]
 *                 description: The new status of the entry ('revised' or 'approved'/'completed').
 *                 example: "revised"
 *               comment:
 *                 type: string
 *                 description: Comment required when status is 'revised'.
 *                 example: "Needs further review"
 *           examples:
 *             Revised:
 *               value:
 *                 status: "revised"
 *                 comment: "Needs further review"
 *             Approved:
 *               value:
 *                 status: "approved"
 *     responses:
 *       '200':
 *         description: Entry status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Entry status is updated"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidStatus:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please provide correct status"
 *               NoAccess:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "You do not have the necessary access rights to perform this update."
 *               MissingComment:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Please add comment"
 *               UpdateFailed:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Entry status is not updated"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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
 * /api/v1/checklist/entries/{entryId}:
 *   patch:
 *     summary: Update checklist entry data
 *     description: |
 *       Updates the data fields of a checklist entry identified by `entryId`. 
 *     tags:
 *       - Checklist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the checklist entry to update (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the request context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - index
 *                     - fieldValue
 *                   properties:
 *                     index:
 *                       type: integer
 *                       description: Index of the data field.
 *                       example: 1
 *                     fieldValue:
 *                       type: any
 *                       description: Value of the field (cannot be empty/null).
 *                       example: "25"
 *                 description: Array of data objects to update, matching existing entry data length.
 *                 example:
 *                   - index: 1
 *                     fieldValue: "25"
 *                   - index: 2
 *                     fieldValue: "Operational"
 *     responses:
 *       '201':
 *         description: Entry updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Entry updated successfully"
 *               result: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               NoAccess:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "You do not have the necessary access rights to perform this update."
 *               IncorrectDataLength:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Request data is not correct"
 *               MissingIndex:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Index is required in request data"
 *               EmptyFieldValue:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "Field value for index 1 cannot be empty"
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               GenericError:
 *                 value:
 *                   message: "Client side error"
 *                   messageInfo: "An error occurred"
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

