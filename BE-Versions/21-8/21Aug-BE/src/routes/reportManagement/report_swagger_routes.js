/**
 * @swagger
 * /api/v1/reports/report-module:
 *   get:
 *     summary: Retrieve report modules
 *     tags:
 *         - Report
 *     description: Fetches all available report modules.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Modules for report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Modules for report"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["checklist", "log"]
 *       400:
 *         description: Client side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client side error"
 *                 errorInfo:
 *                   type: string
 *                   example: "No modules"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/v1/reports/report-format:
 *   get:
 *     summary: Retrieve report formats
 *     tags:
 *       - Report
 *     description: Fetches all available report formats.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Formats for report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Formats for report"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["PDF"]
 *       400:
 *         description: No formats available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No formats"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       500:
 *         description: Client side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client side error"
 *                 errorInfo:
 *                   type: string
 *                   example: "No formats"
 */

/**
 * @swagger
 * /api/v1/reports/module-data:
 *   get:
 *     summary: Retrieve module data
 *     tags:
 *       - Report
 *     description: |
 *       Fetches paginated data for the specified module with optional entity status filtering.
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
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['checklist']
 *           example: 'checklist'
 *         description: The module to fetch data for.
 *       - in: query
 *         name: entityStatus
 *         schema:
 *           type: string
 *           example: 'completed'
 *         description: Optional filter for the entity status.
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageLimit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: Paginated data for the specified module
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPageCount:
 *                   type: integer
 *                   example: 5
 *                 totalDataCount:
 *                   type: integer
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d5f50d8f1b2c001c8e4b3a"
 *                       name:
 *                         type: string
 *                         example: "Sample Checklist"
 *                       checklistNumber:
 *                         type: string
 *                         example: "123"
 *                       startDateAndTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T09:00:00Z"
 *                       endDateAndTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-31T17:00:00Z"
 *       400:
 *         description: Bad request or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide module"
 *                 errorInfo:
 *                   type: string
 *                   example: "Please provide module"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/v1/reports/create-report:
 *   post:
 *     summary: Create a new report
 *     tags:
 *       - Report
 *     description: Generates a new report based on the provided data.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleName:
 *                 type: string
 *                 example: "checklist"
 *               moduleEntityName:
 *                 type: string
 *                 example: "Safety Checklist"
 *               moduleEntityId:
 *                 type: string
 *                 example: "60d5f50d8f1b2c001c8e4b3a"
 *               startDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T09:00:00Z"
 *               endDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-31T17:00:00Z"
 *               format:
 *                 type: string
 *                 example: "pdf"
 *     responses:
 *       200:
 *         description: For creating report according to given start and end date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report created successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                      docId:
 *                       type: string
 *                       example: "60d5f50d8f1b2c001c8e4b3a"
 *                      url:
 *                       type: string
 *                       example: "https://example.com/download/60d5f50d8f1b2c001c8e4b3a"
 *       400:
 *         description: Bad request or unsupported format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client side error"
 *                 errorInfo:
 *                   type: string
 *                   example: "Format is not supported"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /api/v1/reports/count:
 *   get:
 *     summary: Get Report Count
 *     tags:
 *       - Report
 *     description: |
 *       Get Report count .
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
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *     responses:
 *       '200':
 *         description: Successfully retrieved report count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report status count details
 *                 result:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *       '400':
 *         description: BusinessUnit Id must be a non-empty string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit Id must be a non-empty string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (1)':
 *         description: Failed! BusinessUnit does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! BusinessUnit does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (2)':
 *         description: Error occurred while fetching report count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error occurred while fetching report count
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (3)':
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (4)':
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required parameters
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/reports/listing:
 *   get:
 *     summary: Get Reports
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of records per page
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter reports by module name
 *       - in: query
 *         name: allData
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Flag to fetch all data without pagination
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         required: false
 *         description: The Business Unit ID (required if not set in request scope)
 *     responses:
 *       '200':
 *         description: Successfully retrieved reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: reports
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: []
 *       '200 (1)':
 *         description: No reports are available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No reports are available
 *                 result:
 *                   type: array
 *                   example: []
 *       '400':
 *         description: BusinessUnit Id must be a non-empty string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit Id must be a non-empty string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (1)':
 *         description: Failed! BusinessUnit does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! BusinessUnit does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (2)':
 *         description: Error occurred while fetching reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error occurred while fetching reports
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (3)':
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (4)':
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required parameters
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/reports/{reportId}:
 *   get:
 *     summary: Get Report Details
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report to fetch details for
 *     responses:
 *       '200':
 *         description: Successfully retrieved report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report details
 *                 result:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: Please Provide correct report id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please Provide correct report id
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '400 (1)':
 *         description: Error occurred while fetching report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error occurred while fetching report details
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/reports/{reportId}:
 *   patch:
 *     summary: Approve Report
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authentication
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report to approve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "approved"
 *     responses:
 *       '200':
 *         description: Report status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report status updated successfully."
 *                 status:
 *                   type: string
 *                   example: "approved"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide correct status or Report approval failed"
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
 *                   example: "Some internal server error occurred."
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/reports/{reportId}/regenerate:
 *   patch:
 *     summary: Regenerate a report
 *     description: |
 *       Updates an existing report identified by `reportId` for the authenticated user, regenerating its document and 
 *       setting the status to 'pendingForApproval'. 
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the report to regenerate (MongoDB ObjectId).
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
 *         description: Report regenerated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Report regenerated successfully"
 *               result: {}
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingReportId:
 *                 value:
 *                   message: "Please pass reportId"
 *                   errorInfo: null
 *               InvalidReportId:
 *                 value:
 *                   message: "Failed! ReportId is not valid"
 *                   errorInfo: null
 *               ReportNotFound:
 *                 value:
 *                   message: "Report doesn't exists"
 *                   errorInfo: null
 *               InvalidModuleEntity:
 *                 value:
 *                   message: "Report regeneration failed! Log not present."
 *                   errorInfo: null
 *               InvalidTimeRange:
 *                 value:
 *                   message: "The time entered is invalid, or there are no completed entries for this log. Please check and try again."
 *                   errorInfo: null
 *               InvalidEndDate:
 *                 value:
 *                   message: "Please enter end date less than and equal to current date"
 *                   errorInfo: null
 *               UnsupportedFormat:
 *                 value:
 *                   message: "Format is not supported"
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
 * /api/v1/reports/{reportId}/comments:
 *   get:
 *     summary: Retrieve comments for a report
 *     description: |
 *       Fetches all comments associated with a specific report identified by `reportId`. 
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the report to retrieve comments for (MongoDB ObjectId).
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
 *         description: Number of comments per page (defaults to total number of comments if not specified).
 *     responses:
 *       '200':
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "All comments"
 *               result:
 *                 page: 1
 *                 totalPages: 2
 *                 totalRecords: 5
 *                 data:
 *                   - name: "John Doe"
 *                     addedAt: "2025-04-11T10:00:00.000Z"
 *                     comment: "Needs clarification on section 2."
 *                     profilePhoto: ""
 *                   - name: "Jane Smith"
 *                     addedAt: "2025-04-11T12:00:00.000Z"
 *                     comment: "Updated data as requested."
 *                     profilePhoto: ""
 *       '400':
 *         description: Bad request – validation errors or access denied
 *         content:
 *           application/json:
 *             examples:
 *               InvalidReportId:
 *                 value:
 *                   message: "Please added correct report id"
 *                   errorInfo: null
 *               ReportNotFoundOrNoAccess:
 *                 value:
 *                   message: "Some error occurred"
 *                   errorInfo: null
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
 *                   message: "Some error occurred"
 *                   errorInfo: {}
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
 * /api/v1/reports/{reportId}/comments:
 *   patch:
 *     summary: Add a comment to a report
 *     description: |
 *       Adds a new comment to a specific report identified by `reportId`. 
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the report to add a comment to (MongoDB ObjectId).
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
 *               comment:
 *                 type: string
 *                 description: The comment to add to the report.
 *                 example: "Needs clarification on section 2."
 *             required:
 *               - comment
 *     responses:
 *       '200':
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Comment added successfully"
 *               result: {}
 *       '400':
 *         description: Bad request – validation errors or access denied
 *         content:
 *           application/json:
 *             examples:
 *               InvalidReportId:
 *                 value:
 *                   message: "Please added correct report id"
 *                   errorInfo: null
 *               InvalidComment:
 *                 value:
 *                   message: "Please add valid comment"
 *                   errorInfo: null
 *               NoAccess:
 *                 value:
 *                   message: "You do not have the necessary access rights to perform this update."
 *                   errorInfo: null
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
 *                   message: "An error occurred"
 *                   errorInfo: {}
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
 * /reports/{reportId}/history:
 *   get:
 *     summary: Fetch report history by ID
 *     tags:
 *       - Report
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report to fetch history for
 *     responses:
 *       '200':
 *         description: Successfully fetched report history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report history fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: [{"file": "image1.jpg"}, {"file": "image2.png"}]
 *       '400':
 *         description: Bad request (Invalid or missing reportId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! ReportId is not valid or missing
 *       '404':
 *         description: No history found for the report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No history for this report.
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
