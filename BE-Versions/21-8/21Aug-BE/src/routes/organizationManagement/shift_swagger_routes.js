/**
 * @swagger
 * /api/v1/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags:
 *       - Shifts
 *     description: |
 *       This endpoint is to create a new shift.
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
 *             required:
 *               - name
 *               - shiftHours
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 description: The name of the shift (must be unique within the business unit, case-insensitive).
 *                 example: "Morning Shift"
 *               shiftHours:
 *                 type: object
 *                 required:
 *                   - start
 *                   - end
 *                 properties:
 *                   start:
 *                     type: string
 *                     maxLength: 8
 *                     pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$
 *                     description: Start time of the shift in HH:mm:ss format.
 *                     example: "09:00:00"
 *                   end:
 *                     type: string
 *                     maxLength: 8
 *                     pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$
 *                     description: End time of the shift in HH:mm:ss format.
 *                     example: "17:00:00"
 *           example:
 *             name: "Morning Shift"
 *             shiftHours:
 *               start: "09:00:00"
 *               end: "17:00:00"
 *     responses:
 *       '201':
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Shift created successfully"
 *               result:
 *                 id: "64a62cdbe341fa456e123def"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingName:
 *                 value:
 *                   message: "Failed! name is required"
 *                   errorInfo: null
 *               InvalidNameType:
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorInfo: null
 *               NameTooLong:
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorInfo: null
 *               NameExists:
 *                 value:
 *                   message: "Failed! name already exists in the server (case-insensitive check)"
 *                   errorInfo: null
 *               MissingStartTime:
 *                 value:
 *                   message: "Failed! shiftHours.start is required"
 *                   errorInfo: null
 *               InvalidStartTimeType:
 *                 value:
 *                   message: "Failed! shiftHours.start must be a string"
 *                   errorInfo: null
 *               StartTimeTooLong:
 *                 value:
 *                   message: "Failed! shiftHours.start should not exceed 8 characters"
 *                   errorInfo: null
 *               InvalidStartTimeFormat:
 *                 value:
 *                   message: "Failed! Invalid shiftHours.start shift hours. It should be in HH:mm:ss format."
 *                   errorInfo: null
 *               MissingEndTime:
 *                 value:
 *                   message: "Failed! shiftHours.end is required"
 *                   errorInfo: null
 *               InvalidEndTimeType:
 *                 value:
 *                   message: "Failed! shiftHours.end must be a string"
 *                   errorInfo: null
 *               EndTimeTooLong:
 *                 value:
 *                   message: "Failed! shiftHours.end should not exceed 8 characters"
 *                   errorInfo: null
 *               InvalidEndTimeFormat:
 *                 value:
 *                   message: "Failed! Invalid shiftHours.end shift hours. It should be in HH:mm:ss format."
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
 * /api/v1/shifts/{shift}:
 *   put:
 *     summary: Update a specific shift
 *     tags:
 *       - Shifts
 *     description: |
 *       Updates a specific shift identified by `shift` ID. Allows updating the shift's name and/or shift hours. 
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
 *       - in: path
 *         name: shift
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the shift to update (MongoDB ObjectId).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 description: New name for the shift (must be unique within the business unit, case-insensitive).
 *                 example: "Updated Morning Shift"
 *               shiftHours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     maxLength: 8
 *                     pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$
 *                     description: New start time of the shift in HH:mm:ss format.
 *                     example: "08:00:00"
 *                   end:
 *                     type: string
 *                     maxLength: 8
 *                     pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$
 *                     description: New end time of the shift in HH:mm:ss format.
 *                     example: "16:00:00"
 *           example:
 *             name: "Updated Morning Shift"
 *             shiftHours:
 *               start: "08:00:00"
 *               end: "16:00:00"
 *     responses:
 *       '200':
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Shift updated successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidShiftId:
 *                 value:
 *                   message: "shift id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               InvalidNameType:
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorInfo: null
 *               NameTooLong:
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorInfo: null
 *               NameExists:
 *                 value:
 *                   message: "Failed! name already exists in the server (case-insensitive check)"
 *                   errorInfo: null
 *               InvalidStartTimeType:
 *                 value:
 *                   message: "Failed! shiftHours.start must be a string"
 *                   errorInfo: null
 *               StartTimeTooLong:
 *                 value:
 *                   message: "Failed! shiftHours.start should not exceed 8 characters"
 *                   errorInfo: null
 *               InvalidStartTimeFormat:
 *                 value:
 *                   message: "Failed! Invalid shiftHours.start shift hours. It should be in HH:mm:ss format."
 *                   errorInfo: null
 *               InvalidEndTimeType:
 *                 value:
 *                   message: "Failed! shiftHours.end must be a string"
 *                   errorInfo: null
 *               EndTimeTooLong:
 *                 value:
 *                   message: "Failed! shiftHours.end should not exceed 8 characters"
 *                   errorInfo: null
 *               InvalidEndTimeFormat:
 *                 value:
 *                   message: "Failed! Invalid shiftHours.end shift hours. It should be in HH:mm:ss format."
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
 *       '404':
 *         description: Shift not found
 *         content:
 *           application/json:
 *             examples:
 *               ShiftNotFound:
 *                 value:
 *                   message: "Failed! Shift does not exist"
 *                   errorInfo: null
 *               ShiftNotFoundById:
 *                 value:
 *                   message: "Shift not found"
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
 * /api/v1/shifts:
 *   delete:
 *     summary: Delete multiple shifts
 *     tags:
 *       - Shifts
 *     description: |
 *       Soft-deletes multiple shifts identified by their IDs by setting `isDeleted` to `true`. 
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
 *             required:
 *               - shiftsToDelete
 *             properties:
 *               shiftsToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: ^[0-9a-fA-F]{24}$
 *                 description: Array of shift IDs to delete (MongoDB ObjectIds).
 *                 example: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *           example:
 *             shiftsToDelete: ["64a62cdbe341fa456e123def", "64a62cdbe341fa456e123ghi"]
 *     responses:
 *       '200':
 *         description: Shifts deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Shifts deleted successfully"
 *               result: null
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               MissingShiftIds:
 *                 value:
 *                   message: "Shift ids are required"
 *                   errorInfo: null
 *               InvalidShiftIdsArray:
 *                 value:
 *                   message: "Shift ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               DuplicateShiftIds:
 *                 value:
 *                   message: "Failed! Duplicate id found"
 *                   errorInfo:
 *                     duplicateIds: ["64a62cdbe341fa456e123def"]
 *               InvalidShiftIds:
 *                 value:
 *                   message: "Failed! Invalid Shift ids"
 *                   errorInfo:
 *                     invalidShiftIds: ["64a62cdbe341fa456e123xyz"]
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
 * /api/v1/shifts:
 *   get:
 *     summary: Fetch shifts
 *     tags:
 *       - Shifts
 *     description: |
 *       Retrieves a paginated list of shifts based on query parameters. 
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
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 200
 *         description: Number of shifts per page (0 returns empty data).
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (e.g., name, createdAt).
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending).
 *       - in: query
 *         name: asset
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Filter shifts by asset ID (MongoDB ObjectId).
 *     responses:
 *       '200':
 *         description: Shifts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shifts fetched successfully"
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
 *                       example: 50
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64a62cdbe341fa456e123def"
 *                           name:
 *                             type: string
 *                             example: "Morning Shift"
 *                           shiftHours:
 *                             type: object
 *                             properties:
 *                               start:
 *                                 type: string
 *                                 example: "09:00:00"
 *                               end:
 *                                 type: string
 *                                 example: "17:00:00"
 *                           businessUnit:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "64a62cdbe341fa456e123abc"
 *                               name:
 *                                 type: string
 *                                 example: "Main Office"
 *             example:
 *               message: "Shifts fetched successfully"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 5
 *                 totalDataCount: 50
 *                 data:
 *                   - id: "64a62cdbe341fa456e123def"
 *                     name: "Morning Shift"
 *                     shiftHours:
 *                       start: "09:00:00"
 *                       end: "17:00:00"
 *                     businessUnit:
 *                       id: "64a62cdbe341fa456e123abc"
 *                       name: "Main Office"
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
 * /api/v1/shifts/{shift}:
 *   get:
 *     summary: Fetch a specific shift 
 *     tags:
 *       - Shifts
 *     description: |
 *       This endpoint is to fetch a specific shift.
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
 *       - in: path
 *         name: shift
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the shift to fetch (MongoDB ObjectId).
 *     responses:
 *       '200':
 *         description: Shift fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift Fetched Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64a62cdbe341fa456e123def"
 *                     name:
 *                       type: string
 *                       example: "Morning Shift"
 *                     shiftHours:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           example: "09:00:00"
 *                         end:
 *                           type: string
 *                           example: "17:00:00"
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64a62cdbe341fa456e123abc"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     updatedBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64a62cdbe341fa456e123abc"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                     businessUnit:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64a62cdbe341fa456e123ghi"
 *                         name:
 *                           type: string
 *                           example: "Main Office"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-01T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-02T12:00:00Z"
 *             example:
 *               message: "Shift Fetched Successfully"
 *               result:
 *                 id: "64a62cdbe341fa456e123def"
 *                 name: "Morning Shift"
 *                 shiftHours:
 *                   start: "09:00:00"
 *                   end: "17:00:00"
 *                 createdBy:
 *                   id: "64a62cdbe341fa456e123abc"
 *                   name: "John Doe"
 *                 updatedBy:
 *                   id: "64a62cdbe341fa456e123abc"
 *                   name: "John Doe"
 *                 businessUnit:
 *                   id: "64a62cdbe341fa456e123ghi"
 *                   name: "Main Office"
 *                 createdAt: "2023-07-01T10:00:00Z"
 *                 updatedAt: "2023-07-02T12:00:00Z"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidShiftId:
 *                 value:
 *                   message: "shift id must be a non-empty string in req.params or req.body"
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
 *       '404':
 *         description: Shift not found
 *         content:
 *           application/json:
 *             examples:
 *               ShiftNotFound:
 *                 value:
 *                   message: "Failed! Shift does not exist"
 *                   errorInfo: null
 *               ShiftNotFoundByQuery:
 *                 value:
 *                   message: "Shift not found"
 *                   errorInfo: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */