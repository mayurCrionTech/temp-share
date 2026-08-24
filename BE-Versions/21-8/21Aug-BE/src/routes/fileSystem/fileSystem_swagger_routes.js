/**
 * @swagger
 * tags:
 *   name: File System
 *   description: API for managing files
 */



/**
 * @swagger
 * /api/v1/files:
 *   post:
 *     summary: Upload a file
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: returnMetaData
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Whether to return metadata for the uploaded file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: file
 *                 format: binary
 *                 description: The file to upload
 *               name:
 *                 type: string
 *                 description: Optional name of the file
 *               moduleName:
 *                 type: string
 *                 description: Optional name of the module to associate with the file
 *               moduleId:
 *                 type: string
 *                 description: Optional ID of the module to associate with the file
 *             required:
 *               - file
 *     responses:
 *       '201':
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 name:
 *                   type: string
 *                   example: "fileName"
 *                 extension:
 *                   type: string
 *                   example: "png"
 *                 contentType:
 *                   type: string
 *                   example: "image/png"
 *                 size:
 *                   type: integer
 *                   example: 8640
 *                 moduleName:
 *                   type: string
 *                   example: null
 *                 moduleId:
 *                   type: string
 *                   example: null
 *                 url:
 *                   type: string
 *                   example: "https://example.com/file.png"
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
 *               MissingFile:
 *                 summary: File not provided
 *                 value:
 *                   message: File not provided
 *                   errorInfo: null
 *               MissingModuleName:
 *                 summary: ModuleName and ModuleId needed
 *                 value:
 *                   message: Both moduleName and moduleId must be provided together
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/bulkUpload:
 *   post:
 *     summary: Bulk upload multiple files
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: returnMetaData
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Whether to return metadata for each file
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
 *                   type: file
 *                   format: binary
 *                 description: The files to upload
 *               moduleName:
 *                 type: string
 *                 description: Optional name of the module to associate with the files
 *               moduleId:
 *                 type: string
 *                 description: Optional ID of the module to associate with the files
 *             required:
 *               - files
 *     responses:
 *       '201':
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files uploaded successfully
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
 *                             example: "66ad4b06df11d606a9134c43"
 *                           name:
 *                             type: string
 *                             example: "fileName"
 *                           extension:
 *                             type: string
 *                             example: "png"
 *                           contentType:
 *                             type: string
 *                             example: "image/png"
 *                           size:
 *                             type: integer
 *                             example: 8640
 *                           moduleName:
 *                             type: string
 *                             example: null
 *                           moduleId:
 *                             type: string
 *                             example: null
 *                           url:
 *                             type: string
 *                             example: "https://example.com/file.png"
 *       '207':
 *         description: Partially successful with failures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files uploaded partially
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
 *                             example: "66ad4b06df11d606a9134c43"
 *                           name:
 *                             type: string
 *                             example: "fileName"
 *                           extension:
 *                             type: string
 *                             example: "png"
 *                           contentType:
 *                             type: string
 *                             example: "image/png"
 *                           size:
 *                             type: integer
 *                             example: 8640
 *                           moduleName:
 *                             type: string
 *                             example: null
 *                           moduleId:
 *                             type: string
 *                             example: null
 *                           url:
 *                             type: string
 *                             example: "https://example.com/file.png"
 *                     failures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "fileName"
 *                           extension:
 *                             type: string
 *                             example: "png"
 *                           arrayPosition:
 *                             type: integer
 *                             example: 1
 *                           error:
 *                             type: string
 *                             example: "Detailed error message here"
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
 *               MissingFiles:
 *                 summary: Files not provided
 *                 value:
 *                   message: Files not provided
 *                   errorInfo: null
 *               ReachedMax:
 *                 summary: Maximum limit
 *                 value:
 *                   message: You can only upload a maximum of 20 files at a time
 *                   errorInfo: null
 *               InvalidFile:
 *                 summary: Invalid files provided
 *                 value:
 *                   message: Invalid files provided
 *                   errorInfo: null
 *               MissingFile:
 *                 summary: File not provided
 *                 value:
 *                   message: File not provided
 *                   errorInfo: null
 *               MissingModuleName:
 *                 summary: ModuleName and ModuleId needed
 *                 value:
 *                   message: Both moduleName and moduleId must be provided together
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files:
 *   get:
 *     summary: Retrieve files
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *         description: List of file IDs to retrieve
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [stream, download, view]
 *         description: Action to perform on the file
 *     responses:
 *       '200':
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "60d21b4667d0d8992e610c85"
 *                   name:
 *                     type: string
 *                     example: "example.pdf"
 *                   extension:
 *                     type: string
 *                     example: "pdf"
 *                   contentType:
 *                     type: string
 *                     example: "application/pdf"
 *                   url:
 *                     type: string
 *                     example: "http://localhost/api/v1/files/60d21b4667d0d8992e610c85/actions/view?token=abc123"
 *                   moduleName:
 *                     type: string
 *                     example: "moduleName"
 *                   moduleId:
 *                     type: string
 *                     example: "moduleId"
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
 *               MissingFileID:
 *                 summary: Missing File IDs
 *                 value:
 *                   message: File Ids must be a non-empty string or array
 *                   errorInfo: null
 *               MissingFileIDs:
 *                 summary: File IDs must be provided
 *                 value:
 *                   message: File Ids must be provided in the request body or query
 *                   errorInfo: null
 *               MissingFileIDArray:
 *                 summary: Missing File IDs array
 *                 value:
 *                   message: File Ids must be a non-empty array
 *               InvalidFileId:
 *                 summary: Invalid file IDs
 *                 value:
 *                   message: Invalid file IDs detected
 *                   invalidIds: ["66c029c5465992da5a2037ef"]
 *               InvalidAction:
 *                 summary: Invalid Action
 *                 value:
 *                   message: Invalid action specified
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 */


/**
 * @swagger
 * /api/v1/files/{id}:
 *   get:
 *     summary: Retrieve a file
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to retrieve
 *       - in: query
 *         name: action
 *         required: false
 *         schema:
 *           type: string
 *           enum: [stream, download, view]
 *         description: Action to perform on the file
 *     responses:
 *       '200':
 *         description: File retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60d21b4667d0d8992e610c85"
 *                 name:
 *                   type: string
 *                   example: "example.pdf"
 *                 extension:
 *                   type: string
 *                   example: "pdf"
 *                 contentType:
 *                   type: string
 *                   example: "application/pdf"
 *                 url:
 *                   type: string
 *                   example: "http://localhost/api/v1/files/60d21b4667d0d8992e610c85/actions/view?token=abc123"
 *                 moduleName:
 *                   type: string
 *                   example: "moduleName"
 *                 moduleId:
 *                   type: string
 *                   example: "moduleId"
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
 *               MissingFileID:
 *                 summary: Missing File ID
 *                 value:
 *                   message: File Id must be a non-empty string
 *                   errorInfo: null
 *               InvalidFileId:
 *                 summary: Invalid File id
 *                 value:
 *                   message: Please enter a valid File Id
 *                   errorInfo: null
 *               Invalidaction:
 *                 summary: Invalid action
 *                 value:
 *                   message: Please enter a valid action
 *                   errorInfo: null
 *               FileNotExist:
 *                 summary: File does not exist
 *                 value:
 *                   message: Failed! File does not exist
 *                   errorInfo: null
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
 *       '404':
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File not found
 *                 errorInfo:
 *                   type: object
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/{id}/updatePath:
 *   put:
 *     summary: Update the path of a file
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleName:
 *                 type: string
 *               moduleId:
 *                 type: string
 *             required:
 *               - moduleName
 *               - moduleId
 *     responses:
 *       '200':
 *         description: File path updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File path updated successfully
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
 *               MissingFileID:
 *                 summary: Missing File ID
 *                 value:
 *                   message: File Id must be a non-empty string
 *                   errorInfo: null
 *               InvalidFileId:
 *                 summary: Invalid File id
 *                 value:
 *                   message: Please enter a valid File Id
 *                   errorInfo: null
 *               Invalidaction:
 *                 summary: Invalid action
 *                 value:
 *                   message: Please enter a valid action
 *                   errorInfo: null
 *               FileNotExist:
 *                 summary: File does not exist
 *                 value:
 *                   message: Failed! File does not exist
 *                   errorInfo: null
 *               MissingFileId:
 *                 summary: File Id not provided
 *                 value:
 *                   message: File Id not provided
 *                   errorInfo: null
 *               MissingModuleName:
 *                 summary: ModuleName and ModuleId needed
 *                 value:
 *                   message: Both moduleName and moduleId must be provided together
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/{id}/actions/{action}:
 *   get:
 *     summary: Perform an action on a file
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to perform the action on
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [download, view, stream]
 *         description: The action to perform on the file
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The token to validate the request
 *     responses:
 *       '200':
 *         description: Action performed successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
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
 *               NoToken:
 *                 summary: No token provided
 *                 value:
 *                   message: Failed! No token provided
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid Token
 *                 value:
 *                   message: Failed! Invalid Token
 *                   errorInfo: null
 *               InvalidAction:
 *                 summary: Invalid action
 *                 value:
 *                   message: Invalid action
 *                   errorInfo: null
 *       '404':
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File not found
 *                 errorInfo:
 *                   type: object
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/{id}/moveToRecycleBin:
 *   put:
 *     summary: Move a file to the recycle bin
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to move to the recycle bin
 *     responses:
 *       '200':
 *         description: File moved to recycle bin successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File moved to recycle bin successfully
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
 *               MissingFileID:
 *                 summary: Missing File ID
 *                 value:
 *                   message: File Id must be a non-empty string
 *                   errorInfo: null
 *               InvalidFileId:
 *                 summary: Invalid File id
 *                 value:
 *                   message: Please enter a valid File Id
 *                   errorInfo: null
 *               Invalidaction:
 *                 summary: Invalid action
 *                 value:
 *                   message: Please enter a valid action
 *                   errorInfo: null
 *               FileNotExist:
 *                 summary: File does not exist
 *                 value:
 *                   message: Failed! File does not exist
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/temporary:
 *   delete:
 *     summary: Delete temporary files
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The date to delete files before
 *     responses:
 *       '200':
 *         description: Temporary files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Temporary files deleted successfully
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
 *               InvalidDate:
 *                 summary: Invalid date format
 *                 value:
 *                   message: Invalid date format provided
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */


/**
 * @swagger
 * /api/v1/files/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags:
 *       - File System
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to delete
 *     responses:
 *       '200':
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
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
 *               MissingFileID:
 *                 summary: Missing File ID
 *                 value:
 *                   message: File Id must be a non-empty string
 *                   errorInfo: null
 *               InvalidFileId:
 *                 summary: Invalid File id
 *                 value:
 *                   message: Please enter a valid File Id
 *                   errorInfo: null
 *               Invalidaction:
 *                 summary: Invalid action
 *                 value:
 *                   message: Please enter a valid action
 *                   errorInfo: null
 *               FileNotExist:
 *                 summary: File does not exist
 *                 value:
 *                   message: Failed! File does not exist
 *                   errorInfo: null
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
 *                   example: Some internal server error occurred
 *                 errorInfo:
 *                   type: object
 *                   example: null
 */
