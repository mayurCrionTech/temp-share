/**
 * @swagger
 * /api/v1/teams:
 *   post:
 *     summary: Create a new team
 *     tags:
 *       - Team
 *     description: |
 *       Create a new team
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
 *               name:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *     responses:
 *       '201':
 *         description: Successfully created team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team created successfully
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
 *                   example: null
 *             examples:
 *               MissingFields:
 *                 summary: Missing Required Fields
 *                 value:
 *                   message: "The following fields are required: name."
 *                   errorInfo: null
 *               InvalidUsers:
 *                 summary: Invalid User IDs
 *                 value:
 *                   message: "User ids must be a non-empty array of strings."
 *                   errorInfo: null
 *               InvalidBusinessUnit:
 *                 summary: Invalid Business Unit
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist."
 *                   errorInfo: null
 *               DuplicateTeamName:
 *                 summary: Duplicate Team Name
 *                 value:
 *                   message: "Failed! Team name already exists."
 *                   errorInfo: null
 *               UsersWithTeam:
 *                 summary: Users Already in Team
 *                 value:
 *                   message: "Failed! Users already have a team."
 *                   errorInfo: null
 *               InvalidDepartmentIDs:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: "Failed! Invalid Department ids."
 *                   errorInfo: null
 *               InvalidPriority:
 *                 summary: Invalid Priority Value
 *                 value:
 *                   message: "Please provide a valid Priority."
 *                   errorInfo: null
 *               InvalidDocumentID:
 *                 summary: Invalid Document ID
 *                 value:
 *                   message: "Failed! DocumentId is not a valid file id."
 *                   errorInfo: null
 *               InvalidImageID:
 *                 summary: Invalid Image ID
 *                 value:
 *                   message: "Failed! Invalid Image. File id is not a maintenancePlan file."
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
 *                   example: Some internal server error.
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/teams:
 *   get:
 *     summary: Fetch all teams
 *     description: |
 *       Retrieves a paginated list of teams, filtered by business unit, department, and name. 
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Team
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
 *           already set in the token.
 *       - in: query
 *         name: departments
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of department IDs to filter teams (MongoDB ObjectIds).
 *         example: "64a62cdbe341fa456e123abc,64a62cdbe341fa456e123def"
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter teams by name (case-insensitive regex match).
 *         example: "Maintenance"
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
 *           default: 0
 *         description: Number of teams per page (0 returns empty data).
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (e.g., name, createdAt).
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending).
 *       - in: query
 *         name: selectFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include in the response (e.g., name,department).
 *         example: "name,department,businessUnit"
 *       - in: query
 *         name: populateFields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to populate (e.g., department,businessUnit).
 *         example: "department,businessUnit"
 *     responses:
 *       '200':
 *         description: Teams fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Teams fetched successfully"
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
 *                             example: "Maintenance Team"
 *                           department:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "64a62cdbe341fa456e123abc"
 *                               name:
 *                                 type: string
 *                                 example: "Engineering"
 *                           businessUnit:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "64a62cdbe341fa456e123ghi"
 *                               name:
 *                                 type: string
 *                                 example: "Main Office"
 *             example:
 *               message: "Teams fetched successfully"
 *               result:
 *                 currentPage: 1
 *                 totalPageCount: 5
 *                 totalDataCount: 50
 *                 data:
 *                   - id: "64a62cdbe341fa456e123def"
 *                     name: "Maintenance Team"
 *                     department:
 *                       id: "64a62cdbe341fa456e123abc"
 *                       name: "Engineering"
 *                     businessUnit:
 *                       id: "64a62cdbe341fa456e123ghi"
 *                       name: "Main Office"
 *       '400':
 *         description: Bad request – validation errors
 *         content:
 *           application/json:
 *             examples:
 *               InvalidDepartments:
 *                 value:
 *                   message: "Department ids must be a non-empty string with comma separated values"
 *                   errorInfo: null
 *               InvalidDepartmentIds:
 *                 value:
 *                   message: "Failed! Invalid Department ids"
 *                   errorInfo:
 *                     invalidDepartments: ["64a62cdbe341fa456e123xyz"]
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
 * /api/v1/teams/get teams: 
 *   get:
 *     summary: Get team details
 *     tags:
 *       - Team
 *     description: |
 *       Get team details.
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
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID or Team Name
 *     responses:
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
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               InvalidDepartmentIds:
 *                 summary: Invalid Department IDs
 *                 value:
 *                   message: "Failed! Invalid Department ids."
 *                   errorInfo: null
 *               InvalidTeamId:
 *                 summary: Invalid Team ID
 *                 value:
 *                   message: "Team id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               MissingTeam:
 *                 summary: Team ID Missing
 *                 value:
 *                   message: "Failed! Team does not exist"
 *                   errorInfo: null
 *               MissingDepartment:
 *                 summary: Missing Department ID
 *                 value:
 *                   message: "Department id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *       '404':
 *         description: Not Found
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
 *               TeamNotFound:
 *                 summary: Team Not Found
 *                 value:
 *                   message: "Team not found"
 *                   errorInfo: null
 *               DepartmentNotFound:
 *                 summary: Department Not Found
 *                 value:
 *                   message: "Failed! Department does not exist"
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
 * /api/v1/teams/{team}/enable:
 *   patch:
 *     summary: Enable a team
 *     tags:
 *       - Team
 *     description: |
 *       Enable team 
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
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to enable
 *     responses:
 *       '200':
 *         description: Team enabled successfully
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
 *               message: "Team enabled successfully"
 *               data: null
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
 *               message: "Team id must be a non-empty string in req.params or req.body"
 *               errorInfo: null
 *       '404':
 *         description: Team not found
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
 *               message: "Failed! Team does not exist"
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
 * /api/v1teams/disableTeam:
 *   patch:
 *     summary: Disable team
 *     tags:
 *       - Team
 *     description: |
 *       Disable Team 
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
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID to be disabled
 *     responses:
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
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit ID
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               InvalidTeamId:
 *                 summary: Invalid Team ID
 *                 value:
 *                   message: "Team id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               BusinessUnitNotExist:   
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *       '404':
 *         description: Not Found
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
 *               TeamNotFound:
 *                 summary: Team Not Found
 *                 value:
 *                   message: "Team not found"
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
 *       '200':
 *         description: Successful Operation
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
 *               SuccessResponse:
 *                 summary: Successful Response
 *                 value:
 *                   message: "Team disabled successfully"
 *                   errorInfo: null
*/

/**
 * @swagger
 * /api/v1/teams/enable:
 *   patch:
 *     summary: Enable multiple teams
 *     tags:
 *       - Team
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               teams: ["team1", "team2"]
 *     responses:
 *       '200':
 *         description: Teams enabled successfully
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
 *               message: "Teams enabled successfully"
 *               data: null
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
 *             example:
 *               message: "Team ids must be a non-empty array of strings"
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
 * /api/v1/teams/disable:
 *   patch:
 *     summary: Disable multiple teams
 *     tags:
 *       - Team
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               teams: ["team1", "team2", "team3"]
 *     responses:
 *       '200':
 *         description: Teams disabled successfully
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
 *               message: "Teams disabled successfully"
 *               data: null
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
 *               InvalidTeams:
 *                 value:
 *                   message: "Team ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               InvalidTeamsProvided:
 *                 value:
 *                   message: "Failed! Invalid Team ids"
 *                   errorInfo: { "invalidTeams": ["team4"] }
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
 * /api/v1/teams/{team}:
 *   delete:
 *     summary: Delete a team by ID
 *     tags:
 *       - Team 
 *     description: |
 *       This endpoint is to create a new designation.
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
 *         name: team
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to delete
 *     responses:
 *       '200':
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team deleted successfully"
 *                 result:
 *                   type: "null"
 *       '400':
 *         description: Bad request due to missing or invalid input
 *         content:
 *           application/json:
 *             examples:
 *               MissingTeamId:
 *                 value:
 *                   message: "Team id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               MissingBusinessUnit:
 *                 value:
 *                   message: "BusinessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               InvalidBusinessUnit:
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *                   errorInfo: null
 *               InvalidFieldFormat:
 *                 value:
 *                   message: "Failed! <field> is required"
 *                   errorInfo: null
 *       '401':
 *         description: Unauthorized access due to token issues
 *         content:
 *           application/json:
 *             examples:
 *               NoAuthorizationHeader:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               NoTokenInHeader:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '404':
 *         description: Team not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed! Team does not exist"
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
 * /api/v1/teams/delete:
 *   delete:
 *     summary: Delete multiple teams
 *     tags:
 *       - Team
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teams:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               teams: ["team1", "team2", "team3"]
 *     responses:
 *       '200':
 *         description: Teams deleted successfully
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
 *               message: "Teams deleted successfully"
 *               data: null
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
 *               InvalidTeamIds:
 *                 value:
 *                   message: "Team ids must be a non-empty array of strings"
 *                   errorInfo: null
 *               InvalidTeams:
 *                 value:
 *                   message: "Failed! Invalid Team ids"
 *                   errorInfo: { "invalidTeams": ["team4"] }
 *       '404':
 *         description: Team(s) not found
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
 *               message: "Failed! Some teams do not exist"
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
 * /api/v1/teams/update:
 *   put:
 *     summary: Update teams
 *     tags:
 *       - Team
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *               name:
 *                 type: string
 *               isEnabled:
 *                 type: boolean
 *               appendUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *               removeUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               team: "team1"
 *               name: "New Team Name"
 *               isEnabled: true
 *               appendUsers: ["user1", "user2"]
 *               removeUsers: ["user3", "user4"]
 *     responses:
 *       '200':
 *         description: Team updated successfully
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
 *               message: "Team updated successfully"
 *               data: null
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
 *               InvalidTeamId:
 *                 value:
 *                   message: "Team id must be a non-empty string"
 *                   errorInfo: null
 *               InvalidName:
 *                 value:
 *                   message: "Team name must be a non-empty string"
 *                   errorInfo: null
 *               TeamNameExists:
 *                 value:
 *                   message: "Failed! Team name already exists for the business unit"
 *                   errorInfo: null
 *               InvalidUsers:
 *                 value:
 *                   message: "Failed! Invalid User ids"
 *                   errorInfo: { "invalidUsers": ["user5"] }
 *               UsersAlreadyInTeam:
 *                 value:
 *                   message: "Failed! Some users already have a team"
 *                   errorInfo: { "usersWithTeam": ["user6"] }
 *               UsersNotInTeam:
 *                 value:
 *                   message: "Failed! Some users do not belong to the team"
 *                   errorInfo: { "usersWithoutTeam": ["user7"] }
 *       '404':
 *         description: Team not found
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
 *               message: "Failed! Team does not exist"
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


