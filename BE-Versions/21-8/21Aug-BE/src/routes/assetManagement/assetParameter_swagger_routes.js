/**
 * @swagger
 * /api/v1/assets/{asset}/parameters:
 *   post:
 *     summary: Create a new asset parameter
 *     description: |
 *       This endpoint is used to create a new asset parameter.
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
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to add a parameter to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the parameter
 *                 maxLength: 50
 *                 example: "Temperature"
 *               value:
 *                 type: string
 *                 description: Value of the parameter
 *                 maxLength: 10
 *                 example: "85"
 *               unit:
 *                 type: string
 *                 description: Unit of the parameter
 *                 maxLength: 100
 *                 example: "Celsius"
 *     responses:
 *       201:
 *         description: Parameter created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Parameter created successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f5c6a2d9e73c3a5c12d678"
 *       400:
 *         description: Bad request due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingName:
 *                 summary: Name is required
 *                 value:
 *                   message: "Failed! name is required"
 *                   errorinfo: null
 *               MissingValue:
 *                 summary: Value is required
 *                 value:
 *                   message: "Failed! value is required"
 *                   errorinfo: null
 *               MissingUnit:
 *                 summary: Unit is required
 *                 value:
 *                   message: "Failed! unit is required"
 *                   errorinfo: null
 *               MissingAsset:
 *                 summary: Missing Asset Id
 *                 value:
 *                   message: "Asset id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               Invalidname:
 *                 summary: Invalid Name type
 *                 value:
 *                   message: "Failed! Name must be a string"
 *                   errorinfo: null
 *               InvalidValue:
 *                 summary: Invalid Value type
 *                 value:
 *                   message: "Failed! value must be a string"
 *                   errorinfo: null
 *               InvalidUnit:
 *                 summary: Invalid unit type
 *                 value:
 *                   message: "Failed! unit must be a string"
 *                   errorinfo: null
 *               InvalidValuetype:
 *                 summary: Invalid Value 
 *                 value:
 *                   message: "Failed! value should contain only alphanumeric characters"
 *                   errorinfo: null
 *               NameTooLong:
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorinfo: null
 *               ValueTooLong:
 *                 summary: Value exceeds max length
 *                 value:
 *                   message: "Failed! value should not exceed 10 characters"
 *                   errorinfo: null
 *               UnitTooLong:
 *                 summary: Unit exceeds max length
 *                 value:
 *                   message: "Failed! unit should not exceed 100 characters"
 *                   errorinfo: null
 *               DuplicateName:
 *                 summary: Duplicate parameter name
 *                 value:
 *                   message: "Failed! name already exists in the server"
 *                   errorinfo: null
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
 *       404:
 *         description: Asset not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Asset does not exist"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/


/**
 * @swagger
 * /api/v1/assets/{asset}/parameters/bulkCreate:
 *   post:
 *     summary: Create multiple asset parameters
 *     description: |
 *       This endpoint is used to create multiple asset parameters.
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
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to add parameters to
 *       - in: query
 *         name: fetchByField
 *         required: false
 *         schema:
 *           type: string
 *           enum: [name, number, serialNumber]
 *         description: The field to fetch the asset by
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *         description: Business unit to filter the asset
 *       - in: query
 *         name: department
 *         required: false
 *         schema:
 *           type: string
 *         description: Department to filter the asset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the parameter
 *                       maxLength: 50
 *                       example: "Temperature"
 *                     value:
 *                       type: string
 *                       description: Value of the parameter
 *                       maxLength: 10
 *                       example: "85"
 *                     unit:
 *                       type: string
 *                       description: Unit of the parameter
 *                       maxLength: 50
 *                       example: "Celsius"
 *     responses:
 *       201:
 *         description: Parameters created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameters created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ids:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: 
 *                           - "605c72ef1e153a2b6c8e4d32"
 *                           - "605c72ef1e153a2b6c8e4d33"
 *       400:
 *         description: Bad request due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingAssetId:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: "Failed! Asset id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               MissingParameters:
 *                 summary: Missing Parameters Array
 *                 value:
 *                   message: "Failed! Parameters are required"
 *                   errorinfo: null
 *               EmptyParametersArray:
 *                 summary: Empty Parameters Array
 *                 value:
 *                   message: "Failed! Parameters must be a non-empty array of objects"
 *                   errorinfo: null
 *               MissingName:
 *                 summary: Name is required
 *                 value:
 *                   message: "Failed! name is required"
 *                   errorinfo: null
 *               InvalidNameType:
 *                 summary: Invalid Name type
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorinfo: null
 *               NameTooLong:
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorinfo: null
 *               DuplicateNameInRequest:
 *                 summary: Duplicate names found in request
 *                 value:
 *                   message: "Duplicate names found in request"
 *                   duplicateNamesInRequest: ["Voltage", "Temperature"]
 *               DuplicateNameInDatabase:
 *                 summary: Duplicate names found in the database
 *                 value:
 *                   message: "Duplicate names found for the asset"
 *                   duplicateNamesInDatabase: ["Pressure", "Flow Rate"]
 *               MissingValue:
 *                 summary: Value is required
 *                 value:
 *                   message: "Failed! value is required"
 *                   errorinfo: null
 *               InvalidValueType:
 *                 summary: Invalid Value type
 *                 value:
 *                   message: "Failed! value must be a string"
 *                   errorinfo: null
 *               ValueTooLong:
 *                 summary: Value exceeds max length
 *                 value:
 *                   message: "Failed! value should not exceed 10 characters"
 *                   errorinfo: null
 *               InvalidValueFormat:
 *                 summary: Value contains non-alphanumeric characters
 *                 value:
 *                   message: "Failed! value should contain only alphanumeric characters"
 *                   errorinfo: null
 *               MissingUnit:
 *                 summary: Unit is required
 *                 value:
 *                   message: "Failed! unit is required"
 *                   errorinfo: null
 *               InvalidUnitType:
 *                 summary: Invalid Unit type
 *                 value:
 *                   message: "Failed! unit must be a string"
 *                   errorinfo: null
 *               UnitTooLong:
 *                 summary: Unit exceeds max length
 *                 value:
 *                   message: "Failed! unit should not exceed 100 characters"
 *                   errorinfo: null
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
 *       404:
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Asset does not exist"
 *       500:
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
 * /api/v1/assets/{asset}/parameters:
 *   put:
 *     summary: Bulk update asset parameters
 *     tags:
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to update parameters for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parametersToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of parameter IDs to delete
 *                 example: ["60c72b1f4f1a2c001f9d9a1d", "60c72b2f4f1a2c001f9d9a1e"]
 *               parametersToEdit:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the parameter to edit
 *                       example: "60c72b3f4f1a2c001f9d9a1f"
 *                     name:
 *                       type: string
 *                       description: Name of the parameter
 *                       maxLength: 50
 *                       example: "Temperature"
 *                     value:
 *                       type: string
 *                       description: Value of the parameter
 *                       maxLength: 10
 *                       example: "85"
 *                     unit:
 *                       type: string
 *                       description: Unit of the parameter
 *                       maxLength: 50
 *                       example: "Celsius"
 *                     trackingStatus:
 *                       type: string
 *                       enum: ["active", "inactive", "archived"]
 *                       description: Tracking status of the parameter
 *                       example: "active"
 *     responses:
 *       200:
 *         description: Parameters updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameters updated successfully
 *       400:
 *         description: Bad request due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingParametersToEdit:       
 *                 summary: Missing parameters to edit
 *                 value:
 *                   message: "Failed! Parameters to edit are required"
 *               EmptyParametersToDelete:          
 *                 summary: Empty Parameters To Delete
 *                 value:
 *                   message: "Failed! Parameters to delete must be a non-empty array of IDs"
 *               EmptyParametersToEdit:      
 *                 summary: Empty Parameters To Edit
 *                 value:
 *                   message: "Failed! Parameters to edit must be a non-empty array of objects"
 *               MissingParameter:     
 *                 summary: Missing Parameters 
 *                 value:
 *                   message: "Parameter id is required"
 *               InvalidParameterID:  
 *                 summary: Invalid Parameter IDs
 *                 value:
 *                   message: "Failed! Invalid Parameter IDs"
 *               DuplicateIds:       
 *                 summary: Duplicate IDs found
 *                 value:
 *                   message: "Failed! Duplicate ID found"
 *                   duplicateIds: ["60f5c6a2d9e73c3a5c12d345", "60f5c6a2d9e73c3a5c12d346"]
 *               MissingName:      
 *                 summary: Name is required
 *                 value:
 *                   message: "Failed! name is required"
 *               InvalidName:          
 *                 summary: Invalid Name type
 *                 value:
 *                   message: "Failed! Name must be a string"
 *               NameExceedsMaxLength:       
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! Name should not exceed 50 characters"
 *               InvalidValue:     
 *                 summary: Invalid Value
 *                 value:
 *                   message: "Failed! Value must be a string"
 *               ValueExceedsMaxLength:       
 *                 summary: Value exceeds max length
 *                 value:
 *                   message: "Failed! Value should not exceed 10 characters"
 *               InvalidValueType:       
 *                 summary: Invalid Value type
 *                 value:
 *                   message: "Failed! Value must be an alphanumeric string"
 *               MissingValue:       
 *                 summary: Value is required
 *                 value:
 *                   message: "Failed! Value is required"
 *               UnitExceedsMaxLength:       
 *                 summary: Unit exceeds max length
 *                 value:
 *                   message: "Failed! Unit should not exceed 100 characters"
 *               InvalidUnitType:     
 *                 summary: Invalid Unit type
 *                 value:
 *                   message: "Failed! Unit must be a string"
 *               MissingUnit:        
 *                 summary: Unit is required
 *                 value:
 *                   message: "Failed! Unit is required"
 *               InvalidTrackingStatus:     
 *                 summary: Invalid TrackingStatus
 *                 value:
 *                   message: "Failed! Invalid TrackingStatus"
 *               DuplicateNamesInRequest:   
 *                 summary: Duplicate names found in request
 *                 value:
 *                   message: "Duplicate names found in request"
 *                   duplicateNamesInRequest: ["Voltage", "Temperature"]
 *               DuplicateNamesInDatabase:      
 *                 summary: Duplicate names found in server
 *                 value:
 *                   message: "Duplicate names found in server"
 *                   duplicateNamesInDatabase: ["Pressure", "Flow Rate"]
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
 *       404:
 *         description: Asset parameter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset parameter with ID 60f5c6a2d9e73c3a5c12d345 not found"
 *       500:
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
 * /api/v1/assets/{asset}/parameters/{parameter}:
 *   put:
 *     summary: Update an asset parameter
 *     tags:
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset
 *       - in: path
 *         name: parameter
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the parameter to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the parameter
 *                 maxLength: 50
 *                 example: "Temperature"
 *               value:
 *                 type: string
 *                 description: Value of the parameter
 *                 maxLength: 10
 *                 example: "85"
 *               unit:
 *                 type: string
 *                 description: Unit of the parameter
 *                 maxLength: 100
 *                 example: "Celsius"
 *               trackingStatus:
 *                 type: string
 *                 enum: ["active", "inactive", "archived"]
 *                 description: Tracking status of the parameter
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Parameter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameter updated successfully
 *       400:
 *         description: Bad request due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               InvalidName:
 *                 summary: Invalid Name type
 *                 value:
 *                   message: "Failed! Name must be a string"
 *               NameExceedsMaxLength:
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! Name should not exceed 50 characters"
 *               DuplicateNamesInDatabase:      
 *                 summary: Duplicate names found in server
 *                 value:
 *                   message: "Duplicate names found in server"
 *                   duplicateNamesInDatabase: ["Pressure", "Flow Rate"]
 *               MissingName:      
 *                 summary: Name is required
 *                 value:
 *                   message: "Failed! name is required"
 *               InvalidValue:     
 *                 summary: Invalid Value
 *                 value:
 *                   message: "Failed! Value must be a string"
 *               ValueExceedsMaxLength:       
 *                 summary: Value exceeds max length
 *                 value:
 *                   message: "Failed! Value should not exceed 10 characters"
 *               InvalidValueType:       
 *                 summary: Invalid Value type
 *                 value:
 *                   message: "Failed! Value must be an alphanumeric string"
 *               MissingValue:       
 *                 summary: Value is required
 *                 value:
 *                   message: "Failed! Value is required"
 *               UnitExceedsMaxLength:       
 *                 summary: Unit exceeds max length
 *                 value:
 *                   message: "Failed! Unit should not exceed 100 characters"
 *               InvalidUnitType:     
 *                 summary: Invalid Unit type
 *                 value:
 *                   message: "Failed! Unit must be a string"
 *               MissingUnit:        
 *                 summary: Unit is required
 *                 value:
 *                   message: "Failed! Unit is required"
 *               InvalidTrackingStatus:     
 *                 summary: Invalid TrackingStatus
 *                 value:
 *                   message: "Failed! Invalid TrackingStatus"
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
 *       404:
 *         description: Asset parameter not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset parameter not found"
 *       500:
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
 * /api/v1/assets/{asset}/parameters:
 *   delete:
 *     summary: Bulk delete asset parameters
 *     description: Deletes multiple asset parameters by marking them as deleted.
 *     tags:
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to delete parameters from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parametersToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of parameter IDs to delete
 *                 example: ["60c72b1f4f1a2c001f9d9a1d", "60c72b2f4f1a2c001f9d9a1e"]
 *     responses:
 *       200:
 *         description: Parameters deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameters deleted successfully
 *       400:
 *         description: Bad request due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingParameterIds:
 *                 summary: Missing Parameter IDs
 *                 value:
 *                   message: "Parameter ids are required"
 *               InvalidParameterIds:
 *                 summary: Invalid Parameter IDs format
 *                 value:
 *                   message: "Parameter ids must be a non-empty array of strings"
 *               DuplicateParameterIds:
 *                 summary: Duplicate IDs found
 *                 value:
 *                   message: "Failed! Duplicate id found"
 *                   duplicateIds: ["65aef23bcd12345678900001"]
 *               InvalidParameterIdsInDB:
 *                 summary: Invalid Parameter IDs in database
 *                 value:
 *                   message: "Failed! Invalid Parameter ids"
 *                   invalidParameterIds: ["65aef23bcd12345678900003"]
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
 *       500:
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
 * /api/v1/assets/{asset}/parameters:
 *   get:
 *     summary: Fetch all asset parameters
 *     description: Retrieves a list of asset parameters 
 *     tags:
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to fetch parameters for
 *         example: "605c72ef1e153a2b6c8e4d2e"
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by parameter name
 *         example: "Temperature"
 *       - in: query
 *         name: value
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by parameter value
 *         example: "25"
 *       - in: query
 *         name: unit
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by parameter unit
 *         example: "Celsius"
 *       - in: query
 *         name: trackingStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *         description: Filter by tracking status
 *         example: "Active"
 *       - in: query
 *         name: isComparable
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by comparability
 *         example: true
 *       - in: query
 *         name: createdAt
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter parameters by creation date
 *         example: "2023-01-01T00:00:00Z"
 *       - in: query
 *         name: updatedAt
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter parameters by last update date
 *         example: "2023-01-02T00:00:00Z"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Parameters fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parameters fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of parameters
 *                       example: 50
 *                     parameters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "66b9fe45278a269d2a8a8f42"
 *                           name:
 *                             type: string
 *                             example: "Parameter"
 *                           value:
 *                             type: string
 *                             example: "123"
 *                           unit:
 *                             type: string
 *                             example: "mm"
 *                           isTrackingEnabled:
 *                             type: boolean
 *                             example: true
 *                           isComparable:
 *                             type: boolean
 *                             example: false
 *                           trackingStatus:
 *                             type: string
 *                             enum: [active, inactive, archived]
 *                             example: avtive
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Name must be a string"
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
 *       500:
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
 * /api/v1/assets/{asset}/parameters/{parameter}:
 *   get:
 *     summary: Fetch an asset parameter
 *     description: Retrieves a specific asset parameter based on its ID.
 *     tags:
 *       - Asset parameter
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset
 *       - in: path
 *         name: parameter
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset parameter to fetch.
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name]
 *         description: Fetch by parameter name instead of ID.
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit filter (required if fetching by name).
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by parameter name (case-insensitive)
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         description: Filter by parameter value (case-insensitive)
 *       - in: query
 *         name: unit
 *         schema:
 *           type: string
 *         description: Filter by parameter unit (case-insensitive)
 *       - in: query
 *         name: trackingStatus
 *         schema:
 *           type: string
 *         description: Filter by tracking status (case-insensitive)
 *       - in: query
 *         name: isComparable
 *         schema:
 *           type: boolean
 *         description: Filter by whether the parameter is comparable
 *       - in: query
 *         name: createdAt
 *         description: "Filter by creation date"
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00Z"
 *       - in: query
 *         name: updatedAt
 *         description: "Filter by last updated date"
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-03-31T12:00:00Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of results per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Parameter fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Parameters fetched successfully"
 *                 data:
 *                   type: object
 *                   description: The fetched parameter details
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique identifier of the parameter (MongoDB ObjectId)
 *                       example: "605c72ef1e153a2b6c8e4d2f"
 *                     name:
 *                       type: string
 *                       description: The name of the parameter
 *                       example: "Temperature"
 *                     value:
 *                       type: string
 *                       description: The value of the parameter
 *                       example: "85"
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for the parameter
 *                       example: "Celsius"
 *                     asset:
 *                       type: object
 *                       description: Details of the associated asset
 *                       properties:
 *                         generalDetails:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the asset
 *                               example: "Engine A"
 *                             number:
 *                               type: string
 *                               description: The asset's identification number
 *                               example: "ENG-001"
 *                         id:
 *                           type: string
 *                           description: The unique identifier of the asset (MongoDB ObjectId)
 *                           example: "605c72ef1e153a2b6c8e4d2e"
 *                     isTrackingEnabled:
 *                       type: boolean
 *                       description: Indicates if tracking is enabled for the parameter
 *                       example: true
 *                     isComparable:
 *                       type: boolean
 *                       description: Indicates if the parameter can be compared
 *                       example: false
 *                     trackingStatus:
 *                       type: string
 *                       description: The current tracking status of the parameter
 *                       example: "active"
 *       400:
 *         description: Bad request due to invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               MissingParameterId:
 *                 summary: Missing Parameter ID
 *                 value:
 *                   message: "Parameter id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               InvalidParameterId:
 *                 summary: Invalid Parameter ID
 *                 value:
 *                   message: "Failed! Invalid Parameter Id"
 *                   errorinfo: null
 *               InvalidAssetId:
 *                 summary: Invalid Asset ID 
 *                 value:
 *                   message: "Failed! Invalid Asset Id"
 *                   errorinfo: null
 *               MissingAssetId:
 *                 summary: Missing Asset ID when fetching by name
 *                 value:
 *                   message: "Asset id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
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
 *       404:
 *         description: The requested asset parameter was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               ParameterNotFound:
 *                 summary: Asset Parameter Not Found
 *                 value:
 *                   message: "Failed! Asset Parameter does not exist"
 *                   errorinfo: null
 *               ParameterForAssetNotFound:
 *                 summary: Parameter for this Asset does not exist
 *                 value:
 *                   message: "Failed! Parameter for this Asset does not exist"
 *                   errorinfo: null
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error"
*/
