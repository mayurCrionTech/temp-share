/**
 * @swagger
 * /api/v1/logs:
 *   post:
 *     summary: Create a new log entry
 *     tags:
 *       - Log 
 *     description: |
 *       Creates a new log entry with the specified details. 
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
 *       - in: query
 *         name: isDraft
 *         required: true
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Indicates whether the log is a draft (`true`) or completed (`false`).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - departments
 *               - assignees
 *               - startDateAndTime
 *               - endDateAndTime
 *               - assetId
 *               - businessUnit
 *               - approvers
 *               - emailNotificationRecipients
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the log.
 *                 example: "Maintenance Log"
 *               documentNumber:
 *                 type: string
 *                 description: Unique document number for the log.
 *                 example: "DOC-12345"
 *               assetId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: ID of the asset associated with the log (MongoDB ObjectId).
 *                 example: "507f1f77bcf86cd799439011"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of department IDs (MongoDB ObjectIds).
 *                 example: ["507f191e810c19729de860ea"]
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of team IDs (MongoDB ObjectIds).
 *                 example: ["507f191e810c19729de860eb"]
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of assignee user IDs (MongoDB ObjectIds).
 *                 example: ["507f191e810c19729de860ec"]
 *               approvers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of approver user IDs (MongoDB ObjectIds).
 *                 example: ["507f191e810c19729de860ed"]
 *               emailNotificationRecipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of user IDs to receive email notifications (MongoDB ObjectIds).
 *                 example: ["507f191e810c19729de860ee"]
 *               startDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the log (ISO 8601).
 *                 example: "2025-04-10T10:00:00Z"
 *               endDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the log (ISO 8601).
 *                 example: "2025-04-10T12:00:00Z"
 *               businessUnit:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: Business Unit ID (MongoDB ObjectId), can be set via query or body.
 *                 example: "507f1f77bcf86cd799439012"
 *               isRecurrence:
 *                 type: boolean
 *                 description: Indicates if the log has a recurrence pattern.
 *                 example: true
 *               recurrenceDetails:
 *                 type: object
 *                 properties:
 *                   timePeriod:
 *                     type: string
 *                     enum: [hour, day, week, month]
 *                     description: Recurrence interval.
 *                     example: "week"
 *                   recurrOn:
 *                     type: string
 *                     description: Specific recurrence detail (e.g., time for hourly/daily).
 *                     example: "08:00"
 *                   occurDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     description: Days of the week for weekly recurrence (lowercase).
 *                     example: ["monday", "wednesday"]
 *                   specificDay:
 *                     type: string
 *                     format: date-time
 *                     description: Specific day for monthly recurrence (ISO 8601).
 *                     example: "2025-04-10T00:00:00Z"
 *                 description: Details of the recurrence pattern, required if `isRecurrence` is true.
 *               isScheduleReport:
 *                 type: boolean
 *                 description: Indicates if a report should be scheduled (requires recurrence).
 *                 example: true
 *               scheduledReportDetails:
 *                 type: object
 *                 properties:
 *                   timePeriod:
 *                     type: string
 *                     enum: [day]
 *                     description: Scheduling period for the report.
 *                     example: "day"
 *                   recurrOn:
 *                     type: string
 *                     description: Specific time or detail for report scheduling.
 *                     example: "08:00"
 *                 description: Details of the scheduled report, required if `isScheduleReport` is true.
 *     responses:
 *       '201':
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log created successfully"
 *               result:
 *                 logId: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingIsDraft:
 *                 value:
 *                   message: "Please add isDraft query in request query"
 *                   errorInfo: {}
 *               InvalidAssetId:
 *                 value:
 *                   message: "Please provide a valid assetId"
 *                   errorInfo: null
 *               LogNameExists:
 *                 value:
 *                   message: "Log name already exist"
 *                   errorInfo: null
 *               DuplicateDocNumber:
 *                 value:
 *                   message: "Log document number already exist"
 *                   errorInfo: null
 *               InvalidDates:
 *                 value:
 *                   message: "Please check. The log end date can't be earlier than the start date"
 *                   errorInfo: null
 *               MissingRequiredField:
 *                 value:
 *                   message: "Please enter both start and end dates and times"
 *                   errorInfo: null
 *               InvalidRecurrence:
 *                 value:
 *                   message: "Please provide valid recurrenceDetails"
 *                   errorInfo: null
 *               ScheduleWithoutRecurrence:
 *                 value:
 *                   message: "You can't schedule report without recurrence"
 *                   errorInfo: null
 *               InvalidScheduledReport:
 *                 value:
 *                   message: "Please provide valid scheduledReportDetails"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               MissingStartDateForRecurrence:
 *                 value:
 *                   message: "Please provide startDateAndTime"
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
 * /api/v1/logs/create-template:
 *   post:
 *     summary: Create a new template
 *     tags:
 *       - Log 
 *     description: |
 *       Creates a new template, either as a general template or tied to a specific log.
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
 *       - in: query
 *         name: isGeneralTemplate
 *         required: true
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Indicates whether the template is general (`true`) or log-specific (`false`).
 *       - in: query
 *         name: logId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the log (MongoDB ObjectId) to associate with the template. Required if `isGeneralTemplate` is `false`.
 *       - in: query
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the template (required if `isGeneralTemplate` is `true`).
 *                 example: "General Maintenance Template"
 *               businessUnit:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: Business Unit ID (MongoDB ObjectId), can be set via query or body.
 *                 example: "507f1f77bcf86cd799439012"
 *               dataSets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     asset:
 *                       type: string
 *                       pattern: ^[0-9a-fA-F]{24}$
 *                       description: Optional asset ID (MongoDB ObjectId) associated with the dataset.
 *                       example: "507f1f77bcf86cd799439011"
 *                     type:
 *                       type: string
 *                       enum: [multiplechoice, checkboxes, dropdown, text, number]
 *                       description: Type of the dataset field.
 *                       example: "multiplechoice"
 *                     fieldValue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             description: Value for the field option.
 *                             example: "Option A"
 *                       description: Options for `multiplechoice`, `checkboxes`, or `dropdown` types.
 *                 description: List of datasets defining the template structure.
 *                 example: 
 *                   - asset: "507f1f77bcf86cd799439011"
 *                     type: "multiplechoice"
 *                     fieldValue: [{ value: "Option A" }, { value: "Option B" }]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: List of image IDs (MongoDB ObjectIds) associated with the template.
 *                 example: ["507f191e810c19729de860ea"]
 *               note:
 *                 type: string
 *                 description: Optional note for the template or log structure.
 *                 example: "Check equipment weekly"
 *             required:
 *               - businessUnit
 *               - dataSets
 *     responses:
 *       '201':
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             examples:
 *               GeneralTemplate:
 *                 value:
 *                   message: "Template has been saved successfully."
 *                   result:
 *                     templateId: "64a62cdbe341fa456e123abc"
 *               LogSpecificTemplate:
 *                 value:
 *                   message: "Template has been saved successfully."
 *                   result:
 *                     structureId: "64a62cdbe341fa456e123abd"
 *                     templateId: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingIsGeneralTemplate:
 *                 value:
 *                   message: "Please provide isGeneralTemplate status in request query"
 *                   errorInfo: {}
 *               MissingLogId:
 *                 value:
 *                   message: "Please provide logId in request query"
 *                   errorInfo: {}
 *               InvalidLogId:
 *                 value:
 *                   message: "Please provide valid logId"
 *                   errorInfo: null
 *               LogNotInDraft:
 *                 value:
 *                   message: "Log structure already defined"
 *                   errorInfo: null
 *               MissingLogFields:
 *                 value:
 *                   message: "Please fill in all the mandatory fields for the log first."
 *                   errorInfo: null
 *               ExistingLogStructure:
 *                 value:
 *                   message: "Log structure already defined"
 *                   errorInfo: null
 *               InvalidTemplateStructure:
 *                 value:
 *                   message: "Please provide valid dataSets"
 *                   errorInfo: null
 *               InvalidAssetId:
 *                 value:
 *                   message: "Please provide correct assetId"
 *                   errorInfo: null
 *               InvalidImages:
 *                 value:
 *                   message: "Please provide valid images"
 *                   errorInfo: null
 *               MissingTemplateName:
 *                 value:
 *                   message: "Please provide name for template"
 *                   errorInfo: null
 *               DuplicateTemplateName:
 *                 value:
 *                   message: "Duplicate template name, Please change the template name!"
 *                   errorInfo: null
 *               BusinessUnitMissing:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               ValidationError:
 *                 value:
 *                   message: "Validation error :Please check fields"
 *                   errorInfo: "Field validation failed"
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
 * /api/v1/logs/entries:
 *   get:
 *     summary: Retrieve all log entries
 *     description: |
 *       Fetches log entries based on provided query parameters. 
 *     tags:
 *       - Log
 * 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assetId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Filter entries by asset ID (MongoDB ObjectId).
 *       - in: query
 *         name: logId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Filter entries by log ID (MongoDB ObjectId).
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Filter entries by user ID (MongoDB ObjectId). If omitted, defaults to authenticated user.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           Filter entries by status (e.g., "scheduled", "completed"). Supports comma-separated values 
 *           (e.g., "scheduled,pendingForApproval"). Case-insensitive; "pendingforapproval" is normalized.
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
 *       - in: query
 *         name: allData
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to include all data in the response (specific implementation-dependent).
 *       - in: query
 *         name: allDetails
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to include detailed information (specific implementation-dependent).
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
 *         description: Log entries retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               WithEntries:
 *                 value:
 *                   message: "Log entries"
 *                   result:
 *                     data:
 *                       - _id: "64a62cdbe341fa456e123abc"
 *                         logId: "507f1f77bcf86cd799439011"
 *                         assetId: "507f1f77bcf86cd799439012"
 *                         operatorIds: ["507f191e810c19729de860ea"]
 *                         status: "scheduled"
 *                         entryCreatedAt: "2025-04-09T10:00:00Z"
 *                     total: 1
 *                     page: 1
 *                     limit: 15
 *               NoEntries:
 *                 value:
 *                   message: "No entries"
 *                   result: []
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidQuery:
 *                 value:
 *                   message: "Please provide correct query.Correct queries are assetId,logId,userId,status,page,limit,allData,allDetails"
 *                   errorInfo: {}
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
 * /api/v1/logs/fill-entries/{entryId}:
 *   patch:
 *     summary: Fill a log entry
 *     description: |
 *       Updates a specific log entry with provided data. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to fill (MongoDB ObjectId).
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
 *                       description: Unique index of the dataset within the entry.
 *                       example: 0
 *                     type:
 *                       type: string
 *                       enum: [text, date, number, multiplechoice, checkboxes, dropdown]
 *                       description: Type of the dataset field.
 *                       example: "number"
 *                     fieldValue:
 *                       oneOf:
 *                         - type: string
 *                           description: Value for text or date fields.
 *                           example: "42"
 *                         - type: number
 *                           description: Value for number fields.
 *                           example: 42
 *                         - type: array
 *                           items:
 *                             type: string
 *                           description: Array of IDs for multiplechoice, checkboxes, or dropdown fields.
 *                           example: ["option1"]
 *                       description: Value(s) for the field, type-dependent.
 *                     breakDown:
 *                       type: boolean
 *                       description: Indicates if the field is marked as broken down (optional).
 *                       example: false
 *                   required:
 *                     - index
 *                     - type
 *                 description: Array of datasets to fill the entry, matching the entry's structure.
 *                 example:
 *                   - index: 0
 *                     type: "number"
 *                     fieldValue: 42
 *                     breakDown: false
 *                   - index: 1
 *                     type: "multiplechoice"
 *                     fieldValue: ["option1"]
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
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               DataLengthMismatch:
 *                 value:
 *                   message: "Request data is not correct"
 *                   errorInfo: null
 *               NoRelatedLog:
 *                 value:
 *                   message: "Related to this entry no log exists."
 *                   errorInfo: null
 *               AccessDenied:
 *                 value:
 *                   message: "You don't have access to fill entry"
 *                   errorInfo: null
 *               DuplicateIndexes:
 *                 value:
 *                   message: "Please provide correct data , two indexes can't be same"
 *                   errorInfo: null
 *               MissingIndex:
 *                 value:
 *                   message: "Index is required in request data"
 *                   errorInfo: null
 *               MissingType:
 *                 value:
 *                   message: "Type is required in index 0"
 *                   errorInfo: null
 *               IncorrectType:
 *                 value:
 *                   message: "Please provide correct type of index 0"
 *                   errorInfo: null
 *               EmptyFieldValue:
 *                 value:
 *                   message: "Field value for index 0 cannot be empty"
 *                   errorInfo: null
 *               InvalidFieldStructure:
 *                 value:
 *                   message: "Field value for index 0 not valid structure.The type of requested field is number but valid field type is text"
 *                   errorInfo: null
 *               InvalidDate:
 *                 value:
 *                   message: "Field value for index 0 not valid date."
 *                   errorInfo: null
 *               MultipleChoiceTooMany:
 *                 value:
 *                   message: "Field value for index 0 not valid structure.You can pass only one field value"
 *                   errorInfo: null
 *               InvalidFieldValue:
 *                 value:
 *                   message: "Please provide valid field value for index 0.Provided field id is not valid"
 *                   errorInfo: null
 *               FieldValueLengthExceeded:
 *                 value:
 *                   message: "Please provide valid field value for index 0.Its length exceeds the existing field values."
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
 * /api/v1/logs:
 *   get:
 *     summary: Retrieve all logs with details
 *     description: |
 *       Fetches a paginated list of logs associated with the authenticated user. 
 *     tags:
 *       - Log 
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
 *         description: Number of logs per page.
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter logs by name (case-insensitive partial match).
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
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "logs"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 1
 *                 totalDataCount: 2
 *                 data:
 *                   - _id: "64a62cdbe341fa456e123abc"
 *                     generalDetails:
 *                       _id: "64a62cdbe341fa456e123abc"
 *                       logNumber: 1
 *                       name: "Maintenance Log"
 *                       documentNumber: "DOC-123"
 *                       isRecurrence: false
 *                       timePeriod: null
 *                       templatesStatus: "scheduled"
 *                       asset: "Compressor A"
 *                       departments: ["Engineering"]
 *                       assignees: ["John Doe"]
 *                       approvers: ["Jane Smith"]
 *                       emailNotificationRecipients: ["Alice Johnson"]
 *                       teams: ["Maintenance Team"]
 *                       frequency: null
 *                       createdAt: "2025-04-09T10:00:00Z"
 *                       updatedAt: "2025-04-09T10:00:00Z"
 *                       logStatus: "scheduled"
 *                       note: "Weekly check"
 *                     templateStatuses:
 *                       - status: "scheduled"
 *                         count: 1
 *                     structureId: "64a62cdbe341fa456e123abd"
 *                     version: 1
 *       '400':
 *         description: Bad request – validation errors or no logs
 *         content:
 *           application/json:
 *             examples:
 *               NoLogsAvailable:
 *                 value:
 *                   message: "No logs are available"
 *                   errorInfo: {}
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
 * /api/v1/logs/{logId}:
 *   get:
 *     summary: Retrieve details of a specific log
 *     description: |
 *       Fetches detailed information for a specific log identified by `logId`, accessible to the authenticated user 
 *       (as creator, assignee, or approver). 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to retrieve (MongoDB ObjectId).
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
 *         description: Log details retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log details"
 *               result:
 *                 _id: "64a62cdbe341fa456e123abc"
 *                 generalDetails:
 *                   _id: "64a62cdbe341fa456e123abc"
 *                   logNumber: 1
 *                   name: "Maintenance Log"
 *                   documentNumber: "DOC-123"
 *                   isRecurrence: false
 *                   timePeriod: null
 *                   templatesStatus: "scheduled"
 *                   asset: "Compressor A"
 *                   departments: ["Engineering"]
 *                   assignees: ["John Doe"]
 *                   approvers: ["Jane Smith"]
 *                   emailNotificationRecipients: ["Alice Johnson"]
 *                   teams: ["Maintenance Team"]
 *                   frequency: null
 *                   createdAt: "2025-04-09T10:00:00Z"
 *                   updatedAt: "2025-04-09T10:00:00Z"
 *                   logStatus: "scheduled"
 *                   note: "Weekly check"
 *                 templateStatuses:
 *                   - status: "scheduled"
 *                     count: 1
 *                 structureId: "64a62cdbe341fa456e123abd"
 *                 version: 1
 *       '400':
 *         description: Bad request – validation errors or no log found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Please provide valid logId."
 *                   errorInfo: {}
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
 * /api/v1/logs/{logId}/entries:
 *   get:
 *     summary: Retrieve log entries for a specific log
 *     description: |
 *       Fetches a paginated list of log entries for a specified `logId`, accessible to the authenticated user 
 *       (as creator or assignee, depending on customization settings). 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to retrieve entries for (MongoDB ObjectId).
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
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter entries by status (e.g., "scheduled", "pendingForApproval").
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
 *         description: Log entries retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               WithEntries:
 *                 value:
 *                   message: "Entries related to the log"
 *                   result:
 *                     currentPage: 1
 *                     totalPageCount: 1
 *                     totalDataCount: 2
 *                     data:
 *                       - logId: "64a62cdbe341fa456e123abc"
 *                         entryNumber: 1
 *                         entryCreatedAt: "2025-04-09T10:00:00Z"
 *                         status: "scheduled"
 *                         updatedBy: "John Doe"
 *                         createdAt: "2025-04-09T10:00:00Z"
 *                         createdBy: "Jane Smith"
 *               NoEntries:
 *                 value:
 *                   message: "No entries"
 *                   result: []
 *       '400':
 *         description: Bad request – validation errors or access issues
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Please provide valid logId."
 *                   errorInfo: {}
 *               LogNotFound:
 *                 value:
 *                   message: "Please provide valid logId"
 *                   errorInfo: null
 *               AccessDenied:
 *                 value:
 *                   message: "You don't have access to the entries"
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
 * /api/v1/logs/{logId}/versions:
 *   get:
 *     summary: Retrieve versions of a specific log
 *     description: |
 *       Fetches a paginated list of log structure versions for a specified `logId`.
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to retrieve versions for (MongoDB ObjectId).
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
 *         description: Log versions retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               WithVersions:
 *                 value:
 *                   message: "Log versions"
 *                   result:
 *                     currentPage: 1
 *                     totalPageCount: 1
 *                     totalDataCount: 2
 *                     data:
 *                       - _id: "64a62cdbe341fa456e123abd"
 *                         logId: "64a62cdbe341fa456e123abc"
 *                         version: 1
 *                         createdBy: "507f191e810c19729de860ea"
 *                         createdAt: "2025-04-09T10:00:00Z"
 *                       - _id: "64a62cdbe341fa456e123abe"
 *                         logId: "64a62cdbe341fa456e123abc"
 *                         version: 2
 *                         createdBy: "507f191e810c19729de860ea"
 *                         createdAt: "2025-04-10T10:00:00Z"
 *               NoVersions:
 *                 value:
 *                   message: "No versions"
 *                   result: []
 *       '400':
 *         description: Bad request – validation errors or no log found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Please provide valid logId."
 *                   errorInfo: {}
 *               LogNotFound:
 *                 value:
 *                   message: "Please provide valid logId"
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
 * /api/v1/log/entry-status:
 *   patch:
 *     summary: Update status of log entries
 *     description: |
 *       Updates the status of one or more log entries specified by `entryIds`. 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of log entry IDs to update (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123abc"]
 *               status:
 *                 type: string
 *                 enum: ["revised", "approved", "completed"]
 *                 description: The new status for the entries.
 *                 example: "approved"
 *               comment:
 *                 type: string
 *                 description: Comment required when status is "revised".
 *                 example: "Revised due to incorrect data"
 *             required:
 *               - entryIds
 *               - status
 *     responses:
 *       '200':
 *         description: Entry status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Entry status is updated"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors or access issues
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryIds:
 *                 value:
 *                   message: "Please provide valid entryId(s)."
 *                   errorInfo: {}
 *               InvalidStatus:
 *                 value:
 *                   message: "Please provide correct status"
 *                   errorInfo: {}
 *               AccessDenied:
 *                 value:
 *                   message: "You do not have the necessary access rights to perform this update."
 *                   errorInfo: null
 *               MissingComment:
 *                 value:
 *                   message: "Please add comment"
 *                   errorInfo: null
 *               UpdateFailed:
 *                 value:
 *                   message: "Entry status is not updated"
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
 * /api/v1/log/entry/{entryId}:
 *   get:
 *     summary: Retrieve details of a specific log entry
 *     description: |
 *       Fetches detailed information for a specific log entry identified by `entryId`.
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to retrieve (MongoDB ObjectId).
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
 *         description: Log entry details retrieved successfully or no entry found
 *         content:
 *           application/json:
 *             examples:
 *               WithDetails:
 *                 value:
 *                   message: "Log entry details"
 *                   result:
 *                     logEntry:
 *                       _id: "64a62cdbe341fa456e123abc"
 *                       entryNumber: 1
 *                       entryCreatedAt: "2025-04-09T10:00:00Z"
 *                       logId: "64a62cdbe341fa456e123abd"
 *                       status: "scheduled"
 *                       approvers: ["Jane Smith"]
 *                       approvedBy: []
 *                       updatedBy: "John Doe"
 *                       createdAt: "2025-04-09T10:00:00Z"
 *                       updatedAt: "2025-04-09T10:00:00Z"
 *                       data:
 *                         - index: 0
 *                           type: "number"
 *                           fieldValue: 42
 *                           asset: "Compressor A"
 *                       templateId: "64a62cdbe341fa456e123abe"
 *                     logDetails:
 *                       _id: "64a62cdbe341fa456e123abd"
 *                       logNumber: 1
 *                       name: "Maintenance Log"
 *                       documentNumber: "DOC-123"
 *                       isRecurrence: false
 *                       timePeriod: null
 *                       templatesStatus: "scheduled"
 *                       asset: "Compressor A"
 *                       departments: ["Engineering"]
 *                       assignees: ["John Doe"]
 *                       approvers: ["Jane Smith"]
 *                       emailNotificationRecipients: ["Alice Johnson"]
 *                       createdAt: "2025-04-09T09:00:00Z"
 *                       updatedAt: "2025-04-09T09:00:00Z"
 *                       logStatus: "scheduled"
 *                       isActive: true
 *                       startDateAndTime: "2025-04-09T08:00:00Z"
 *                       endDateAndTime: "2025-04-09T12:00:00Z"
 *                       recurrenceDetails: null
 *                       userSpecificDetails: {}
 *                       description: "Routine maintenance"
 *                       teams: ["Maintenance Team"]
 *                     image: null
 *                     note: "Weekly check"
 *               NoEntry:
 *                 value:
 *                   message: "No entries available"
 *                   result: {}
 *       '400':
 *         description: Bad request – validation errors or retrieval failure
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide valid entryId."
 *                   errorInfo: {}
 *               RetrievalFailed:
 *                 value:
 *                   message: "Add correct entryId"
 *                   errorInfo: "Failed to retrieve entry details"
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
 *                   message: "Add correct entryId"
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
 * /api/v1/logs/logstatus/{count}:
 *   get:
 *     summary: Retrieve log status counts
 *     description: |
 *       Fetches counts of logs and their statuses for the authenticated user (as creator or assignee).
 *     tags:
 *       - Log 
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
 *         description: Log status counts retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log status count details"
 *               result:
 *                 total: 5
 *                 completed: 2
 *                 pendingForApproval: 1
 *       '400':
 *         description: Bad request – validation errors or client-side issues
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
 *               ClientSideError:
 *                 value:
 *                   message: "Client side error"
 *                   errorInfo: "Failed to get status count for log: some error"
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
 * /api/v1/logs/general/{templates}:
 *   get:
 *     summary: Retrieve all log templates
 *     description: |
 *       Fetches a paginated list of log templates associated with the authenticated user's business unit. 
 *     tags:
 *       - Log
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
 *         description: Number of templates per page.
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
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             examples:
 *               WithTemplates:
 *                 value:
 *                   message: "All the templates"
 *                   result:
 *                     currentPage: 1
 *                     totalPageCount: 1
 *                     totalDataCount: 2
 *                     data:
 *                       - _id: "64a62cdbe341fa456e123abc"
 *                         name: "Maintenance Template"
 *                         businessUnit: "64a62cdbe341fa456e123abd"
 *                         createdAt: "2025-04-09T10:00:00Z"
 *                       - _id: "64a62cdbe341fa456e123abe"
 *                         name: "Inspection Template"
 *                         businessUnit: "64a62cdbe341fa456e123abd"
 *                         createdAt: "2025-04-10T10:00:00Z"
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
 * /api/v1/logs/{logId}:
 *   patch:
 *     summary: Update log details
 *     description: |
 *       Updates the details of a specific log identified by `logId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to update (MongoDB ObjectId).
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
 *                 description: The name of the log (must be unique).
 *                 example: "Maintenance Log"
 *               documentNumber:
 *                 type: string
 *                 description: The document number of the log (must be unique).
 *                 example: "DOC-123"
 *               assetId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: The ID of the associated asset (MongoDB ObjectId).
 *                 example: "64a62cdbe341fa456e123abe"
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of department IDs (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123abf"]
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of assignee user IDs (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123ac0"]
 *               approvers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of approver user IDs (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123ac1"]
 *               emailNotificationRecipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of email notification recipient user IDs (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123ac2"]
 *               startDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the log.
 *                 example: "2025-04-09T08:00:00Z"
 *               endDateAndTime:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the log.
 *                 example: "2025-04-09T12:00:00Z"
 *               isDraft:
 *                 type: boolean
 *                 description: Whether the log remains a draft (defaults to true).
 *                 example: false
 *               recurrenceDetails:
 *                 type: object
 *                 description: Recurrence details (ignored if isDraft is true).
 *                 example: { frequency: "weekly" }
 *               userSpecificDetails:
 *                 type: object
 *                 description: User-specific details (ignored if isDraft is true).
 *                 example: { customField: "value" }
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: Log updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log update"
 *               result: "Log updated successfully"
 *       '400':
 *         description: Bad request – validation errors or conflicts
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Please provide valid logId."
 *                   errorInfo: {}
 *               LogNotFound:
 *                 value:
 *                   message: "Please provide correct logId"
 *                   errorInfo: null
 *               DuplicateName:
 *                 value:
 *                   message: "Log name already exist"
 *                   errorInfo: null
 *               DuplicateDocumentNumber:
 *                 value:
 *                   message: "Log document number already exist"
 *                   errorInfo: null
 *               ValidationError:
 *                 value:
 *                   message: "Request body validation error"
 *                   errorInfo: "Please choose one or more departments."
 *               DuplicateKeyError:
 *                 value:
 *                   message: "Duplicate key error: name already exists."
 *                   errorInfo: {}
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
 * /api/v1/log-structures/{structureId}:
 *   patch:
 *     summary: Update log structure details
 *     description: |
 *       Updates the details of a specific log structure identified by `structureId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: structureId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log structure to update (MongoDB ObjectId).
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
 *                       description: Index of the dataset.
 *                     type:
 *                       type: string
 *                       description: Type of the dataset field (e.g., number, text).
 *                     fieldValue:
 *                       type: string
 *                       description: Value of the dataset field.
 *                   description: Array of datasets for the new template.
 *                 example: [{ index: 0, type: "number", fieldValue: "42" }]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs or references (optional).
 *                 example: ["http://example.com/image1.jpg"]
 *               note:
 *                 type: string
 *                 description: Note for the log structure (optional).
 *                 example: "Updated for Q2 maintenance"
 *             required:
 *               - dataSets
 *     responses:
 *       '200':
 *         description: Log structure updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log structure updated successfully"
 *               result:
 *                 structureId: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors or structure not found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidStructureId:
 *                 value:
 *                   message: "Please provide valid structureId."
 *                   errorInfo: {}
 *               StructureNotFound:
 *                 value:
 *                   message: "Invalid structureId."
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
 * /api/v1/log-structures/{structureId}/version:
 *   get:
 *     summary: Retrieve version details of a log structure
 *     description: |
 *       Fetches detailed information for a specific log structure version identified by `structureId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: structureId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log structure to retrieve version details for (MongoDB ObjectId).
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
 *                   images: ["http://example.com/image1.jpg"]
 *                   note: "Version for Q2 maintenance"
 *                   dataSets:
 *                     - index: 0
 *                       type: "number"
 *                       fieldValue: "42"
 *                   templateId: "64a62cdbe341fa456e123abd"
 *       '400':
 *         description: Bad request – validation errors or no version found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidStructureId:
 *                 value:
 *                   message: "Please provide valid structureId."
 *                   errorInfo: {}
 *               NoVersionDetails:
 *                 value:
 *                   message: "No version details available"
 *                   errorInfo: {}
 *               StructureNotFound:
 *                 value:
 *                   message: "Please provide valid structure id."
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
 * /api/v1/templates/{templateId}:
 *   get:
 *     summary: Retrieve details of a specific template
 *     description: |
 *       Fetches detailed information for a specific log template identified by `templateId`. 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the template to retrieve details for (MongoDB ObjectId).
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
 *                   - index: 0
 *                     type: "number"
 *                     fieldValue: "42"
 *                   - index: 1
 *                     type: "text"
 *                     fieldValue: "Routine check"
 *                 createdBy: "507f191e810c19729de860ea"
 *       '400':
 *         description: Bad request – validation errors or no template found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidTemplateId:
 *                 value:
 *                   message: "Please provide valid templateId."
 *                   errorInfo: {}
 *               TemplateNotFound:
 *                 value:
 *                   message: "No template exists"
 *                   errorInfo: {}
 *               InvalidTemplateIdFromGet:
 *                 value:
 *                   message: "Please provide valid template id"
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
 * /api/v1/templates/{templateId}:
 *   patch:
 *     summary: Update template details
 *     description: |
 *       Updates the details of a specific log template identified by `templateId`. 
 *     tags:
 *       - Log
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
 *                 description: The name of the template (must be unique if provided).
 *                 example: "Updated Maintenance Template"
 *               dataSets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     index:
 *                       type: integer
 *                       description: Index of the dataset.
 *                     type:
 *                       type: string
 *                       description: Type of the dataset field (e.g., number, text).
 *                     fieldValue:
 *                       type: string
 *                       description: Value of the dataset field.
 *                   description: Array of datasets for the template (optional).
 *                 example: [{ index: 0, type: "number", fieldValue: "42" }]
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log tempalate updated successfully"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors, access issues, or conflicts
 *         content:
 *           application/json:
 *             examples:
 *               InvalidTemplateId:
 *                 value:
 *                   message: "Please provide valid templateId."
 *                   errorInfo: {}
 *               TemplateNotFound:
 *                 value:
 *                   message: "Invalid templateId."
 *                   errorInfo: null
 *               AccessDenied:
 *                 value:
 *                   message: "You don't have access to update template"
 *                   errorInfo: null
 *               DuplicateName:
 *                 value:
 *                   message: "Duplicate template name, Please change the template name!"
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
 * /api/v1/templates/{templateId}/formula:
 *   patch:
 *     summary: Update formula in template data sets
 *     description: |
 *       Updates the formula field for specific data sets within a log template identified by `templateId`.
 *     tags:
 *       - Log
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
 *               dataSets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       pattern: ^[0-9a-fA-F]{24}$
 *                       description: The ID of the data set to update (MongoDB ObjectId).
 *                     formula:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: ["constant", "reference", "formula"]
 *                           description: Type of the formula.
 *                         operation:
 *                           type: string
 *                           description: Operation for formula type (e.g., '+', '-', '*', '/').
 *                         left:
 *                           type: object
 *                           description: Left operand (recursive formula structure).
 *                         right:
 *                           type: object
 *                           description: Right operand (recursive formula structure).
 *                       description: The formula to apply to the data set.
 *                   required:
 *                     - _id
 *                     - formula
 *                 description: Array of data sets to update with new formulas.
 *                 example:
 *                   - _id: "64a62cdbe341fa456e123abc"
 *                     formula:
 *                       type: "formula"
 *                       operation: "+"
 *                       left: { type: "constant", value: "10" }
 *                       right: { type: "constant", value: "20" }
 *             required:
 *               - dataSets
 *     responses:
 *       '200':
 *         description: Template data set formula updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log tempalate data set formula updated successfully"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors or access issues
 *         content:
 *           application/json:
 *             examples:
 *               MissingTemplateId:
 *                 value:
 *                   message: "Please provide templateId."
 *                   errorInfo: {}
 *               InvalidTemplateId:
 *                 value:
 *                   message: "Invalid templateId."
 *                   errorInfo: null
 *               InvalidDataSetId:
 *                 value:
 *                   message: "Invalid _id: 64a62cdbe341fa456e123xyz"
 *                   errorInfo: null
 *               DataSetNotFound:
 *                 value:
 *                   message: "Field '64a62cdbe341fa456e123abc' not found in the template"
 *                   errorInfo: null
 *               FormulaValidationFailed:
 *                 value:
 *                   message: "Formula validation failed for '64a62cdbe341fa456e123abc': Invalid formula"
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
 * /api/v1/logs/time-periods:
 *   get:
 *     summary: Retrieve available log time periods
 *     description: |
 *       Fetches a predefined list of available time periods for logs, as defined in the `TIME_PERIOD` constant. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Time periods retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log time periods"
 *               result:
 *                 - "daily"
 *                 - "weekly"
 *                 - "monthly"
 *                 - "quarterly"
 *                 - "yearly"
 *       '400':
 *         description: Bad request – unexpected error
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *               errorInfo: {}
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
 * /api/v1/logs/field/check-uniqueness:
 *   post:
 *     summary: Check field uniqueness in logs
 *     description: |
 *       Checks if a specified field value is unique among logs within the authenticated user's business unit. 
 *     tags:
 *       - Log 
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
 *             additionalProperties: true
 *             maxProperties: 1
 *             description: A single key-value pair where the key is the field name (e.g., `name`, `documentNumber`) and the value is the string to check for uniqueness.
 *             example:
 *               name: "Maintenance Log"
 *     responses:
 *       '200':
 *         description: Value is unique
 *         content:
 *           application/json:
 *             example:
 *               message: "Value is unique"
 *               result: []
 *       '400':
 *         description: Bad request – validation errors or field not unique
 *         content:
 *           application/json:
 *             examples:
 *               FieldRequired:
 *                 value:
 *                   message: "Field <name> is required and cannot be empty"
 *                   errorInfo: {}
 *               FieldNotUnique:
 *                 value:
 *                   message: "name already exists"
 *                   errorInfo: {}
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
 * /api/v1/logs/entries/{entryId}:
 *   patch:
 *     summary: Update a log entry
 *     description: |
 *       Updates the data of a specific log entry identified by `entryId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to update (MongoDB ObjectId).
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
 *                       description: Index of the data set in the entry.
 *                     type:
 *                       type: string
 *                       enum: ["text", "date", "number", "multiplechoice", "dropdown", "checkboxes"]
 *                       description: Type of the data set field.
 *                     fieldValue:
 *                       oneOf:
 *                         - type: string
 *                         - type: number
 *                         - type: array
 *                           items:
 *                             type: string
 *                       description: Value of the data set field (varies by type).
 *                     breakDown:
 *                       type: boolean
 *                       description: Indicates if the field is in breakdown state (optional, defaults to false).
 *                   required:
 *                     - index
 *                     - type
 *                 description: Array of data sets to update in the entry.
 *                 example:
 *                   - index: 0
 *                     type: "number"
 *                     fieldValue: 42
 *                   - index: 1
 *                     type: "text"
 *                     fieldValue: "Routine check"
 *                   - index: 2
 *                     type: "checkboxes"
 *                     fieldValue: ["option1", "option2"]
 *             required:
 *               - data
 *     responses:
 *       '201':
 *         description: Entry updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Entry updated successfully"
 *               result: "64a62cdbe341fa456e123abc"
 *       '400':
 *         description: Bad request – validation errors or entry issues
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               NoDataProvided:
 *                 value:
 *                   message: "Please provide correct data"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId."
 *                   errorInfo: null
 *               LogNotFound:
 *                 value:
 *                   message: "Related to this entry no log exists."
 *                   errorInfo: null
 *               MissingIndex:
 *                 value:
 *                   message: "Index is required in request data"
 *                   errorInfo: null
 *               MissingType:
 *                 value:
 *                   message: "Type is required in index 0"
 *                   errorInfo: null
 *               TypeMismatch:
 *                 value:
 *                   message: "Please provide correct type of index 0"
 *                   errorInfo: null
 *               EmptyFieldValue:
 *                 value:
 *                   message: "Field value for index 0 cannot be empty"
 *                   errorInfo: null
 *               InvalidFieldValue:
 *                 value:
 *                   message: "Field value for index 0 not valid structure. The type of requested field is number but valid field type is text"
 *                   errorInfo: null
 *               InvalidDate:
 *                 value:
 *                   message: "Field value for index 1 not valid date."
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
 * /api/v1/logs/stats/{assetId}:
 *   get:
 *     summary: Retrieve log entry statistics for an asset
 *     description: |
 *       Fetches statistics for log entries associated with a specific asset identified by `assetId`.
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the asset to retrieve log entry stats for (MongoDB ObjectId).
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
 *         description: Log entry statistics retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Log Stats"
 *               result:
 *                 newLogs: 5
 *                 pendingForApprovals: 2
 *                 overdues: 1
 *       '400':
 *         description: Bad request – validation errors or asset not found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidAssetId:
 *                 value:
 *                   message: "Please provide correct assetId"
 *                   errorInfo: null
 *               AssetNotFound:
 *                 value:
 *                   message: "Please provide correct assetId"
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
 * /api/v1/logs/entries/{entryId}:
 *   post:
 *     summary: Upload images for a log entry
 *     description: |
 *       Uploads one or more image files (e.g., JPG, JPEG, PNG) to associate with a specific log entry identified by 
 *       `entryId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to upload images for (MongoDB ObjectId).
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
 *         name: returnMetaData
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "false"
 *         description: Whether to return full metadata for uploaded files (true) or just IDs (false).
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
 *                 description: Array of image files to upload (JPG, JPEG, PNG supported).
 *               moduleName:
 *                 type: string
 *                 description: Name of the module (e.g., "log-entry").
 *                 example: "log-entry"
 *               moduleId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: ID of the module (typically matches entryId).
 *                 example: "64a62cdbe341fa456e123abc"
 *             required:
 *               - files
 *               - moduleName
 *               - moduleId
 *     responses:
 *       '201':
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Uploaded Successfully"
 *               result: {}
 *       '207':
 *         description: Partial success – some files uploaded, some failed
 *         content:
 *           application/json:
 *             example:
 *               message: "Files uploaded partially"
 *               result: {}
 *       '400':
 *         description: Bad request – validation errors or entry issues
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId"
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
 * /api/v1/logs/{entryId}/images:
 *   post:
 *     summary: Upload images for a log entry
 *     description: |
 *       Uploads multiple image files (up to 20, JPG/JPEG/PNG only) to associate with a specific log entry identified by 
 *       `entryId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to upload images for (MongoDB ObjectId).
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
 *         name: returnMetaData
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "false"
 *         description: Whether to return full metadata for uploaded files (true) or just IDs/URLs (false).
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
 *                 description: Array of image files to upload (max 20, JPG/JPEG/PNG only).
 *               moduleName:
 *                 type: string
 *                 description: Name of the module (e.g., "log-entry"). Required if moduleId is provided.
 *                 example: "log-entry"
 *               moduleId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 description: ID of the module (typically matches entryId). Required if moduleName is provided.
 *                 example: "64a62cdbe341fa456e123abc"
 *             required:
 *               - files
 *           example:
 *             files: [binary_file1.jpg, binary_file2.png]
 *             moduleName: "log-entry"
 *             moduleId: "64a62cdbe341fa456e123abc"
 *     responses:
 *       '201':
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Uploaded Successfully"
 *               result: {}
 *       '207':
 *         description: Partial success – some files uploaded, some failed
 *         content:
 *           application/json:
 *             example:
 *               message: "Files uploaded partially"
 *               result: {}
 *       '400':
 *         description: Bad request – validation errors or upload issues
 *         content:
 *           application/json:
 *             examples:
 *               UploadError:
 *                 value:
 *                   message: "File upload error"
 *                   errorInfo: null
 *               NoFilesProvidedMultiple:
 *                 value:
 *                   message: "Files not provided"
 *                   errorInfo: null
 *               TooManyFiles:
 *                 value:
 *                   message: "You can only upload a maximum of 20 files at a time"
 *                   errorInfo: null
 *               InvalidFiles:
 *                 value:
 *                   message: "Invalid files provided"
 *                   errorInfo: null
 *               InvalidExtensionOrSize:
 *                 value:
 *                   message: "File extension not supported or file size exceeds limit"
 *                   errorInfo:
 *                     maxSize: 10485760
 *                     fileSize: 15728640
 *               NoFilesProvidedSingle:
 *                 value:
 *                   message: "File not provided"
 *                   errorInfo: null
 *               MissingModuleData:
 *                 value:
 *                   message: "Both moduleName and moduleId must be provided together"
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
 * /api/v1/log-entries/{entryId}/notes:
 *   post:
 *     summary: Add a note to a log entry
 *     description: |
 *       Adds a new note to a specific log entry identified by `entryId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to add a note to (MongoDB ObjectId).
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
 *               note:
 *                 type: string
 *                 description: The note to add to the log entry.
 *                 example: "Checked equipment status."
 *             required:
 *               - note
 *     responses:
 *       '201':
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Added Successfully"
 *               result: {}
 *       '400':
 *         description: Bad request – validation errors or entry not found
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId"
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
 * /api/v1/logs/{entryId}/images:
 *   get:
 *     summary: Retrieve images for a log entry
 *     description: |
 *       Fetches details of all images associated with a specific log entry identified by `entryId`. 
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to retrieve images for (MongoDB ObjectId).
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
 *         description: Images retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "All images"
 *               result:
 *                 - _id: "64a62cdbe341fa456e123abc"
 *                   name: "inspection_photo"
 *                   extension: "jpg"
 *                   contentType: "image/jpeg"
 *                   url: "http://example.com/files/64a62cdbe341fa456e123abc/view"
 *                   size: 524288
 *                   moduleName: "logs"
 *                   moduleId: ""
 *                   uploadedBy:
 *                     id: "507f191e810c19729de860ea"
 *                     name: "John Doe"
 *                     email: "john.doe@example.com"
 *       '400':
 *         description: Bad request – validation errors or no images
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               NoImages:
 *                 value:
 *                   message: "No image Present for this log"
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
 * /api/v1/logs/{entryId}/notes:
 *   get:
 *     summary: Retrieve notes for a log entry
 *     description: |
 *       Fetches all notes associated with a specific log entry identified by `entryId`.
 *     tags:
 *       - Log 
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to retrieve notes for (MongoDB ObjectId).
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
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "All notes"
 *               result:
 *                 - name: "John Doe"  
 *                   addedAt: "2025-04-11T10:00:00.000Z"
 *                   note: "Checked equipment status."
 *                   profilePhoto: ""
 *                 - name: "Jane Smith"
 *                   addedAt: "2025-04-11T12:00:00.000Z"
 *                   note: "Scheduled maintenance."
 *                   profilePhoto: ""
 *       '400':
 *         description: Bad request – validation errors or no notes
 *         content:
 *           application/json:
 *             examples:
 *               InvalidEntryId:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               EntryNotFound:
 *                 value:
 *                   message: "Please provide correct entryId"
 *                   errorInfo: null
 *               NoNotes:
 *                 value:
 *                   message: "No Notes for this entry."
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
 * /api/v1/logs/{logId}/pause:
 *   post:
 *     summary: Pause log entries
 *     description: |
 *       Pauses the specified log. 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: log
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to pause (MongoDB ObjectId).
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
 *         description: Log entries paused successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log Entries Paused Successfully"
 *                 result:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: "Log Entries Paused Successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation or logic errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Log id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               AlreadyPaused:
 *                 value:
 *                   message: "Log is already paused. Please resume before pausing again."
 *                   errorInfo: {}
 *               ClientError:
 *                 value:
 *                   message: "Client side error"
 *                   errorInfo: {}
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
 *         description: Log not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed! Log does not exist"
 *               errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               EmailFailure:
 *                 value:
 *                   message: "Some internal server error"
 *                   errorInfo: {}
 *               ValidationFailure:
 *                 value:
 *                   message: "Failed to validate log pause email template: [error]"
 *                   errorInfo: {}
 */

/**
 * @swagger
 * /api/v1/logs/{logId}/resume:
 *   post:
 *     summary: Resume log entries
 *     description: |
 *       Resumes a previously paused log by updating the pause entry with a resume date and sending an email notification 
 *       to the creator and recipients. 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: log
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log to resume (MongoDB ObjectId).
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
 *         description: Log entries resumed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log Entries Resumed Successfully"
 *                 result:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: "Log Entries Resumed Successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation or logic errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidLogId:
 *                 value:
 *                   message: "Log id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               AlreadyResumed:
 *                 value:
 *                   message: "Log Already resumed!"
 *                   errorInfo: {}
 *               ClientError:
 *                 value:
 *                   message: "Client side error"
 *                   errorInfo: {}
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
 *         description: Log not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed! Log does not exist"
 *               errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               EmailFailure:
 *                 value:
 *                   message: "Some internal server error"
 *                   errorInfo: {}
 *               ValidationFailure:
 *                 value:
 *                   message: "Failed to validate log resume email template: [error]"
 *                   errorInfo: {}
 */

 /**
 * @swagger
 * /api/v1/logs/{logId}/entries/{entryId}/create-report:
 *   post:
 *     summary: Initiate report generation for a single log entry
 *     description: |
 *       Initiates the generation of a PDF report for a specific log.
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log containing the entry (MongoDB ObjectId).
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry to generate a report for (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the token.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [pdf]
 *                 default: "pdf"
 *                 description: The format of the report (currently only PDF is supported).
 *           example:
 *             format: "pdf"
 *     responses:
 *       '201':
 *         description: Report generation initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report generated successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     docId:
 *                       type: string
 *                       example: "64a62cdbe341fa456e123def"
 *                     url:
 *                       type: string
 *                       example: "http://example.com/download/report.pdf"
 *                     name:
 *                       type: string
 *                       example: "LogEntryReport.pdf"
 *             example:
 *               message: "Report generated successfully"
 *               result:
 *                 docId: "64a62cdbe341fa456e123def"
 *                 url: "http://example.com/download/report.pdf"
 *                 name: "LogEntryReport.pdf"
 *       '400':
 *         description: Bad request – validation or logic errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingParams:
 *                 value:
 *                   message: "Provide logId and entryId field in req.params"
 *                   errorInfo: null
 *               InvalidIds:
 *                 value:
 *                   message: "Provide valid logId and entryId"
 *                   errorInfo: null
 *               InvalidLogId:
 *                 value:
 *                   message: "Provide valid LogId"
 *                   errorInfo: null
 *               NoCompletedEntries:
 *                 value:
 *                   message: "No completed entries found to generate the report."
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
 *             examples:
 *               ReportNotCreated:
 *                 value:
 *                   message: "Report not created"
 *                   errorInfo: {}
 *               FormatNotSupported:
 *                 value:
 *                   message: "Format is not supported"
 *                   errorInfo: {}
 *               GenericError:
 *                 value:
 *                   message: "Some internal server error"
 *                   errorInfo: {}
 */

/**
 * @swagger
 * /api/v1/logs/{logId}/entries/{entryId}/fields/{fieldId}/images:
 *   post:
 *     summary: Upload multiple images for a log entry field
 *     description: |
 *       Uploads multiple images (up to 20) for a specific log entry field, validating file extensions and sizes. 
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log (MongoDB ObjectId).
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry (MongoDB ObjectId).
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the field within the log entry (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the token.
 *       - in: query
 *         name: returnMetaData
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "false"
 *         description: Whether to return full metadata (true) or just IDs (false) for uploaded images.
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
 *                 description: Array of image files to upload (JPG, JPEG, PNG).
 *           example:
 *             files: [file1.jpg, file2.png]
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
 *                             example: "64a62cdbe341fa456e123def"
 *                           url:
 *                             type: string
 *                             nullable: true
 *                             example: "http://example.com/download/image.jpg"
 *             example:
 *               message: "Images uploaded successfully"
 *               result:
 *                 data:
 *                   - { id: "64a62cdbe341fa456e123def", url: "http://example.com/download/image.jpg" }
 *                   - { id: "64a62cdbe341fa456e123ghi" }
 *       '207':
 *         description: Images uploaded partially with some failures
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
 *                             example: "64a62cdbe341fa456e123def"
 *                           url:
 *                             type: string
 *                             nullable: true
 *                             example: "http://example.com/download/image.jpg"
 *                     failures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "file1"
 *                           extension:
 *                             type: string
 *                             example: "jpg"
 *                           arrayPosition:
 *                             type: integer
 *                             example: 0
 *             example:
 *               message: "Images uploaded partially"
 *               result:
 *                 data:
 *                   - { id: "64a62cdbe341fa456e123def" }
 *                 failures:
 *                   - { name: "file2", extension: "png", arrayPosition: 1 }
 *       '400':
 *         description: Bad request – validation or file errors
 *         content:
 *           application/json:
 *             examples:
 *               NoFiles:
 *                 value:
 *                   message: "Files not provided"
 *                   errorInfo: null
 *               TooManyFiles:
 *                 value:
 *                   message: "You can only upload a maximum of 20 files at a time"
 *                   errorInfo: null
 *               InvalidFiles:
 *                 value:
 *                   message: "Invalid files provided"
 *                   errorInfo: null
 *               InvalidExtensionSize:
 *                 value:
 *                   message: "Invalid file extension or size"
 *                   errorInfo: { maxSize: 1048576, fileSize: 2097152 }
 *               MissingParams:
 *                 value:
 *                   message: "Provide logId, entryId, and fieldId in req.params"
 *                   errorInfo: null
 *               InvalidIds:
 *                 value:
 *                   message: "Invalid logId, entryId, or fieldId format"
 *                   errorInfo: null
 *               InvalidFieldIds:
 *                 value:
 *                   message: "Provide valid logId, entryId, and fieldId"
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
 * /api/v1/logs/{logId}/entries/{entryId}/fields/{fieldId}/images:
 *   get:
 *     summary: Fetch images for a log entry field
 *     description: |
 *       Retrieves a paginated list of images associated with a specific log entry field.
 *     tags:
 *       - Log
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log (MongoDB ObjectId).
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the log entry (MongoDB ObjectId).
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the field within the log entry (MongoDB ObjectId).
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: |
 *           The ID of the business unit (MongoDB ObjectId). Optional for super admins; required for others if not 
 *           already set in the token.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: The page number for pagination (default is 1).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 200
 *           minimum: 1
 *           maximum: 200
 *         description: The number of items per page (default is 200, max is 200).
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: The field to sort by (default is "createdAt").
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: The sort order (default is "desc").
 *     responses:
 *       '200':
 *         description: Log field images fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Log Fields Images fetched successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 5
 *                     totalDataCount:
 *                       type: integer
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64a62cdbe341fa456e123def"
 *                           url:
 *                             type: string
 *                             example: "http://example.com/download/image.jpg"
 *             example:
 *               message: "Log Fields Images fetched successfully"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 5
 *                 totalDataCount: 100
 *                 data:
 *                   - { id: "64a62cdbe341fa456e123def", url: "http://example.com/download/image.jpg" }
 *                   - { id: "64a62cdbe341fa456e123ghi", url: "http://example.com/download/image.png" }
 *       '400':
 *         description: Bad request – validation or logic errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingParams:
 *                 value:
 *                   message: "Provide logId, entryId, and fieldId in req.params"
 *                   errorInfo: null
 *               InvalidIds:
 *                 value:
 *                   message: "Invalid logId, entryId, or fieldId format"
 *                   errorInfo: null
 *               InvalidFieldIds:
 *                 value:
 *                   message: "Provide valid logId, entryId, and fieldId"
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
 *               message: "Some internel server error"
 *               errorInfo: null
 */