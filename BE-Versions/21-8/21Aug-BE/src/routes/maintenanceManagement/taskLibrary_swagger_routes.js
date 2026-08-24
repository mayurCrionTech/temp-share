 /**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new Task Library
 *     tags:
 *       - Task Library
 *     description: |
 *       Create a new task library
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
 *               name:
 *                 type: string
 *                 example: "Maintenance Checklist"
 *               description:
 *                 type: string
 *                 example: "A task library for maintenance tasks."
 *               assetCategory:
 *                 type: string
 *                 example: "Mechanical"
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Task1", "Task2"]
 *     responses:
 *       '201':
 *         description: Task Library created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "TaskLibrary created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65a3bcfdb17c9b00123abcd9"
 *       '400':
 *         description: Bad Request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! name is required"
 *                 errorInfo:
 *                   type: object
 *             examples:
 *               MissingField:
 *                 value:
 *                   message: "Failed! name is required"
 *                   errorInfo: null
 *               InvalidDataType:
 *                 value:
 *                   message: "Failed! tasks must be an array"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized access due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided."
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
 *                   example: "Some internal server error"
 *                 errorInfo:
 *                   type: null
 *             example:
 *               message: "Internal server error. Please try again later."
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/tasks/count:
 *   get:
 *     summary: Get Task Library Count
 *     tags:
 *       - Task Library
 *     description: |
 *       Fetches the total number of tasks in the Task Library that are not deleted.
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
 *     responses:
 *       '200':
 *         description: Successfully fetched task count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalTasks:
 *                   type: integer
 *             example:
 *               message: "Task Count fetched successfully"
 *               totalTasks: 42
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
 *                   type: null
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Fetch Task Libraries
 *     tags:
 *       - Task Library
 *     description: |
 *       Retrieves a list of task libraries with pagination, sorting, and filtering options.
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
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1 if not provided).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default is total records if not provided).
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sorting order of the results.
 *       - in: query
 *         name: filter
 *         schema:
 *           type: object
 *         description: Filtering conditions based on available fields.
 *     responses:
 *       '200':
 *         description: Successfully fetched task libraries.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalRecords:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       number:
 *                         type: integer
 *                       assetCategory:
 *                         type: string
 *                       createdBy:
 *                         type: string
 *                       updatedBy:
 *                         type: string
 *             example:
 *               page: 1
 *               totalPages: 5
 *               totalRecords: 50
 *               data:
 *                 - id: "60d5ec49f72e4c001f1a2a77"
 *                   name: "Task Library 1"
 *                   description: "Description for task library 1"
 *                   number: 1001
 *                   assetCategory: "Category A"
 *                   createdBy: "user123"
 *                   updatedBy: "user456"
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
 *                   type: null
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */


/**
 * @swagger
 * /api/v1/tasks/{task}:
 *   get:
 *     summary: Fetch a Task Library
 *     tags:
 *       - Task Library
 *     description: |
 *       Retrieves details of a specific task library by its ID or name.
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
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *         description: Task Library ID (must be a valid MongoDB ObjectId) or Name (if `fetchByField=name` is used).
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name]
 *         description: If set to "name", fetches task library by name instead of ID.
 *     responses:
 *       '200':
 *         description: Task Library fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 number:
 *                   type: integer
 *                 assetCategory:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *                 updatedBy:
 *                   type: string
 *             example:
 *               id: "60d5ec49f72e4c001f1a2a77"
 *               name: "Task Library 1"
 *               description: "Detailed description of Task Library 1"
 *               number: 1001
 *               assetCategory: "Category A"
 *               createdBy: "user123"
 *               updatedBy: "user456"
 *       '400':
 *         description: Invalid Task Library ID or missing task parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               InvalidId:
 *                 value:
 *                   message: "Failed! Invalid TaskLibrary Id"
 *               MissingTask:
 *                 value:
 *                   message: "TaskLibrary id must be a non-empty string in req.params or req.body"
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
 *         description: Task Library not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Failed! TaskLibrary does not exist"
 *       '500':
 *         description: Internal server error.
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
 * /api/v1/tasks/delete:
 *   delete:
 *     summary: Bulk Delete Task Libraries
 *     tags:
 *       - Task Library
 *     description: |
 *       Deletes multiple task libraries by marking them as deleted.
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
 *               taskLibrariesToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 1000
 *                 description: List of Task Library IDs to delete.
 *             example:
 *               taskLibrariesToDelete:
 *                 - "60d5ec49f72e4c001f1a2a77"
 *                 - "60d5ec49f72e4c001f1a2a78"
 *     responses:
 *       '200':
 *         description: Task libraries deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *             example:
 *               message: "TaskLibraries deleted successfully"
 *               data: null
 *       '400':
 *         description: Validation error (Invalid IDs, duplicates, or exceeding max limit).
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
 *               EmptyRequest:
 *                 value:
 *                   message: "Failed! taskLibrariesToDelete is required"
 *                   errorInfo: null
 *               MaxLimitExceeded:
 *                 value:
 *                   message: "Failed! taskLibrariesToDelete should not exceed 1000 items"
 *                   errorInfo: null
 *               InvalidIds:
 *                 value:
 *                   message: "Failed! Invalid taskLibrariesToDelete"
 *                   errorInfo: { "invalidIds": ["invalid-id-1", "invalid-id-2"] }
 *               DuplicateIds:
 *                 value:
 *                   message: "Failed! Duplicate IDs found in taskLibrariesToDelete"
 *                   errorInfo: { "duplicateIds": ["60d5ec49f72e4c001f1a2a77"] }
 *       '401':
 *         description: Unauthorized (missing or invalid token).
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
 *         description: Internal server error.
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
 * /api/v1/tasks/{task}:
 *   put:
 *     summary: Update Task Library
 *     tags:
 *       - Task Library
 *     description: |
 *       Updates an existing Task Library with new details and tasks.
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
 *         name: taskLibraryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Task Library to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Name of the Task Library (must be unique).
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Description of the Task Library.
 *               assetCategory:
 *                 type: string
 *                 description: ID of the Asset Category associated with the Task Library.
 *               tasksToBeAdded:
 *                 type: array
 *                 description: List of new tasks to be added to the Task Library.
 *                 items:
 *                   $ref: '#/components/schemas/TaskItem'
 *               tasksToBeEdited:
 *                 type: array
 *                 description: List of existing tasks that need modifications.
 *                 items:
 *                   $ref: '#/components/schemas/TaskEditItem'
 *               tasksDeleted:
 *                 type: array
 *                 description: List of task IDs to be deleted.
 *                 items:
 *                   type: string
 *             example:
 *               name: "Updated Task Library"
 *               description: "This is an updated task library description."
 *               assetCategory: "60d5ec49f72e4c001f1a2a77"
 *               tasksToBeAdded:
 *                 - id: "taskId123"
 *                   title: "New Task Name"
 *               tasksToBeEdited:
 *                 - id: "taskId456"
 *                   newData: { "title": "Updated Task Name" }
 *               tasksDeleted:
 *                 - "taskId789"
 *     responses:
 *       '200':
 *         description: Task Library updated successfully.
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
 *                       description: Task Library ID.
 *             example:
 *               message: "Task Library updated successfully"
 *               data:
 *                 id: "60d5ec49f72e4c001f1a2a77"
 *       '400':
 *         description: Validation error (invalid fields, duplicate tasks, etc.).
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
 *               InvalidId:
 *                 value:
 *                   message: "Failed! Invalid Task Library ID"
 *                   errorInfo: null
 *               NameTooLong:
 *                 value:
 *                   message: "Failed! Name should not exceed 50 characters"
 *                   errorInfo: null
 *               InvalidTasks:
 *                 value:
 *                   message: "Failed! Invalid Task IDs"
 *                   errorInfo:
 *                     invalidTaskIds: ["invalidTaskId1", "invalidTaskId2"]
 *       '404':
 *         description: Task Library not found.
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
 *               message: "Task Library not found"
 *               errorInfo: null
 *       '401':
 *         description: Unauthorized (missing or invalid token).
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
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Some internal server error"
 *
 * components:
 *   schemas:
 *     TaskItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Task ID.
 *         title:
 *           type: string
 *           description: Task name.
 *       required:
 *         - id
 *     TaskEditItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the task to be edited.
 *         newData:
 *           type: object
 *           description: New details for the task.
 *       required:
 *         - id
 */  

