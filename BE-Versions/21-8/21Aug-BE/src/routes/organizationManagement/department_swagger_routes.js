/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: Create a new department
 *     tags:
 *       - Department
 *     description: |
 *       Creates a new department under a specific business unit.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the department.
 *               isEnabled:
 *                 type: boolean
 *                 description: Status of the department (optional).
 *           example:
 *             businessUnit: "60b8d295f1d2c00015b8d73b"
 *             name: "Finance"
 *             isEnabled: true
 *     responses:
 *       '201':
 *         description: Department created successfully
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
 *                     name:
 *                       type: string
 *                     businessUnit:
 *                       type: string
 *             example:
 *               message: "Department created successfully"
 *               data:
 *                 id: "60b8d295f1d2c00015b8d73b"
 *                 name: "Finance"
 *                 businessUnit: "60b8d295f1d2c00015b8d73b"
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
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingDepartmentName:
 *                 value:
 *                   message: "Department name must be a non-empty string"
 *               DuplicateDepartmentName:
 *                 value:
 *                   message: "Failed! Department name already exists for the business unit"
 *               InvalidIsEnabledType:
 *                 value:
 *                   message: "Failed! Department isEnabled should be a boolean"
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
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     tags:
 *       - Department
 *     description: |
 *       Retrieves a list of departments with optional filtering, pagination, and sorting.
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
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit ID to filter departments.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter departments by name (case-insensitive).
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
 *         description: Number of departments per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (default is "createdAt").
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sorting order (ascending or descending).
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Comma-separated fields to include in response.
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Fields to populate (e.g., "_id name").
 *     responses:
 *       '200':
 *         description: Departments fetched successfully
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       businessUnit:
 *                         type: string
 *             example:
 *               message: "Departments fetched successfully"
 *               data:
 *                 - id: "60b8d295f1d2c00015b8d73c"
 *                   name: "Finance"
 *                   businessUnit: "60b8d295f1d2c00015b8d73b"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
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
 * /api/v1/departments/{department}:
 *   get:
 *     summary: Fetch a specific department
 *     tags:
 *       - Department
 *     description: |
 *       Retrieves details of a specific department identified by its ID. 
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
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: The ID of the department to fetch (MongoDB ObjectId).
 *       - in: query
 *         name: selectFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include in the response (e.g., name,createdBy).
 *         example: "name,createdBy,businessUnit"
 *       - in: query
 *         name: populateFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to populate (e.g., createdBy,businessUnit).
 *         example: "createdBy,businessUnit"
 *     responses:
 *       '200':
 *         description: Department fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Department fetched successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64a62cdbe341fa456e123def"
 *                     name:
 *                       type: string
 *                       example: "Engineering"
 *                     createdBy:
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
 *             example:
 *               message: "Department fetched successfully"
 *               result:
 *                 id: "64a62cdbe341fa456e123def"
 *                 name: "Engineering"
 *                 createdBy:
 *                   id: "64a62cdbe341fa456e123abc"
 *                   name: "John Doe"
 *                 businessUnit:
 *                   id: "64a62cdbe341fa456e123ghi"
 *                   name: "Main Office"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidDepartmentId:
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               DepartmentNotExist:
 *                 value:
 *                   message: "Failed! Department does not exist"
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
 *         description: Department not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Department not found"
 *               errorInfo: null
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
 * /api/v1/departments/{department}/enable:
 *   patch:
 *     summary: Enable a department
 *     tags:
 *       - Department
 *     description: |
 *       Marks a department as enabled in the system.
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the department to enable.
 *     responses:
 *       '200':
 *         description: Department enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Department enabled successfully"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingDepartmentId:
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *               DepartmentNotExist:
 *                 value:
 *                   message: "Failed! Department does not exist"
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
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
 * /api/v1/departments/{department}/disable:
 *   patch:
 *     summary: Disable a department
 *     tags:
 *       - Department
 *     description: |
 *       Marks a department as disabled in the system.
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the department to disable.
 *     responses:
 *       '200':
 *         description: Department disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Department disabled successfully"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingDepartmentId:
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *               DepartmentNotExist:
 *                 value:
 *                   message: "Failed! Department does not exist"
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
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
 * /api/v1/departments/enable:
 *   patch:
 *     summary: Enable multiple departments
 *     tags:
 *       - Department
 *     description: |
 *       Marks multiple departments as enabled.
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
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5ec49f68c8b4b14e8f8b6", "60d5ec49f68c8b4b14e8f8b7"]
 *             required:
 *               - departments
 *     responses:
 *       '200':
 *         description: Departments enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Departments enabled successfully"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingDepartmentIds:
 *                 value:
 *                   message: "Department ids must be a non-empty array of strings"
 *               InvalidDepartmentIds:
 *                 value:
 *                   message: "Failed! Invalid Department ids"
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
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
 * /api/v1/departments/disable:
 *   patch:
 *     summary: Disable multiple departments
 *     tags:
 *       - Department
 *     description: |
 *       Disables multiple departments by updating their `isEnabled` status to `false`.
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
 *         name: businessUnit
 *         schema:
 *           type: string
 *         required: false
 *         description: Business unit ID (required if the user is not a super admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               departments: ["60f7f28b2b3e3c1f84d7b5f1", "60f7f28b2b3e3c1f84d7b5f2"]
 *     responses:
 *       '200':
 *         description: Departments disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Departments disabled successfully"
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
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               MissingDepartmentIds:
 *                 summary: Missing Department IDs
 *                 value:
 *                   message: "Department ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               InvalidDepartmentIds:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: "Failed! Invalid Department ids"
 *                   errorInfo: { "invalidDepartments": ["invalid-id-1", "invalid-id-2"] }
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
 *               NoTokenProvided:
 *                 summary: No Token Provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid Token Provided
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
 * /api/v1/departments/{department}:
 *   delete:
 *     summary: Delete a department
 *     tags:
 *       - Department
 *     description: |
 *       Delete specific department 
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
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID to be deleted
 *     responses:
 *       '200':
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Department deleted successfully"
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
 *               NoTokenProvided:
 *                 summary: No Token Provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid Token Provided
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
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
 *                   type: null
 *             examples:
 *               InvalidDepartmentId:
 *                 summary: Invalid Department ID
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               DepartmentNotFound:
 *                 summary: Department Not Found
 *                 value:
 *                   message: "Failed! Department does not exist"
 *                   errorInfo: null
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
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
 *             examples:
 *               InternalServerError:
 *                 summary: Internal Server Error
 *                 value:
 *                   message: "Some internal server error"
 *                   errorInfo: null
 */

/**
 * @swagger
 * /api/v1/departments:
 *   delete:
 *     summary: Delete multiple departments
 *     tags:
 *       - Department
 *     description: |
 *       Delete multiple departments
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
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65d1a6eacb2d4f1234abcd01", "65d1a6eacb2d4f1234abcd02"]
 *     responses:
 *       '200':
 *         description: Successfully deleted the departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Departments deleted successfully
 *       '400':
 *         description: Bad request (Invalid or missing department IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department ids must be a non-empty array of strings
 *       '401':
 *         description: Unauthorized (Invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized! No token provided!
 *       '404':
 *         description: One or more departments not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Invalid Department ids
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 */

/**
 * @swagger
 * /api/v1/departments/{department}:
 *   put:
 *     summary: Update a department
 *     tags:
 *       - Department
 *     description: |
 *       Update the department
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
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the department to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Department Name"
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Department updated successfully
 *       '400':
 *         description: Bad request (Invalid or missing parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit Id must be a non-empty string
 *       '401':
 *         description: Unauthorized (Invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized! No token provided!
 *       '404':
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Department does not exist
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 */

