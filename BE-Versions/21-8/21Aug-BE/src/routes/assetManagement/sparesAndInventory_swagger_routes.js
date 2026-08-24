/**
 * @swagger
 * /api/v1/spares/statusCount:
 *   get:
 *     summary: Fetch list of spares status
 *     description: Retrieves the total count of active spares in the inventory.
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched spares status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares Status Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     ActiveSpares:
 *                       type: integer
 *                       example: 8
 *       401:
 *         description: Unauthorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Some internal server error.
*/


/**
 * @swagger
 * /api/v1/spares:
 *   post:
 *     summary: Create multiple spares
 *     description: |
 *       This endpoint is used to add multiple spare.
 *       
 *       **Internally Populated Fields:**
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |
 *       
 *       You do not need to send these fields in the request body.
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spares
 *             properties:
 *               spares:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - quantity
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Spare A"
 *                     assetId:
 *                       type: string
 *                       description: ID of the associated asset
 *                       example: "66038ec28aa78696d1f33c25"
 *                     description:
 *                       type: string
 *                       example: "This is a sample spare"
 *                     quantity:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 10
 *                     cost:
 *                       type: number
 *                       example: 100.50
 *                     minimumRequirement:
 *                       type: number
 *                       example: 5
 *     responses:
 *       201:
 *         description: Spare Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare Created Successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Created spare ID
 *                     example: ["660392d99c05e17d9d5a412f", "660392d99c05e17d9d5a412g"]
 *       400:
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             examples:
 *               InvalidSparesArray:       
 *                 summary: Spares not a non-empty array
 *                 value:
 *                   message: "Spares must be a non-empty array of objects with 'id' as a string property or strings"
 *                   errorinfo: null
 *               InvalidAssetIds:        
 *                 summary: Invalid asset IDs provided
 *                 value:
 *                   message: "Failed! Invalid Asset ids"
 *                   invalidAssetIds: ["67daf4382dc6749c218d3ee9"]
 *               DuplicateSpareNames:     
 *                 summary: Duplicate spare names detected
 *                 value:
 *                   message: "Duplicate Spare Name"
 *                   duplicateNames: ["Spare A"]
 *               ValidatiionError:       
 *                 summary: Validation Error
 *                 value:
 *                   message: "Validation error - Client side error"
 *                   errorinfo: null
 *       401:
 *         description: Unauthorized due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Internal server error.
*/


/**
 * @swagger
 * /api/v1/spares/dropdown:
 *   get:
 *     summary: Fetches dropdown values for spares and inventory.
 *     description: Retrieves predefined dropdown values for cycle frequency, replacement frequency, and quantity types.
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown values fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares Dropdown Values Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     cycleFrequency:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Cycle"]
 *                     replacementFrequency:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Months", "Years"]
 *                     quantity:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["mm", "litres", "no's"]
 *       401:
 *         description: Unauthorized due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Some internal server error.
*/


/**
 * @swagger
 * /api/v1/spares:
 *   get:
 *     summary: Fetch list of spares
 *     description: Retrieves a list of active spares.
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter spares by name (case-insensitive partial match)
 *       - in: query
 *         name: asset
 *         schema:
 *           type: string
 *         description: Filter spares by associated asset ID.
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
 *         description: Number of records per page.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending).
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include in the response.
 *         example: "name,quantity,createdBy,updatedBy,assetId,cycleFrequency,replacementFrequency"
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to populate.
 *         example: "createdBy,updatedBy,assetId"
 *     responses:
 *       200:
 *         description: Successfully fetched list of spares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Spares Fetched Successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *                     countData:
 *                       type: integer
 *                       example: 8
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "605c72ef1e153a2b6c8e4d2f"
 *                           name:
 *                             type: string
 *                             example: "Gearbox"
 *                           quantity:
 *                             type: integer
 *                             example: 10
 *                           asset:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "605c72ef1e153a2b6c8e4d2e"
 *                               generalDetails:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "Engine A"
 *                                   number:
 *                                     type: string
 *                                     example: "ENG-001"
 *       401:
 *         description: Unauthorized due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
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


/**
 * @swagger
 * /api/v1/spares/{spare}:
 *   get:
 *     summary: Fetch a specific spare
 *     description: Retrieves details of a single spare
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spare
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the spare to fetch
 *       - in: query
 *         name: asset
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the asset 
 *         example: "605c72ef1e153a2b6c8e4d2e"
 *       - in: query
 *         name: fetchByField
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["name", "nameAndAsset"]
 *       - in: query
 *         name: selectFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include in the response.
 *         example: name,quantity,createdBy,updatedBy,assetId,cycleFrequency,replacementFrequency
 *       - in: query
 *         name: populateFields
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to populate.
 *         example: asset
 *     responses:
 *       200:
 *         description: Successfully fetched list of spares
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: spareName10
 *                     quantity:
 *                       type: number
 *                       example: 14
 *                     id:
 *                       type: string
 *                       example: 66604e2eb31eb4eaffd2641d
 *                     asset:
 *                       type: object
 *                       description: Populated asset details (if populated)
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Asset ID (MongoDB ObjectId)
 *                           example: "605c72ef1e153a2b6c8e4d2e"
 *                         generalDetails:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: Name of the asset
 *                               example: "Engine A"
 *                             number:
 *                               type: string
 *                               description: Asset identification number
 *                               example: "ENG-001"
 *                     createdBy:
 *                       type: string
 *                       example: 66604e2eb31eb4eaffd2641d
 *                     updatedBy:
 *                       type: string
 *                       example: 66604e2eb31eb4eaffd2641d
 *       400:
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingSpareId:
 *                 summary: Missing spare ID
 *                 value:
 *                   message: "Spare id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               MissingAssetId:
 *                 summary: Missing asset ID
 *                 value:
 *                   message: "Asset id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *       401:
 *         description: Unauthorized due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       404:
 *         description: Spare not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Spare does not exist
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Some internal server error.
*/


/**
 * @swagger
 * /api/v1/spares:
 *   put:
 *     summary: Edit spares
 *     description: Updates multiple spares in the inventory
 *     tags:
 *       - Spares
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spares:
 *                 type: array
 *                 items:
 *                   anyOf:
 *                     - type: string
 *                       description: Spare ID (MongoDB ObjectId) as a standalone string
 *                       example: "605c72ef1e153a2b6c8e4d2f"
 *                     - type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Spare ID (MongoDB ObjectId)
 *                           example: "605c72ef1e153a2b6c8e4d2f"
 *                         name:
 *                           type: string
 *                           description: Updated name of the spare (must be unique)
 *                           example: "Gearbox"
 *                         assetId:
 *                           type: string
 *                           description: Updated ID of the associated asset (MongoDB ObjectId, optional)
 *                           example: "605c72ef1e153a2b6c8e4d2e"
 *                         description:
 *                           type: string
 *                           description: Updated description of the spare
 *                           example: "Replacement gearbox for engine"
 *                         quantity:
 *                           type: object
 *                           description: Updated quantity details
 *                           properties:
 *                             value:
 *                               type: integer
 *                               description: Updated total quantity
 *                               example: 15
 *                           required:
 *                             - value
 *                         partNumber:
 *                           type: string
 *                           description: Updated part number
 *                           example: "GBX-12345"
 *                         cost:
 *                           type: number
 *                           description: Updated cost (optional)
 *                           example: 175.50
 *                         minimumSpareQuantity:
 *                           type: integer
 *                           description: Updated minimum quantity to maintain
 *                           example: 5
 *                       required:
 *                         - id
 *             required:
 *               - spares
 *     responses:
 *       200:
 *         description: Spare updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spare Updated Successfully
 *                 result:
 *                   type: null               
 *       400:
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             examples:
 *               InvalidSparesArray:       
 *                 summary: Spares not a non-empty array
 *                 value:
 *                   message: "Spares must be a non-empty array of objects with 'id' as a string property or strings"
 *                   errorinfo: null
 *               InvalidAssetIds:        
 *                 summary: Invalid asset IDs provided
 *                 value:
 *                   message: "Failed! Invalid Asset ids"
 *                   invalidAssetIds: ["67daf4382dc6749c218d3ee9"]
 *               DuplicateSpareNames:     
 *                 summary: Duplicate spare names detected
 *                 value:
 *                   message: "Duplicate Spare Name"
 *                   duplicateNames: ["Spare A"]
 *               NonExistentSpares:        
 *                 summary: Some spares do not exist
 *                 value:
 *                   message: "Failed! Some spares do not exist"
 *                   invalidSpares: ["67daf4382dc6749c218d3ee8"]
 *               ValidatiionError:       
 *                 summary: Validation Error
 *                 value:
 *                   message: "Validation error - Client side error"
 *                   errorinfo: null
 *       401:
 *         description: Unauthorized due to missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Internal server error.
*/


/**
 * @swagger
 * /api/v1/spares/delete:
 *   put:
 *     summary: Deletes specified spares.
 *     tags:
 *       - Spares
 *     security:
 *       - earerAuth: []
 *     description: This endpoint is used to delete specified spares from the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spares:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["66604cbb616858a39513595d"]
 *     responses:
 *       200:
 *         description: Spares deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Spares Deleted Successfully
 *                 result:
 *                   type: null
 *       400:
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             examples:
 *               InvalidSparesArray:
 *                 summary: Spares not a non-empty array
 *                 value:
 *                   message: "Spares must be a non-empty array of objects with 'id' as a string property or strings"
 *                   errorinfo: null
 *               NonExistentSpares:
 *                 summary: Some spares do not exist
 *                 value:
 *                   message: "Failed! Some spares do not exist"
 *                   invalidSpares: ["605c72ef1e153a2b6c8e9999"]
 *       401:
 *         description: Unauthorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Internal server error.
 */
