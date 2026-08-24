/**
 * @swagger
 * /api/v1/businessUnits:
 *   post:
 *     summary: Create a new business unit
 *     tags:
 *       - Business Units
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
 *                 example: "Madurai"
 *               shortName:
 *                 type: string
 *                 example: "Madu"
 *             required:
 *               - name
 *               - shortName
 *     responses:
 *       '200':
 *         description: Successfully created business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business unit created successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
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
 *               MissingBusinessUnitname:
 *                 summary: Missing Business Unit name
 *                 value:
 *                   message: BusinessUnit name must be a non-empty string
 *                   errorInfo: null
 *               MissingBusinessShortName:
 *                 summary: Missing Business Unit shortname
 *                 value:
 *                   message: BusinessUnit shortName must be a non-empty string with a maximum length of 3 characters
 *                   errorInfo: null
 *               BusinessUnitNameExist:
 *                 summary: BusinessUnit name already exist
 *                 value:
 *                   message: Failed! BusinessUnit name already exist
 *                   errorInfo: null
 *               BusinessUnitShortNameExist:
 *                 summary: BusinessUnit short name already exist
 *                 value:
 *                   message: Failed! BusinessUnit short name already exist
 *                   errorInfo: null
 *               BusinessUnitisenabled:
 *                 summary: BusinessUnit isEnabled should be a boolean
 *                 value:
 *                   message: Failed! BusinessUnit isEnabled should be a boolean
 *                   errorInfo: null
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
 *                   example: Some internal server error.
 *                 errorInfo:
 *                   type: null
 *                   example: null        
 */

/**
 * @swagger
 * /api/v1/businessUnits:
 *   get:
 *     summary: Retrieve all business units
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Partial or full name of the business unit to filter
 *       - in: query
 *         name: shortName
 *         schema:
 *           type: string
 *         description: Partial or full short name of the business unit to filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page for pagination
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort the results by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: asc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Fields to include in the result, separated by commas
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Fields to populate, separated by commas
 *     responses:
 *       '200':
 *         description: Successfully retrieved business units
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnits fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 1
 *                     totalDataCount:
 *                       type: integer
 *                       example: 1
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "666fc8b3cfe03606a0e3a823"
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
 *                   example: Some internal server error
 */   

/**
 * @swagger
 * /api/v1/businessUnits/{businessUnit}:
 *   get:
 *     summary: Retrieve a specific business unit
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessUnit
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business unit to retrieve
 *     responses:
 *       '200':
 *         description: Successfully retrieved business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business unit fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "666fc8b3cfe03606a0e3a823"
 *                     name:
 *                       type: string
 *                       example: "Finance"
 *                     shortName:
 *                       type: string
 *                       example: "FIN"
 *                     usersCount:
 *                       type: integer
 *                       example: 10
 *                     isEnabled:
 *                       type: boolean
 *                       example: true
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-01T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-01T00:00:00.000Z"
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Derin B"
 *                         id:
 *                           type: string
 *                           example: "6678e90d5ba6471c7357d419"
 *                     updatedBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Derin B"
 *                         id:
 *                           type: string
 *                           example: "6678e90d5ba6471c7357d419"
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
 *               InvalidBusinessUnit:
 *                 summary: Invalid BusinessUnit ID
 *                 value:
 *                   message: Please enter a valid BusinessUnit ID
 *                   errorInfo: null  
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits/{businessUnit}/enable:
 *   patch:
 *     summary: Enable a specific business unit
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessUnit
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business unit to enable
 *     responses:
 *       '200':
 *         description: Successfully enabled business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit enabled successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits/{businessUnit}/disable:
 *   patch:
 *     summary: Disable a specific business unit
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessUnit
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business unit to disable
 *     responses:
 *       '200':
 *         description: Successfully disabled business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit disabled successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits/enable:
 *   patch:
 *     summary: Enable multiple business units
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessUnits:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - businessUnits
 *             example:
 *               businessUnits: ["60f8c2b6b6e6e0a6d88a5f7d", "60f8c2b6b6e6e0a6d88a5f7e"]
 *     responses:
 *       '200':
 *         description: Successfully enabled business units
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnits enabled successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *                   example: Some internal server error
 */

/**
 * @swagger
 * /api/v1/businessUnits/disable:
 *   patch:
 *     summary: Disable multiple business units
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessUnits:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - businessUnits
 *             example:
 *               businessUnits: ["60f8c2b6b6e6e0a6d88a5f7d", "60f8c2b6b6e6e0a6d88a5f7e"]
 *     responses:
 *       '200':
 *         description: Successfully disabled business units
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnits disabled successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits/{businessUnit}:
 *   delete:
 *     summary: Delete a business unit
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessUnit
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business unit to delete
 *     responses:
 *       '200':
 *         description: Successfully deleted business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit deleted successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *       '404':
 *         description: Business unit not found
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits:
 *   delete:
 *     summary: Delete multiple business units
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessUnits:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - businessUnits
 *             example:
 *               businessUnits: ["60f8c2b6b6e6e0a6d88a5f7d", "60f8c2b6b6e6e0a6d88a5f7e"]
 *     responses:
 *       '200':
 *         description: Successfully deleted business units
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnits deleted successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

/**
 * @swagger
 * /api/v1/businessUnits/{businessUnit}:
 *   put:
 *     summary: Update a business unit
 *     tags:
 *       - Business Units
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessUnit
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business unit to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               shortName:
 *                 type: string
 *               isEnabled:
 *                 type: boolean
 *             example:
 *               name: New Business Unit Name
 *               shortName: NBU
 *               isEnabled: true
 *     responses:
 *       '200':
 *         description: Successfully updated business unit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BusinessUnit updated successfully
 *                 result:
 *                   type: object
 *                   nullable: true
 *                   example: null
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
 *               BusinessUnitName:
 *                 summary: BusinessUnit ShortName must be a non-empty string with a maximum length of 3 characters
 *                 value:
 *                   message: BusinessUnit ShortName must be a non-empty string with a maximum length of 3 characters
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: BusinessUnit does not exist
 *                 value:
 *                   message: Failed! BusinessUnit does not exist
 *                   errorInfo: null
 *               BusinessUnitShortName:
 *                 summary: Business Unit short name already exists
 *                 value:
 *                   message: Failed! BusinessUnit shortName already exists
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: BusinessUnit isEnabled should be boolean
 *                 value:
 *                   message: Failed! BusinessUnit isEnabled should be boolean
 *                   errorInfo: null
 *       '404':
 *         description: Business unit not found
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
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */

