/**
 * @swagger
 * /api/v1/assets/count:
 *   get:
 *     summary: Get the count of assets
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Asset count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset count fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssets:
 *                       type: integer
 *                       example: 100
 *                     activeAssets:
 *                       type: integer
 *                       example: 70
 *                     underMaintainanceAssets:
 *                       type: integer
 *                       example: 10
 *                     decommissionedAssets:
 *                       type: integer
 *                       example: 5
 *                     breakdownAssets:
 *                       type: integer
 *                       example: 10
 *                     standbyAssets:
 *                       type: integer
 *                       example: 5
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
 *         description: Some internal server error
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
 * /api/v1/assets:
 *   get:
 *     summary: Fetch a list of assets
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name of the asset to search for
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Number of the asset to search for
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit ID to filter assets
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department ID to filter assets
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *         description: Created date range to filter assets (comma separated)
 *       - in: query
 *         name: updatedAt
 *         schema:
 *           type: string
 *         description: Updated date range to filter assets (comma separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "createdAt"
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           example: "asc"
 *         description: Sort order (asc or desc)
 *     responses:
 *       200:
 *         description: Assets fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assets Fetched Successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 10
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
 *                             example: "60d0fe4f5311236168a109ca"
 *                           generalDetails:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Asset Name"
 *                               number:
 *                                 type: string
 *                                 example: "12345"
 *                               description:
 *                                 type: string
 *                                 example: "This is a 3 phase transformer"
 *                               runningMode:
 *                                 type: string
 *                                 example: "Rotating"
 *                               businessUnit:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "Crion"
 *                                   id:
 *                                     type: string
 *                                     example: "6641959acbe6ea3941e60789"
 *                               department:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "Civil"
 *                                   id:
 *                                     type: string
 *                                     example: "6690d88bdc6ec1c4a01c58ce"
 *                               criticalityLevel:
 *                                 type: string
 *                                 example: "Emergency"
 *                               functionalArea:
 *                                 type: string
 *                                 example: "Water Dew Point Depression"
 *                               owner:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                     example: "Selva J"
 *                                   email:
 *                                     type: string
 *                                     example: "selva@criontech.com"
 *                                   id:
 *                                     type: string
 *                                     example: "6682640ace2038006d1892c2"
 *                           status:
 *                             type: string
 *                             example: "Active"
 *                           isRegistrationCompleted:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             example: "2022-01-01T00:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: "2022-01-02T00:00:00.000Z"
 *                           image:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "66a1d8cfd05add91630d2946"
 *                               name:
 *                                 type: string
 *                                 example: "transformer"
 *                               extension:
 *                                 type: string
 *                                 example: "png"
 *                               contentType:
 *                                 type: string
 *                                 example: "image/png"
 *                               url:
 *                                 type: string
 *                                 example: "https://example.com/path/to/image.png"
 *                               size:
 *                                 type: integer
 *                                 example: 986
 *                               moduleName:
 *                                 type: string
 *                                 example: "assets"
 *                               moduleId:
 *                                 type: string
 *                                 example: "66a1d8cfd05add91630d2945"
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
 *               MissingCreatedAt:
 *                 summary: Missing CreatedAt
 *                 value:
 *                   message: CreatedAt must be a non-empty string with comma separated values
 *                   errorInfo: null
 *               MissingCreatedAtDate:
 *                 summary: Missing CreatedAt date
 *                 value:
 *                   message: CreatedAt must be a non-empty string of date with comma separated values
 *                   errorinfo: null
 *               MissingUpdatedAt:
 *                 summary: Missing UpdatedAt
 *                 value:
 *                   message: UpdatedAt must be a non-empty string with comma separated values
 *                   errorInfo: null
 *               MissingUpdatedAtDate:
 *                 summary: Missing UpdatedAt date
 *                 value:
 *                   message: UpdatedAt must be a non-empty string of date with comma separated values
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
 *         description: Some internal server error
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
 * /api/v1/assets/{asset}/incompleteRegisterationDetails:
 *   get:
 *     summary: Fetch incomplete registration details of an asset
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID or other identifier to fetch incomplete registration details
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name, number, serialNumber]
 *         description: Field to fetch asset by (optional)
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit ID to filter the asset (optional)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department ID to filter the asset (optional)
 *     responses:
 *       200:
 *         description: Incomplete registration details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assets incomplete registration details fetched successfully
 *                 data:
 *                   type: object
 *                   description: Details of incomplete registration
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
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
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Asset does not exist
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
 * /api/v1/assets/{asset}:
 *   get:
 *     summary: Fetch an asset by its ID or identifier
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID or identifier to fetch the asset
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name, number, serialNumber]
 *         description: Field to fetch asset by (optional)
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit ID to filter the asset (optional)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department ID to filter the asset (optional)
 *     responses:
 *       200:
 *         description: Asset fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset Fetched Successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: Active
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 66a0263f232d3f374a934a1d
 *                           name:
 *                             type: string
 *                             example: sample
 *                           extension:
 *                             type: string
 *                             example: js
 *                           contentType:
 *                             type: string
 *                             example: application/octet-stream
 *                           url:
 *                             type: string
 *                             example: https://example.com/path/to/image.png
 *                           size:
 *                             type: integer
 *                             example: 1095
 *                           moduleName:
 *                             type: string
 *                             example: assets
 *                           moduleId:
 *                             type: string
 *                             example: 66a0acf9af463b08f9febd2d
 *                     generalDetails:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: 3ph-Transformer
 *                         number:
 *                           type: string
 *                           example: TFM-0061211g
 *                         businessUnit:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Crion
 *                             id:
 *                               type: string
 *                               example: 6641959acbe6ea3941e60789
 *                         department:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Civil
 *                             id:
 *                               type: string
 *                               example: 6690d88bdc6ec1c4a01c58ce
 *                         criticalityLevel:
 *                           type: string
 *                           example: Emergency
 *                         functionalArea:
 *                           type: string
 *                           example: Water Dew Point Depression
 *                         owner:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Selva J
 *                             email:
 *                               type: string
 *                               example: selva@criontech.com
 *                             id:
 *                               type: string
 *                               example: 6682640ace2038006d1892c2
 *                         description:
 *                           type: string
 *                           example: Test
 *                         runningMode:
 *                           type: string
 *                           example: Rotating
 *                     isRegistrationCompleted:
 *                       type: boolean
 *                       example: false
 *                     updatedBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Selva J
 *                         email:
 *                           type: string
 *                           example: selva@criontech.com
 *                         id:
 *                           type: string
 *                           example: 6682640ace2038006d1892c2
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Selva J
 *                         email:
 *                           type: string
 *                           example: selva@criontech.com
 *                         id:
 *                           type: string
 *                           example: 6682640ace2038006d1892c2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-07-24T07:27:53.030Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-07-29T18:49:39.757Z
 *                     locationAndHierarchyDetails:
 *                       type: object
 *                       properties:
 *                         geographicalCoordinates:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               format: float
 *                               example: -44.212
 *                             longitude:
 *                               type: number
 *                               format: float
 *                               example: 44.212
 *                             elevation:
 *                               type: number
 *                               format: float
 *                               example: -44.21
 *                         hierarchy:
 *                           type: object
 *                           parent: true
 *                     specifications:
 *                       type: object
 *                       properties:
 *                         manufacturingDetails:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: Standard Asset
 *                             make:
 *                               type: string
 *                               example: Crion
 *                             model:
 *                               type: string
 *                               example: Clonos
 *                             serialNumber:
 *                               type: string
 *                               example: 264315222
 *                             manufacturer:
 *                               type: string
 *                               example: Crion
 *                             installationDate:
 *                               type: string
 *                               format: date-time
 *                               example: 2023-01-01T00:00:00.000Z
 *                             serviceLiquid:
 *                               type: string
 *                               example: test
 *                         hazardousAreaDetails:
 *                           type: object
 *                           properties:
 *                             zoneClassification:
 *                               type: string
 *                               example: ZON
 *                             gasGroup:
 *                               type: string
 *                               example: G2
 *                             temperatureClassification:
 *                               type: string
 *                               example: T1
 *                         warrantyDetails:
 *                           type: object
 *                           properties:
 *                             isWarrantyIncluded:
 *                               type: boolean
 *                               example: false
 *                             supplierName:
 *                               type: string
 *                               example: Admin
 *                             supplierEmail:
 *                               type: string
 *                               example: admin@criontech.com
 *                             warrantyPeriod:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                   example: "12"
 *                                 type:
 *                                   type: string
 *                                   example: Months
 *                             warrantyEndDate:
 *                               type: string
 *                               format: date-time
 *                               example: 2024-01-01T00:00:00.000Z
 *                             termsAndConditions:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: 66a7e3d6d613a5ae134c333f
 *                                 name:
 *                                   type: string
 *                                   example: sample
 *                                 extension:
 *                                   type: string
 *                                   example: png
 *                                 contentType:
 *                                   type: string
 *                                   example: image/png
 *                                 url:
 *                                   type: string
 *                                   example: https://example.com/path/to/image.png
 *                                 size:
 *                                   type: integer
 *                                   example: 8640
 *                                 moduleName:
 *                                   type: string
 *                                   example: assets
 *                                 moduleId:
 *                                   type: string
 *                                   example: 66a0acf9af463b08f9febd2d
 *                         calibrationDetails:
 *                           type: object
 *                           properties:
 *                             lastCalibrationDate:
 *                               type: string
 *                               format: date-time
 *                               example: 2023-06-01T00:00:00.000Z
 *                             calibrationCycle:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                   example: "12"
 *                                 type:
 *                                   type: string
 *                                   example: Months
 *                             corrosionCheckDate:
 *                               type: string
 *                               format: date-time
 *                               example: 2023-12-01T00:00:00.000Z
 *                             corrosionCycle:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                   example: "12"
 *                                 type:
 *                                   type: string
 *                                   example: Months
 *                             designThickness:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                   example: "15"
 *                                 type:
 *                                   type: string
 *                                   example: mm
 *                             allowableThickness:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: integer
 *                                   example: 20
 *                                 type:
 *                                   type: string
 *                                   example: mm
 *                             meanTimeToRepair:
 *                               type: integer
 *                               example: 2
 *                             meanTimeBetweenFailures:
 *                               type: integer
 *                               example: 600
 *                             lastAuditDate:
 *                               type: string
 *                               format: date-time
 *                               example: 2024-06-17T05:25:07.205Z
 *                     id:
 *                       type: string
 *                       example: 66a0acf9af463b08f9febd2d
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
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
 *                   example: Asset not found
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
 *                   example: Some internal server error
 */


/**
 * @swagger
 * /api/v1/assets:
 *   post:
 *     summary: Create a new asset with general details
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               generalDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     maxLength: 50
 *                     example: "asset 123"
 *                     description: Name of the asset (required, unique)
 *                   number:
 *                     type: string
 *                     maxLength: 15
 *                     example: "123"
 *                     description: Asset number (required, unique)
 *                   description:
 *                     type: string
 *                     maxLength: 1000
 *                     example: "Asset 1"
 *                     description: Description of the asset
 *                   department:
 *                     type: string
 *                     example: "66ba01440d19d3e138726adb"
 *                     description: Department ID (required)
 *                   businessUnit:
 *                     type: string
 *                     example: "66ba01440d19d3e138726adf"
 *                     description: Business unit ID (required)
 *                   criticalityLevel:
 *                     type: string
 *                     example: "Emergency"
 *                     description: Criticality level of the asset (required, enum values)
 *                   runningMode:
 *                     type: string
 *                     example: "Rotating"
 *                     description: Running mode of the asset (enum values)
 *                   functionalArea:
 *                     type: string
 *                     example: "Production - refinery"
 *                     description: Functional area of the asset (required, enum values)
 *                   owner:
 *                     type: string
 *                     example: "66ba01440d19d3e138726adc"
 *                     description: Owner ID (required)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image IDs associated with the asset
 *     responses:
 *       201:
 *         description: Asset created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the created asset
 *       '400':
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               MissingName: 
 *                 summary: Missing Name
 *                 value:
 *                   message: Tasks must be a non-empty string
 *                   errorInfo: null
 *               MissingNumber:  
 *                 summary: Missing Number
 *                 value:
 *                   message: Number must be a non-empty string
 *                   errorInfo: null
 *               MissingDescription:  
 *                 summary: Missing Description
 *                 value:
 *                   message: Description must be a non-empty string
 *                   errorInfo: null
 *               MaxName:  
 *                 summary: Maximum name length reached
 *                 value:
 *                   message: Failed! Name should not exceed 50 characters
 *                   errorInfo: null
 *               MaxNumber:  
 *                 summary: Maximum number reached
 *                 value:
 *                   message: Failed! Number should not exceed 15 characters
 *                   errorInfo: null
 *               MaxDescription:  
 *                 summary: Maximum description length reached
 *                 value:
 *                   message: Failed! Description should not exceed 1000 characters
 *                   errorInfo: null
 *               Duplicatename:  
 *                 summary: Name already exist
 *                 value:
 *                   message: Failed! Name already exists in the server
 *                   errorInfo: null
 *               Duplicatenumber:  
 *                 summary: Name already exist
 *                 value:
 *                   message: Failed! Number already exists in the server
 *                   errorInfo: null
 *               NameRequired:  
 *                 summary: Name is required
 *                 value:
 *                   message: Failed! Name is required
 *                   errorInfo: null
 *               NumberRequired:  
 *                 summary: Number is required
 *                 value:
 *                   message: Failed! Number is required
 *                   errorInfo: null
 *               DepartmentRequired:  
 *                 summary: Department is required
 *                 value:
 *                   message: Failed! Department is required
 *                   errorInfo: null
 *               OwnerRequired:  
 *                 summary: Owner is required
 *                 value:
 *                   message: Failed! Owner is required
 *                   errorInfo: null
 *               InvalidDepartment:  
 *                 summary: Invalid department
 *                 value:
 *                   message: "Falied! Invalid department"
 *                   errorInfo: null
 *               InvalidBusinessUnit:  
 *                 summary: Invalid BusinessUnit
 *                 value:
 *                   message: "Falied! Invalid BusinessUnit"
 *                   errorInfo: null
 *               InvalidCategory:  
 *                 summary: Invalid Category
 *                 value:
 *                   message: "Falied! Invalid Category"
 *                   errorInfo: null
 *               InvalidOwner:  
 *                 summary: Invalid owner
 *                 value:
 *                   message: "Falied! Invalid owner"
 *                   errorInfo: null
 *               InvalidCriticalityLevel:  
 *                 summary: Invalid CriticalityLevel
 *                 value:
 *                   message: "Falied! Invalid criticalityLevel"
 *                   errorInfo: null
 *               InvalidRunningMode:  
 *                 summary: Invalid runningMode
 *                 value:
 *                   message: "Falied! Invalid runningMode"
 *                   errorInfo: null
 *               InvalidfunctionalArea:  
 *                 summary: Invalid functionalArea
 *                 value:
 *                   message: "Falied! Invalid functionalArea"
 *                   errorInfo: null
 *               InvalidImage:  
 *                 summary: Invalid image
 *                 value:
 *                   message: Failed! Images should be an array of IDs
 *                   errorInfo: null
 *               MaxImage:  
 *                 summary: Maximum images reached
 *                 value:
 *                   message: Failed! Images should not exceed 6 images
 *                   errorInfo: null
 *               MissingFileIDs: 
 *                 summary: Missing File IDs
 *                 value:
 *                   message: File IDs must be a non-empty array of strings
 *                   errorInfo: null
 *               DuplicateFiles:  
 *                 summary: Duplicate File Ids
 *                 value:
 *                   message: Duplicate file ids are not allowed
 *                   errorInfo: null
 *               InvalidFileIDs:  
 *                 summary: Invalid File Ids
 *                 value:
 *                   message: "Falied! Invalid File IDs"
 *                   errorInfo: null
 *               ValidationError:    
 *                 summary: Validation Error
 *                 value:
 *                   message: Falied! Validation Error!
 *                   errorInfo: null
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
 *                   example: Some internal server error
 */


/**
 * @swagger
 * /api/v1/assets/{asset}:
 *   put:
 *     summary: Update an asset by ID
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to update
 *       - in: body
 *         name: body
 *         required: true
 *         description: The asset update request body
 *         schema:
 *           type: object
 *           properties:
 *             specifications:
 *               type: object
 *               properties:
 *                 manufacturingDetails:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "Standard asset"
 *                     make:
 *                       type: string
 *                       example: "Crion"
 *                     model:
 *                       type: string
 *                       example: "clonos"
 *                     serialNumber:
 *                       type: string
 *                       example: "264315223"
 *                     manufacturer:
 *                       type: string
 *                       example: "Crion"
 *                     installationDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01T00:00.000+00:00"
 *                     serviceLiquid:
 *                       type: string
 *                       example: "Test"
 *                 hazardousAreaDetails:
 *                   type: object
 *                   properties:
 *                     zoneClassification:
 *                       type: string
 *                       example: "ZON"
 *                     gasGroup:
 *                       type: string
 *                       example: "G2"
 *                     temperatureClassification:
 *                       type: string
 *                       example: "T1"
 *                 warrantyDetails:
 *                   type: object
 *                   properties:
 *                     isWarrantyIncluded:
 *                       type: boolean
 *                       example: false
 *                     supplierName:
 *                       type: string
 *                       example: "admin"
 *                     supplierEmail:
 *                       type: string
 *                       format: email
 *                       example: "admin@criontech.com"
 *                     warrantyPeriod:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                           example: "88"
 *                         type:
 *                           type: string
 *                           example: "months"
 *                     warrantyEndDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01T00:00.000+00:00"
 *                     termsAndConditions:
 *                       type: string
 *                       example: "66ba01440d19d3e138726adp"
 *                 calibrationDetails:
 *                   type: object
 *                   properties:
 *                     lastCalibrationDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01T00:00.000+00:00"
 *                     calibrationCycle:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                           example: "1"
 *                         type:
 *                           type: string
 *                           example: "months"
 *                     corrosionCheckDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01T00:00.000+00:00"
 *                     corrosionCycle:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                           example: "2"
 *                         type:
 *                           type: string
 *                           example: "months"
 *                     designThickness:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                           example: "3"
 *                         type:
 *                           type: string
 *                           example: "mm"
 *                     allowableThickness:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: "44"
 *                         type:
 *                           type: string
 *                           example: "mm"
 *                     meanTimeToRepair:
 *                       type: number
 *                       example: 2
 *                     meanTimeBetweenFailures:
 *                       type: number
 *                       example: 5
 *                     lastAuditDate:
 *                       type: string
 *                       format: date-time
 *             locationAndHierarchyDetails:
 *               type: object
 *               properties:
 *                 geographicalCoordinates:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       example: 3456
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       example: 8765
 *                     elevation:
 *                       type: number
 *                       format: float
 *                       example: 34
 *                 hierarchy:
 *                   type: object
 *                   properties:
 *                     parent:
 *                       type: string
 *                       example: "66ba01440d19d3e138726adk"
 *             generalDetails:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Asset 123"
 *                 number:
 *                   type: string
 *                   example: "123"
 *                 department:
 *                   type: string
 *                   example: "66ba01440d19d3e138726adb"
 *                 criticalityLevel:
 *                   type: string
 *                   example: "Emergency"
 *                 functionalArea:
 *                   type: string
 *                   example: "Production - refinery"
 *                 owner:
 *                   type: string
 *                   example: "66ba01440d19d3e138726ad0"
 *                 businessUnit:
 *                   type: string
 *                   example: "66ba01440d19d3e138726adg"
 *                 description:
 *                   type: string
 *                   example: "Asset 1"
 *                 runningMode:
 *                   type: string
 *                   example: "Rotating"
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset updated successfully
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *               GeneralDetailsNameRequired:
 *                 summary: Name is required
 *                 value:
 *                   message: "Failed! name is required"
 *                   data: null
 *               GeneralDetailsNameType:
 *                 summary: Name must be a string
 *                 value:
 *                   message: "Failed! Name must be a string"
 *                   data: null
 *               GeneralDetailsNameMaxLength:
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! Name should not exceed 50 characters"
 *                   data: null
 *               GeneralDetailsNameUnique:
 *                 summary: Name already exists
 *                 value:
 *                   message: "Failed! Name already exists in the server"
 *                   data: null
 *               GeneralDetailsNumberRequired:
 *                 summary: Number is required
 *                 value:
 *                   message: "Failed! number is required"
 *                   data: null
 *               GeneralDetailsNumberType:
 *                 summary: Number must be a string
 *                 value:
 *                   message: "Failed! Number must be a string"
 *                   data: null
 *               GeneralDetailsNumberMaxLength:
 *                 summary: Number exceeds max length
 *                 value:
 *                   message: "Failed! Number should not exceed 15 characters"
 *                   data: null
 *               GeneralDetailsNumberUnique:
 *                 summary: Number already exists
 *                 value:
 *                   message: "Failed! Number already exists in the server"
 *                   data: null
 *               GeneralDetailsDescriptionType:
 *                 summary: Description must be a string
 *                 value:
 *                   message: "Failed! Description must be a string"
 *                   data: null
 *               GeneralDetailsDescriptionMaxLength:
 *                 summary: Description exceeds max length
 *                 value:
 *                   message: "Failed! Description should not exceed 1000 characters"
 *                   data: null
 *               GeneralDetailsDepartmentRequired:
 *                 summary: Department is required
 *                 value:
 *                   message: "Failed! Department is required"
 *                   data: null
 *               GeneralDetailsDepartmentInvalid:
 *                 summary: Invalid department
 *                 value:
 *                   message: "Failed! Invalid Department"
 *                   data: null
 *               GeneralDetailsCategoryInvalid:
 *                 summary: Invalid category
 *                 value:
 *                   message: "Failed! Invalid Category"
 *                   data: null
 *               GeneralDetailsBusinessUnitInvalid:
 *                 summary: Invalid business unit
 *                 value:
 *                   message: "Failed! Invalid BusinessUnit"
 *                   data: null
 *               GeneralDetailsCriticalityLevelInvalid:
 *                 summary: Invalid criticality level
 *                 value:
 *                   message: "Failed! Invalid criticalityLevel"
 *                   data: null
 *               GeneralDetailsRunningModeInvalid:
 *                 summary: Invalid running mode
 *                 value:
 *                   message: "Failed! Invalid runningMode"
 *                   data: null
 *               GeneralDetailsFunctionalAreaInvalid:
 *                 summary: Invalid functional area
 *                 value:
 *                   message: "Failed! Invalid functionalArea"
 *                   data: null
 *               GeneralDetailsOwnerRequired:
 *                 summary: Owner is required
 *                 value:
 *                   message: "Failed! owner is required"
 *                   data: null
 *               GeneralDetailsOwnerInvalid:
 *                 summary: Invalid owner
 *                 value:
 *                   message: "Failed! Invalid owner"
 *                   data: null
 *               SpecificationsManufacturingTypeInvalid:
 *                 summary: Invalid manufacturing type
 *                 value:
 *                   message: "Failed! Invalid manufacturingDetails.type"
 *                   data: null
 *               SpecificationsManufacturingMakeType:
 *                 summary: Make must be a string
 *                 value:
 *                   message: "Failed! manufacturingDetails.make must be a string"
 *                   data: null
 *               SpecificationsManufacturingMakeMaxLength:
 *                 summary: Make exceeds max length
 *                 value:
 *                   message: "Failed! manufacturingDetails.make should not exceed 50 characters"
 *                   data: null
 *               SpecificationsManufacturingModelType:
 *                 summary: Model must be a string
 *                 value:
 *                   message: "Failed! manufacturingDetails.model must be a string"
 *                   data: null
 *               SpecificationsManufacturingModelMaxLength:
 *                 summary: Model exceeds max length
 *                 value:
 *                   message: "Failed! manufacturingDetails.model should not exceed 50 characters"
 *                   data: null
 *               SpecificationsManufacturingSerialNumberType:
 *                 summary: Serial number must be a string
 *                 value:
 *                   message: "Failed! manufacturingDetails.serialNumber must be a string"
 *                   data: null
 *               SpecificationsManufacturingSerialNumberMaxLength:
 *                 summary: Serial number exceeds max length
 *                 value:
 *                   message: "Failed! manufacturingDetails.serialNumber should not exceed 15 characters"
 *                   data: null
 *               SpecificationsManufacturingInstallationDateInvalid:
 *                 summary: Invalid installation date
 *                 value:
 *                   message: "Failed! Invalid manufacturingDetails.installationDate"
 *                   data: null
 *               SpecificationsManufacturingServiceLiquidType:
 *                 summary: Service liquid must be a string
 *                 value:
 *                   message: "Failed! manufacturingDetails.serviceLiquid must be a string"
 *                   data: null
 *               SpecificationsManufacturingServiceLiquidMaxLength:
 *                 summary: Service liquid exceeds max length
 *                 value:
 *                   message: "Failed! manufacturingDetails.serviceLiquid should not exceed 50 characters"
 *                   data: null
 *               SpecificationsManufacturingManufacturerType:
 *                 summary: Manufacturer must be a string
 *                 value:
 *                   message: "Failed! manufacturingDetails.manufacturer must be a string"
 *                   data: null
 *               SpecificationsManufacturingManufacturerMaxLength:
 *                 summary: Manufacturer exceeds max length
 *                 value:
 *                   message: "Failed! manufacturingDetails.manufacturer should not exceed 50 characters"
 *                   data: null
 *               SpecificationsHazardousZoneClassificationType:
 *                 summary: Zone classification must be a string
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.zoneClassification must be a string"
 *                   data: null
 *               SpecificationsHazardousZoneClassificationMaxLength:
 *                 summary: Zone classification exceeds max length
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.zoneClassification should not exceed 3 characters"
 *                   data: null
 *               SpecificationsHazardousGasGroupType:
 *                 summary: Gas group must be a string
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.gasGroup must be a string"
 *                   data: null
 *               SpecificationsHazardousGasGroupMaxLength:
 *                 summary: Gas group exceeds max length
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.gasGroup should not exceed 3 characters"
 *                   data: null
 *               SpecificationsHazardousTemperatureClassificationType:
 *                 summary: Temperature classification must be a string
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.temperatureClassification must be a string"
 *                   data: null
 *               SpecificationsHazardousTemperatureClassificationMaxLength:
 *                 summary: Temperature classification exceeds max length
 *                 value:
 *                   message: "Failed! hazardousAreaDetails.temperatureClassification should not exceed 3 characters"
 *                   data: null
 *               SpecificationsWarrantyIsWarrantyIncludedType:
 *                 summary: Is warranty included must be a boolean
 *                 value:
 *                   message: "Failed! warrantyDetails.isWarrantyIncluded must be a boolean"
 *                   data: null
 *               SpecificationsWarrantySupplierNameType:
 *                 summary: Supplier name must be a string
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierName must be a string"
 *                   data: null
 *               SpecificationsWarrantySupplierNameMaxLength:
 *                 summary: Supplier name exceeds max length
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierName should not exceed 50 characters"
 *                   data: null
 *               SpecificationsWarrantySupplierEmailRequired:
 *                 summary: Supplier email is required
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierEmail is required"
 *                   data: null
 *               SpecificationsWarrantySupplierEmailType:
 *                 summary: Supplier email must be a string
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierEmail must be a string"
 *                   data: null
 *               SpecificationsWarrantySupplierEmailMaxLength:
 *                 summary: Supplier email exceeds max length
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierEmail should not exceed 320 characters"
 *                   data: null
 *               SpecificationsWarrantySupplierEmailInvalid:
 *                 summary: Invalid supplier email
 *                 value:
 *                   message: "Failed! warrantyDetails.supplierEmail should be a valid email"
 *                   data: null
 *               SpecificationsWarrantyPeriodValueType:
 *                 summary: Warranty period value must be a number
 *                 value:
 *                   message: "Failed! warrantyDetails.warrantyPeriod.value must be a number"
 *                   data: null
 *               SpecificationsWarrantyPeriodValueMaxValue:
 *                 summary: Warranty period value exceeds max
 *                 value:
 *                   message: "Failed! warrantyDetails.warrantyPeriod.value should not exceed 999"
 *                   data: null
 *               SpecificationsWarrantyPeriodValueMaxLength:
 *                 summary: Warranty period value exceeds max length
 *                 value:
 *                   message: "Failed! warrantyDetails.warrantyPeriod.value should not exceed 3 characters"
 *                   data: null
 *               SpecificationsWarrantyPeriodValueMinValue:
 *                 summary: Warranty period value below min
 *                 value:
 *                   message: "Failed! warrantyDetails.warrantyPeriod.value must not be less than -999"
 *                   data: null
 *               SpecificationsWarrantyPeriodTypeInvalid:
 *                 summary: Invalid warranty period type
 *                 value:
 *                   message: "Failed! Invalid warrantyDetails.warrantyPeriod.type"
 *                   data: null
 *               SpecificationsWarrantyEndDateInvalid:
 *                 summary: Invalid warranty end date
 *                 value:
 *                   message: "Failed! Invalid warrantyDetails.warrantyEndDate"
 *                   data: null
 *               SpecificationsWarrantyTermsAndConditionsRequired:
 *                 summary: Terms and conditions is required
 *                 value:
 *                   message: "Failed! warrantyDetails.termsAndConditions is required"
 *                   data: null
 *               SpecificationsWarrantyTermsAndConditionsInvalid:
 *                 summary: Invalid terms and conditions file ID
 *                 value:
 *                   message: "Failed! Invalid warrantyDetails.termsAndConditions File id"
 *                   data: null
 *               SpecificationsWarrantyTermsAndConditionsNotAsset:
 *                 summary: Terms and conditions file not for assets
 *                 value:
 *                   message: "Failed! Invalid warrantyDetails.termsAndConditions File id is not an asset file"
 *                   data: null
 *               SpecificationsCalibrationLastCalibrationDateInvalid:
 *                 summary: Invalid last calibration date
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.lastCalibrationDate"
 *                   data: null
 *               SpecificationsCalibrationCycleValueType:
 *                 summary: Calibration cycle value must be a string
 *                 value:
 *                   message: "Failed! calibrationDetails.calibrationCycle.value must be a string"
 *                   data: null
 *               SpecificationsCalibrationCycleValueMaxLength:
 *                 summary: Calibration cycle value exceeds max length
 *                 value:
 *                   message: "Failed! calibrationDetails.calibrationCycle.value should not exceed 3 characters"
 *                   data: null
 *               SpecificationsCalibrationCycleValueAlphanumeric:
 *                 summary: Calibration cycle value must be alphanumeric
 *                 value:
 *                   message: "Failed! calibrationDetails.calibrationCycle.value should contain only alphanumeric characters"
 *                   data: null
 *               SpecificationsCalibrationCycleTypeInvalid:
 *                 summary: Invalid calibration cycle type
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.calibrationCycle.type"
 *                   data: null
 *               SpecificationsCalibrationCorrosionCheckDateInvalid:
 *                 summary: Invalid corrosion check date
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.corrosionCheckDate"
 *                   data: null
 *               SpecificationsCalibrationCorrosionCycleValueType:
 *                 summary: Corrosion cycle value must be a string
 *                 value:
 *                   message: "Failed! calibrationDetails.corrosionCycle.value must be a string"
 *                   data: null
 *               SpecificationsCalibrationCorrosionCycleValueMaxLength:
 *                 summary: Corrosion cycle value exceeds max length
 *                 value:
 *                   message: "Failed! calibrationDetails.corrosionCycle.value should not exceed 3 characters"
 *                   data: null
 *               SpecificationsCalibrationCorrosionCycleValueAlphanumeric:
 *                 summary: Corrosion cycle value must be alphanumeric
 *                 value:
 *                   message: "Failed! calibrationDetails.corrosionCycle.value should contain only alphanumeric characters"
 *                   data: null
 *               SpecificationsCalibrationCorrosionCycleTypeInvalid:
 *                 summary: Invalid corrosion cycle type
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.corrosionCycle.type"
 *                   data: null
 *               SpecificationsCalibrationDesignThicknessValueType:
 *                 summary: Design thickness value must be a string
 *                 value:
 *                   message: "Failed! calibrationDetails.designThickness.value must be a string"
 *                   data: null
 *               SpecificationsCalibrationDesignThicknessValueMaxLength:
 *                 summary: Design thickness value exceeds max length
 *                 value:
 *                   message: "Failed! calibrationDetails.designThickness.value should not exceed 3 characters"
 *                   data: null
 *               SpecificationsCalibrationDesignThicknessValueAlphanumeric:
 *                 summary: Design thickness value must be alphanumeric
 *                 value:
 *                   message: "Failed! calibrationDetails.designThickness.value should contain only alphanumeric characters"
 *                   data: null
 *               SpecificationsCalibrationDesignThicknessTypeInvalid:
 *                 summary: Invalid design thickness type
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.designThickness.type"
 *                   data: null
 *               SpecificationsCalibrationAllowableThicknessValueType:
 *                 summary: Allowable thickness value must be a number
 *                 value:
 *                   message: "Failed! calibrationDetails.allowableThickness.value must be a number"
 *                   data: null
 *               SpecificationsCalibrationAllowableThicknessValueMaxValue:
 *                 summary: Allowable thickness value exceeds max
 *                 value:
 *                   message: "Failed! calibrationDetails.allowableThickness.value should not exceed 999"
 *                   data: null
 *               SpecificationsCalibrationAllowableThicknessTypeInvalid:
 *                 summary: Invalid allowable thickness type
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.allowableThickness.type"
 *                   data: null
 *               SpecificationsCalibrationLastAuditDateInvalid:
 *                 summary: Invalid last audit date
 *                 value:
 *                   message: "Failed! Invalid calibrationDetails.lastAuditDate"
 *                   data: null
 *               SpecificationsCalibrationMeanTimeToRepairType:
 *                 summary: Mean time to repair must be a number
 *                 value:
 *                   message: "Failed! calibrationDetails.meanTimeToRepair must be a number"
 *                   data: null
 *               SpecificationsCalibrationMeanTimeToRepairMaxValue:
 *                 summary: Mean time to repair exceeds max
 *                 value:
 *                   message: "Failed! calibrationDetails.meanTimeToRepair should not exceed 999"
 *                   data: null
 *               SpecificationsCalibrationMeanTimeBetweenFailuresType:
 *                 summary: Mean time between failures must be a number
 *                 value:
 *                   message: "Failed! calibrationDetails.meanTimeBetweenFailures must be a number"
 *                   data: null
 *               SpecificationsCalibrationMeanTimeBetweenFailuresMaxValue:
 *                 summary: Mean time between failures exceeds max
 *                 value:
 *                   message: "Failed! calibrationDetails.meanTimeBetweenFailures should not exceed 999"
 *                   data: null
 *               LocationAndHierarchyLatitudeRequired:
 *                 summary: Latitude is required
 *                 value:
 *                   message: "Failed! geographicalCoordinates.latitude is required"
 *                   data: null
 *               LocationAndHierarchyLatitudeType:
 *                 summary: Latitude must be a number
 *                 value:
 *                   message: "Failed! geographicalCoordinates.latitude must be a number"
 *                   data: null
 *               LocationAndHierarchyLatitudeMaxDigits:
 *                 summary: Latitude exceeds max digits
 *                 value:
 *                   message: "Failed! geographicalCoordinates.latitude should not exceed 6 digits"
 *                   data: null
 *               LocationAndHierarchyLongitudeRequired:
 *                 summary: Longitude is required
 *                 value:
 *                   message: "Failed! geographicalCoordinates.longitude is required"
 *                   data: null
 *               LocationAndHierarchyLongitudeType:
 *                 summary: Longitude must be a number
 *                 value:
 *                   message: "Failed! geographicalCoordinates.longitude must be a number"
 *                   data: null
 *               LocationAndHierarchyLongitudeMaxDigits:
 *                 summary: Longitude exceeds max digits
 *                 value:
 *                   message: "Failed! geographicalCoordinates.longitude should not exceed 6 digits"
 *                   data: null
 *               LocationAndHierarchyElevationRequired:
 *                 summary: Elevation is required
 *                 value:
 *                   message: "Failed! geographicalCoordinates.elevation is required"
 *                   data: null
 *               LocationAndHierarchyElevationType:
 *                 summary: Elevation must be a number
 *                 value:
 *                   message: "Failed! geographicalCoordinates.elevation must be a number"
 *                   data: null
 *               LocationAndHierarchyElevationMaxDigits:
 *                 summary: Elevation exceeds max digits
 *                 value:
 *                   message: "Failed! geographicalCoordinates.elevation should not exceed 6 digits"
 *                   data: null
 *               LocationAndHierarchyParentSelf:
 *                 summary: Asset cannot be its own parent
 *                 value:
 *                   message: "Failed! Asset cannot be its own parent"
 *                   data: null
 *               LocationAndHierarchyParentInvalid:
 *                 summary: Invalid parent asset
 *                 value:
 *                   message: "Failed! Invalid hierarchy.parent"
 *                   data: null
 *               ImagesNotArray:
 *                 summary: Images must be an array
 *                 value:
 *                   message: "Failed! Images should be an array of IDs"
 *                   data: null
 *               ImagesExceedMax:
 *                 summary: Images exceed max length
 *                 value:
 *                   message: "Failed! Images should not exceed 6 images"
 *                   data: null
 *               ImagesInvalidType:
 *                 summary: Image IDs must be strings
 *                 value:
 *                   message: "File ids must be a non-empty array of strings"
 *                   data: null
 *               ImagesDuplicate:
 *                 summary: Duplicate image IDs
 *                 value:
 *                   message: "Duplicate file ids are not allowed"
 *                   data: { duplicateImages: ["605c72ef1e153a2b6c8e4d50"] }
 *               ImagesInvalidIds:
 *                 summary: Invalid image file IDs
 *                 value:
 *                   message: "Failed! Invalid File ids"
 *                   data: { invalidFileIds: ["605c72ef1e153a2b6c8e4d50"] }
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
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Asset not found
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
 * /api/v1/assets/{asset}:
 *   delete:
 *     summary: Delete an asset by ID
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to delete
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset deleted successfully
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
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
 *                   example: Failed! Asset does not exist
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
 *                   example: Some internal server error
 */


/**
 * @swagger
 * /api/v1/assets:
 *   delete:
 *     summary: Delete multiple assets by IDs
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assets:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of asset IDs to delete
 *             example:
 *               assets: ["603d2f7e55f7a9e8e3eeb1f4", "603d2f7e55f7a9e8e3eeb1f5"]
 *     responses:
 *       200:
 *         description: Assets deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assets deleted successfully
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty array of strings
 *                   errorInfo: null
 *               ValidationError:    
 *                 summary: Invalid asset ids
 *                 value:
 *                   message: Failed! Invalid asset ids
 *                   inValidAssetArray: {"603d2f7e55f7a9e8e3eeb1f4"}
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
 *         description: Asset not found (Some of the provided asset IDs do not exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Invalid Asset ids
 *                 errorInfo:
 *                   type: object
 *                   properties:
 *                     invalidAssetIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["603d2f7e55f7a9e8e3eeb1f4"]
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
 * /api/v1/assets/{asset}/updateStatus:
 *   patch:
 *     summary: Update the status of an asset
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the asset
 *                 example: "Active"
 *                 required:
 *                   - status
 *     responses:
 *       200:
 *         description: Successfully updated asset status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset status updated successfully
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
 *               MissingStatus:
 *                 summary: Missing Status
 *                 value:
 *                   message: Status must be a non-empty string
 *                   errorInfo: null
 *               StatusType Error:  
 *                 summary: Status should be string
 *                 value:
 *                   message: Failed! Status must be a string
 *                   errorInfo: null
 *               StatusRequired:  
 *                 summary: Status is required
 *                 value:
 *                   message: Failed! Status is required
 *                   errorInfo: null
 *               InvalidStatus:  
 *                 summary: Invalid status
 *                 value:
 *                   message: Failed! Invalid status
 *                   errorInfo: null
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
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset not found
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
 * /api/v1/assets/{asset}/qrCode:
 *   get:
 *     summary: Fetch the QR code of an asset
 *     tags: [Asset Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset whose QR code is to be fetched
 *     responses:
 *       200:
 *         description: QR code for the asset fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code for asset AssetName fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 603d2f7e55f7a9e8e3eeb1f4
 *                     name:
 *                       type: string
 *                       example: qrCode.png
 *                     extension:
 *                       type: string
 *                       example: png
 *                     contentType:
 *                       type: string
 *                       example: image/png
 *                     url:
 *                       type: string
 *                       example: https://example.com/path/to/image.png
 *                     size:
 *                       type: integer
 *                       example: 12345
 *                     moduleName:
 *                       type: string
 *                       example: assets
 *                     moduleId:
 *                       type: string
 *                       example: 603d2f7e55f7a9e8e3eeb1f4
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
 *       404:
 *         description: Asset or QR code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset not found
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
 *                   example: Some internal server error
 */


/**
 * @swagger
 * /api/v1/assets/enums/generalDetails/runningMode:
 *   get:
 *     summary: Retrieve runningMode enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched runningMode enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: runningMode fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Rotating", "Static"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/generalDetails/criticalityLevel:
 *   get:
 *     summary: Retrieve criticalityLevel enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched criticalityLevel enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: criticalityLevel fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Emergency", "Critical", "Normal"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/generalDetails/functionalArea:
 *   get:
 *     summary: Retrieve functionalArea enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched functionalArea enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: functionalArea fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Water dew point depression", "Glycol regeneration", "Hydro carbon dewpoint depression", "Methanol injection for hydrate Mitigation", "Utilities"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/warrantyDetails/warrantyPeriod/type:
 *   get:
 *     summary: Retrieve warrantyPeriod type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched warrantyPeriod enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: warrantyPeriod fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Months", "Years"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/calibrationDetails/calibrationCycle/type:
 *   get:
 *     summary: Retrieve calibrationCycle type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched calibrationCycle enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: calibrationCyclePeriod fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Months", "Years"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/calibrationDetails/corrosionCycle/type:
 *   get:
 *     summary: Retrieve corrosionCycle type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched corrosionCyclePeriod enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: corrosionCyclePeriod fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Months", "Years"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/calibrationDetails/designThickness/type:
 *   get:
 *     summary: Retrieve designThickness type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched designThickness enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Design thickness fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["mm"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/calibrationDetails/allowableThickness/type:
 *   get:
 *     summary: Retrieve allowableThickness type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched allowableThickness enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Allowable thickness fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["mm"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/specifications/manufacturingDetails/type:
 *   get:
 *     summary: Retrieve manufacturingDetails type enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched manufacturingDetails enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: assetTypes fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Standard Asset", "Fabricated Asset"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */
/**
 * @swagger
 * /api/v1/assets/enums/status:
 *   get:
 *     summary: Retrieve assetStatus enumeration values
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched assetStatus enums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: assetStatus fetched successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["Active", "Standby", "Under Maintenance", "Breakdown", "Decommissioned"]
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request parameters
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
 *                   example: Some internal server error
 */


/**
 * @swagger
 * /api/v1/assets/{asset}/hierarchy:
 *   get:
 *     summary: Fetch the full hierarchy of an asset
 *     description: Retrieves the hierarchical structure of an asset
 *     tags:
 *       - Asset Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset (MongoDB ObjectId)
 *       - in: query
 *         name: businessUnit
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the business unit
 *       - in: query
 *         name: department
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the department 
 *       - in: query
 *         name: fetchByField
 *         required: false
 *         schema:
 *           type: string
 *           enum: [name, number, serialNumber]
 *         description: Specifies the field to fetch the asset by 
 *     responses:
 *       '200':
 *         description: Asset hierarchy fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asset Hierarchy Fetched Successfully"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64a62cdbe341fa456e123def"
 *                       generalDetails:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Asset Name"
 *                           number:
 *                             type: string
 *                             example: "ASSET123"
 *                       parentAsset:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64a62cdbe341fa456e123abc"
 *                           generalDetails:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Parent Asset Name"
 *                               number:
 *                                 type: string
 *                                 example: "PARENT456"
 *             example:
 *               message: "Asset Hierarchy Fetched Successfully"
 *               result:
 *                 - id: "64a62cdbe341fa456e123def"
 *                   generalDetails: { name: "Asset Name", number: "ASSET123" }
 *                   parentAsset: null
 *                 - id: "64a62cdbe341fa456e123ghi"
 *                   generalDetails: { name: "Child Asset", number: "CHILD789" }
 *                   parentAsset: { id: "64a62cdbe341fa456e123def", generalDetails: { name: "Asset Name", number: "ASSET123" } }
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
 *               MissingAssetID:
 *                 summary: Missing Asset ID
 *                 value:
 *                   message: Asset Id must be a non-empty string in req.params or req.body
 *                   errorInfo: null
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
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! Asset does not exist
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Some internal server error"
 *               errorInfo: null
 */

