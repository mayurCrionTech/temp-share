/**
 * @swagger
 * /api/v1/assetDocuments:
 *   post:
 *     summary: Create a new asset document
 *     description: |
 *       This endpoint is used to create a new asset document.
 *     tags:
 *       - Asset Documents
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
 *               - number
 *               - type
 *               - status
 *               - asset
 *               - file
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "Asset Document 1"
 *               number:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 15
 *                 example: "AD-2024-001"
 *               type:
 *                 type: string
 *                 enum: ["Engineering", "Operations", "Maintenance", "Safety", "Automation", "Administration", "Audit", "Communication"]
 *                 example: "Engineering"
 *               revisionNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 15
 *                 example: "Rev-001"
 *               status:
 *                 type: string
 *                 enum: ["Approved With Comments", "Approved", "Rejected", "As Built", "Revise & Resubmit"]
 *                 example: "Approved"
 *               asset:
 *                 type: string
 *                 format: uuid
 *                 example: "60f7c9a3b6e43d3f8c4e12a4"
 *               file:
 *                 type: string
 *                 format: uuid
 *                 example: "60f7c9a3b6e43d3f8c4e12b7"
 *     responses:
 *       '201':
 *         description: Asset document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocument created successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7c9a3b6e43d3f8c4e12a5"
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
 *                   message: "Failed! name is required"
 *                   errorinfo: null
 *               MissingNumber:
 *                 summary: Missing Number
 *                 value:
 *                   message: "Failed! number is required"
 *                   errorinfo: null
 *               MissingType:
 *                 summary: Missing Type
 *                 value:
 *                   message: "Failed! type is required"
 *                   errorinfo: null
 *               MissingStatus:
 *                 summary: Missing Status
 *                 value:
 *                   message: "Failed! status is required"
 *                   errorinfo: null
 *               MissingAsset:
 *                 summary: Missing Asset
 *                 value:
 *                   message: "Failed! asset is required"
 *                   errorinfo: null
 *               MissingFile:
 *                 summary: Missing File
 *                 value:
 *                   message: "Failed! file is required"
 *                   errorinfo: null
 *               InvalidNameType:
 *                 summary: Invalid Name Type
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorinfo: null
 *               InvalidNumberType:
 *                 summary: Invalid Number Type
 *                 value:
 *                   message: "Failed! number must be a string"
 *                   errorinfo: null
 *               InvalidRevisionNumberType:
 *                 summary: Invalid Revision Number Type
 *                 value:
 *                   message: "Failed! revisionNumber must be a string"
 *                   errorinfo: null
 *               InvalidAssetType:
 *                 summary: Invalid Asset Type
 *                 value:
 *                   message: "Failed! asset must be a string"
 *                   errorinfo: null
 *               NameTooLong:
 *                 summary: Name Exceeds Maximum Length
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorinfo: null
 *               NumberTooLong:
 *                 summary: Number Exceeds Maximum Length
 *                 value:
 *                   message: "Failed! number should not exceed 15 characters"
 *                   errorinfo: null
 *               RevisionNumberTooLong:
 *                 summary: Revision Number Exceeds Maximum Length
 *                 value:
 *                   message: "Failed! revisionNumber should not exceed 15 characters"
 *                   errorinfo: null
 *               NameAlreadyExists:
 *                 summary: Duplicate Name
 *                 value:
 *                   message: "Failed! name already exists in the server"
 *                   errorinfo: null
 *               NumberAlreadyExists:         
 *                 summary: Duplicate Number
 *                 value:
 *                   message: "Failed! number already exists in the server"
 *                   errorinfo: null
 *               InvalidFileId:    
 *                 summary: Invalid File ID
 *                 value:
 *                   message: "Failed! file is not a valid file id"
 *                   errorinfo: null
 *               InvalidFile:    
 *                 summary: Invalid File 
 *                 value:
 *                   message: "Failed! Invalid File id"
 *                   errorinfo: null
 *               InvalidFileUsage:
 *                 summary: File Not Allowed for This Module
 *                 value:
 *                   message: "Failed! Invalid file. File id can't be used for this module"
 *                   errorinfo: null
 *               InvalidAsset:    
 *                 summary: Invalid Asset
 *                 value:
 *                   message: "Failed! Invalid asset"
 *                   errorinfo: null
 *               InvalidType:     
 *                 summary: Invalid Type
 *                 value:
 *                   message: "Failed! Invalid type"
 *                   errorinfo: null
 *               InvalidStatus:     
 *                 summary: Invalid Status
 *                 value:
 *                   message: "Failed! Invalid status"
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/assetDocuments/{assetDocument}:
 *   put:
 *     summary: Update an existing asset document
 *     description: Updates an asset document by ID with the provided details.
 *     tags:
 *       - Asset Documents
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetDocument
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the asset document to be updated.
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
 *                 example: "Updated Asset Document"
 *               number:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 15
 *                 example: "DOC-002"
 *               type:
 *                 type: string
 *                 enum: ["Engineering", "Operations", "Maintenance", "Safety", "Automation", "Administration", "Audit", "Communication"]
 *                 example: "Engineering"
 *               revisionNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 15
 *                 example: "Rev-2"
 *               status:
 *                 type: string
 *                 enum: ["Approved With Comments", "Approved", "Rejected", "As Built", "Revise & Resubmit"]
 *                 example: "Approved"
 *               asset:
 *                 type: string
 *                 example: "60d21b9667d0d8992e610c85"
 *               file:
 *                 type: string
 *                 example: "60d21b9667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Asset document updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocument updated successfully"
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
 *               MissingAssetDocumentId:     
 *                 summary: Missing Asset Document ID
 *                 value:
 *                   message: "Failed! AssetDocument id must be a non-empty string in req.params or req.body"
 *                   errorinfo: null
 *               InvalidName:
 *                 summary: Invalid Name type
 *                 value:
 *                   message: "Failed! name must be a string"
 *                   errorinfo: null
 *               NameExceedsMaxLength:
 *                 summary: Name exceeds max length
 *                 value:
 *                   message: "Failed! name should not exceed 50 characters"
 *                   errorinfo: null
 *               NameAlreadyExists:
 *                 summary: Name already exists
 *                 value:
 *                   message: "Failed! name already exists in the server"
 *                   errorinfo: null
 *               InvalidNumber:
 *                 summary: Invalid Number type
 *                 value:
 *                   message: "Failed! number must be a string"
 *                   errorinfo: null
 *               NumberExceedsMaxLength:
 *                 summary: Number exceeds max length
 *                 value:
 *                   message: "Failed! number should not exceed 15 characters"
 *                   errorinfo: null
 *               NumberAlreadyExists:      
 *                 summary: Number already exists
 *                 value:
 *                   message: "Failed! number already exists in the server"
 *                   errorinfo: null
 *               InvalidType:        
 *                 summary: Invalid Type
 *                 value:
 *                   message: "Failed! Invalid type"
 *                   errorinfo: null
 *               InvalidStatus:
 *                 summary: Invalid Status
 *                 value:
 *                   message: "Failed! Invalid status"
 *                   errorinfo: null
 *               InvalidRevisionNumber:
 *                 summary: Invalid Revision Number type
 *                 value:
 *                   message: "Failed! revisionNumber must be a string"
 *                   errorinfo: null
 *               RevisionNumberExceedsMaxLength:    
 *                 summary: Revision Number exceeds max length
 *                 value:
 *                   message: "Failed! revisionNumber should not exceed 15 characters"
 *                   errorinfo: null
 *               InvalidAssetType:      
 *                 summary: Invalid Asset type
 *                 value:
 *                   message: "Failed! Asset must be a string"
 *                   errorinfo: null
 *               InvalidAsset:      
 *                 summary: Invalid Asset 
 *                 value:
 *                   message: "Failed! Invalid Asset"
 *                   errorinfo: null
 *               MissingFile:
 *                 summary: Missing File 
 *                 value:
 *                   message: "Failed! File is required"
 *                   errorinfo: null
 *               InvalidFile:    
 *                 summary: Invalid File 
 *                 value:
 *                   message: "Failed! file is not a valid file id"
 *                   errorinfo: null
 *               InvalidFileID:    
 *                 summary: Invalid File ID
 *                 value:
 *                   message: "Failed! Invalid file id"
 *                   errorinfo: null
 *               FileNotBelongToModule:  
 *                 summary: File ID does not belong to assetDocuments module
 *                 value:
 *                   message: "Failed! Invalid file ID can't be used for this module"
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
 *         description: Asset document not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               AssetDocumentNotFound:
 *                 summary: Asset Document not found
 *                 value:
 *                   message: "Failed! Asset Document does not exist"
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/assetDocuments:
 *   delete:
 *     summary: Bulk delete asset documents
 *     description: Deletes multiple asset documents by their IDs.
 *     tags:
 *       - Asset Documents
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b9667d0d8992e610c85", "60d21b9667d0d8992e610c86"]
 *     responses:
 *       200:
 *         description: Asset documents deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocuments deleted successfully"
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
 *               MissingIds:
 *                 summary: Missing asset document IDs
 *                 value:
 *                   message: "AssetDocument ids are required"
 *                   errorinfo: null
 *               EmptyArray:
 *                 summary: IDs array is empty
 *                 value:
 *                   message: "AssetDocument ids must be a non-empty array of strings"
 *                   errorinfo: null
 *               DuplicateIds:
 *                 summary: Duplicate asset document IDs found
 *                 value:
 *                   message: "Failed! Duplicate id found"
 *                   duplicateIds: ["60d21b9667d0d8992e610c85"]
 *               InvalidIds:
 *                 summary: Some asset document IDs are invalid
 *                 value:
 *                   message: "Failed! Invalid AssetDocument ids"
 *                   invalidAssetDocumentIds: ["60d21b9667d0d8992e610c99"]
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
 *         description: Internal server error.
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/assetDocuments:
 *   get:
 *     summary: Fetch asset documents
 *     description: Retrieves asset documents based on provided filters.
 *     tags:
 *       - Asset Documents
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by asset document name.
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Filter by asset document number.
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *         description: Filter by asset document types (comma-separated values).
 *         example: "Engineering, Operations"
 *       - in: query
 *         name: revisionNumber
 *         schema:   
 *           type: string
 *         description: Filter by revision number.
 *       - in: query
 *         name: statuses
 *         schema:
 *           type: string
 *         description: Filter by asset document statuses (comma-separated values).
 *         example: "Approved With Comments, Approved"
 *       - in: query
 *         name: assets
 *         schema:
 *           type: string
 *         description: Filter by asset IDs (comma-separated values).
 *         example: "60d21b9667d0d8992e610c85,60d21b9667d0d8992e610c86"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *         default: 1
 *         minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page.
 *         default: 200
 *         minimum: 0
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by
 *         example: "name"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *         example: "asc"
 *       - in: query
 *         name: listAll
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, fetches all documents (overrides limit to total count)
 *         example: true
 *     responses:
 *       200:
 *         description: Asset documents fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocuments fetched successfully"
 *                 result:
 *                   type: object
 *                   description: Paginated asset documents result
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 5
 *                     totalDataCount:
 *                       type: integer
 *                       description: Total number of documents
 *                       example: 50
 *                     data:
 *                       type: array
 *                       description: List of asset documents
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Document ID (MongoDB ObjectId)
 *                             example: "605c72ef1e153a2b6c8e4d2f"
 *                           name:
 *                             type: string
 *                             description: Name of the document
 *                             example: "Maintenance Manual"
 *                           number:
 *                             type: string
 *                             description: Document number
 *                             example: "DOC-001"
 *                           type:
 *                             type: string
 *                             description: Type of the document
 *                             example: "Engineering"
 *                           revisionNumber:
 *                             type: string
 *                             description: Revision number of the document
 *                             example: "1.0"
 *                           status:
 *                             type: string
 *                             description: Status of the document
 *                             example: "active"
 *                           asset:
 *                             type: object
 *                             description: Associated asset (populated)
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "605c72ef1e153a2b6c8e4d2e"
 *                               generalDetails:
 *                                 type: object
 *                                 description: General details of the asset
 *                                 example: { "name": "Pump", "number": "P-001" }
 *                           file:
 *                             type: object
 *                             description: File details (populated and transformed)
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "605c72ef1e153a2b6c8e4d30"
 *                               name:
 *                                 type: string
 *                                 example: "manual.pdf"
 *                               downloadUrl:
 *                                 type: string
 *                                 description: URL for downloading the file
 *                                 example: "http://localhost:3000/files/download/605c72ef1e153a2b6c8e4d30"
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
 *               InvalidNameType:
 *                 summary: Invalid name type
 *                 value:
 *                   message: "Name must be a string"
 *                   errorinfo: null
 *               InvalidNumberType:
 *                 summary: Invalid number type
 *                 value:
 *                   message: "Number must be a string"
 *                   errorinfo: null
 *               MissingTypes:
 *                 summary: Missing types 
 *                 value:
 *                   message: "Types must be a non-empty string with comma-separated values"
 *                   errorinfo: null
 *               InvalidTypes:
 *                 summary: Invalid types
 *                 value:
 *                   message: "Invalid Types"
 *                   invalidTypes: ["60d21b9667d0d8992e610c97"]
 *               InvalidRevisionNumberType:
 *                 summary: Invalid Revision number type
 *                 value:
 *                   message: "Revision Number must be a string"
 *                   errorinfo: null
 *               MissingStatuses:
 *                 summary: Missing statuses 
 *                 value:
 *                   message: "Statuses must be a non-empty string with comma-separated values"
 *                   errorinfo: null
 *               InvalidStatuses:
 *                 summary: Invalid statuses 
 *                 value:
 *                   message: "Invalid Statuses"
 *                   invalidStatuses: ["60d21b9667d0d8992e610c89"]
 *               MissingAssets:
 *                 summary: Missing assets
 *                 value:
 *                   message: "Assets must be a non-empty string with comma-separated values"
 *                   errorinfo: null
 *               InvalidAssets:
 *                 summary: Invalid asset IDs
 *                 value:
 *                   message: "Invalid asset ids"
 *                   invalidAssetIds: ["60d21b9667d0d8992e610c99"]
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
 *         description: Internal server error.
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
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/assetDocuments/{assetDocument}:
 *   get:
 *     summary: Fetch a single asset document
 *     description: Retrieves a specific asset document by its ID, name, or number.
 *     tags:
 *       - Asset Documents
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetDocument
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifier of the asset document.
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *           enum: [name, number]
 *         description: Fetch asset document by name or number instead of ID.
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit ID (if applicable).
 *     responses:
 *       200:
 *         description: Asset document fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocument Fetched Successfully"
 *                 result:
 *                   type: object
 *                   description: Asset document details
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Document ID (MongoDB ObjectId)
 *                       example: "605c72ef1e153a2b6c8e4d2f"
 *                     name:
 *                       type: string
 *                       description: Name of the document
 *                       example: "Maintenance Manual"
 *                     number:
 *                       type: string
 *                       description: Document number
 *                       example: "DOC-001"
 *                     type:
 *                       type: string
 *                       description: Type of the document
 *                       example: "Engineering"
 *                     revisionNumber:
 *                       type: string
 *                       description: Revision number of the document
 *                       example: "1.0"
 *                     status:
 *                       type: string
 *                       description: Status of the document
 *                       example: "active"
 *                     asset:
 *                       type: object
 *                       description: Associated asset (populated)
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "605c72ef1e153a2b6c8e4d2e"
 *                         generalDetails:
 *                           type: object
 *                           description: General details of the asset
 *                           example: { "name": "Pump", "number": "P-001" }
 *                     file:
 *                       type: object
 *                       description: File details (populated and transformed)
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "605c72ef1e153a2b6c8e4d30"
 *                         name:
 *                           type: string
 *                           example: "manual.pdf"
 *                         downloadUrl:
 *                           type: string
 *                           description: URL for downloading the file
 *                           example: "http://localhost:3000/files/download/605c72ef1e153a2b6c8e4d30"
 *       400:
 *         description: Bad request (Missing Asset Document ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "assetDocument id must be a non-empty string in req.params or req.body"
 *                 errorInfo:
 *                   type: null
 *                   example: null
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
 *         description: Asset document not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AssetDocument does not exist"
 *                 errorInfo:
 *                   type: null
 *                   example: null
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
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/


/**
 * @swagger
 * /api/v1/assetDocuments/enums/{category}/{subcategory}/{type}/{subType}:
 *   get:
 *     summary: Fetch enumeration values based on the given category
 *     description: Retrieves enum values for asset documents based on the category, subcategory, type, and subType.
 *     tags:
 *       - Asset Documents
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: The category of the asset document (e.g., status, types).
 *       - in: path
 *         name: subcategory
 *         required: false
 *         schema:
 *           type: string
 *         description: The subcategory under the category.
 *       - in: path
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: The type within the subcategory.
 *       - in: path
 *         name: subType
 *         required: false
 *         schema:
 *           type: string
 *         description: The subType within the type.
 *     responses:
 *       200:
 *         description: Enums fetched successfully.
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
 *                     type: string
 *             examples:
 *               EnumsStatus:
 *                 summary: Enums of status fetched successfully
 *                 value:
 *                   message: "Enums of status fetched successfully"
 *                   data: ["Approved with comments", "Approved", "Rejected", "As Built", "Revise & Resubmit"]
 *               EnumsTypes:
 *                 summary: Enums of types fetched successfully
 *                 value:
 *                   message: "Enums of types fetched successfully"
 *                   data: ["Engineering", "Operations", "Maintenance", "Safety", "Automation", "Administration", "Audit", "Communication"]
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
 *               InvalidPath:
 *                 summary: Invalid path provided
 *                 value:
 *                   message: "Invalid path"
 *                   errorinfo: null
 *               MissingCategory:
 *                 summary: Missing category parameter
 *                 value:
 *                   message: "Invalid parameters"
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
 *         description: Internal server error.
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
 *                   example: null
*/
