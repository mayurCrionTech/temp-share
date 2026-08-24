/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: User Sign-In
 *     description: Authenticates a user and returns an access token.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buUserId:
 *                 type: string
 *                 example: "123456"
 *                 description: Business User ID (Optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email (Optional)
 *               employeeId:
 *                 type: string
 *                 example: "EMP001"
 *                 description: Employee ID (Optional)
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "mypassword123"
 *                 description: User's password (Required)
 *               source:
 *                 type: string
 *                 example: "SECURITY_SRC_1"
 *                 description: Security source for password decryption.
 *     responses:
 *       '200':
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User signed in successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsIn..."
 *       '400':
 *         description: Bad request
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
 *               MissingCredentials:
 *                 summary: Missing credentials
 *                 value:
 *                   message: "Failed! email or buUserId or employeeId is required"
 *                   errorInfo: null
 *               MissingPassword:
 *                 summary: Password is required
 *                 value:
 *                   message: "Failed! Password is required"
 *                   errorInfo: null
 *               InvalidSource:
 *                 summary: Invalid security source
 *                 value:
 *                   message: "Failed! Invalid source"
 *                   errorInfo: null
 *               UserNotFound:
 *                 summary: User does not exist
 *                 value:
 *                   message: "Failed! User doesn't exist!"
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
 *                   example: "Failed! Invalid Password!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               InvalidPassword:
 *                 summary: Incorrect password
 *                 value:
 *                   message: "Failed! Invalid Password!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal Server Error
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
 * /api/v1/auth/signup:
 *   post:
 *     summary: Create a new user account
 *     description: Allows an authenticated user to create a new user account in the system.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - employeeId
 *               - contactNumber
 *               - countryCode
 *               - businessUnit
 *               - shift
 *               - department
 *               - userType
 *               - designation
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               employeeId:
 *                 type: string
 *                 example: "EMP12345"
 *               contactNumber:
 *                 type: string
 *                 example: "+11234567890"
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               businessUnit:
 *                 type: string
 *                 example: "BU12345"
 *               shift:
 *                 type: string
 *                 example: "Shift1"
 *               department:
 *                 type: string
 *                 example: "IT"
 *               userType:
 *                 type: string
 *                 example: "Admin"
 *               designation:
 *                 type: string
 *                 example: "Software Engineer"
 *               team:
 *                 type: string
 *                 example: "Development"
 *               reportsTo:
 *                 type: string
 *                 example: "EMP67890"
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 example: "60f7c4c0c8b0a456b87e2e6f"
 *               eSignature:
 *                 type: string
 *                 example: "60f7c4c0c8b0a456b87e2e6g"
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1234567890abcdef"
 *                     userPermission:
 *                       type: string
 *                       example: "perm123456"
 *                     userAuthentication:
 *                       type: object
 *                       properties:
 *                         password:
 *                           type: string
 *                           example: "encryptedPassword123"
 *                         passwordExpireAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-31T23:59:59Z"
 *             examples:
 *               UserCreated:
 *                 summary: User successfully created
 *                 value:
 *                   message: "User created successfully"
 *                   data:
 *                     id: "1234567890abcdef"
 *                     userPermission: "perm123456"
 *                     userAuthentication:
 *                       password: "encryptedPassword123"
 *                       passwordExpireAt: "2024-12-31T23:59:59Z"
 *               UserDrafted:
 *                 summary: User drafted successfully
 *                 value:
 *                   message: "User drafted successfully"
 *                   data:
 *                     id: "draftUser123"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     email: "johndoe@example.com"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Missing required fields"
 *             examples:
 *               MissingBusinessUnitId:
 *                 summary: Missing Business Unit Id
 *                 value:
 *                   message: "Failed! businessUnit Id must be a non-empty string"
 *                   errorInfo: null
 *               BusinessUnitNotExist:
 *                 summary: Business Unit does not exist
 *                 value:
 *                   message: "Failed! BusinessUnit does not exist"
 *               MissingUserId:
 *                 summary: Missing User Id
 *                 value:
 *                   message: "Failed! User Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               UserDoesNotExist:
 *                 summary: User does not exist
 *                 value:
 *                   message: "Failed! User doesn't exist!"
 *               MissingEmployeeId:
 *                 summary: Missing Employee ID 
 *                 value:
 *                   message:  "Failed! EmployeeId must be a non-empty string"
 *               DuplicateEmployeeId:
 *                 summary: Employee ID already exists
 *                 value:
 *                   message: "Failed! User employeeId already exists for the business unit"
 *               MissingShiftId:
 *                 summary: Missing shift Id
 *                 value:
 *                   message: "Failed! Shift Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               MissingDepartmentId:
 *                 summary: Missing Department Id
 *                 value:
 *                   message: "Failed! Department Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               DepartmentDoesNotExist:
 *                 summary: Department does not exist
 *                 value:
 *                   message: "Failed! Department doesn't exist!"
 *               MissingUserTypeId:
 *                 summary: Missing User Type Id
 *                 value:
 *                   message: "Failed! User Type Id must be a non-empty string in req.params or req.body or req.query"
 *                   errorInfo: null
 *               UserTypeDoesNotExist:
 *                 summary: User Type does not exist
 *                 value:
 *                   message: "Failed! User Type doesn't exist!"
 *               MissingDesignationId:
 *                 summary: Missing Designation Id
 *                 value:
 *                   message: "Failed! Designation Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               DesignationDoesNotExist:
 *                 summary: Designation does not exist
 *                 value:
 *                   message: "Failed! Designation doesn't exist!"
 *               MissingTeamId:
 *                 summary: Missing Team Id
 *                 value:
 *                   message: "Failed! Team Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               MissingReportsToId:
 *                 summary: Missing Reports To Id
 *                 value:
 *                   message: "Failed! Reports To Id must be a non-empty string in req.params or req.body"
 *                   errorInfo: null
 *               ReportsToUserDoesNotExist:
 *                 summary: ReportsTo User does not exist
 *                 value:
 *                   message: "Failed! ReportsTo User doesn't exist!"
 *               MissingBusinessUnit:
 *                 summary: Missing Business Unit
 *                 value:
 *                   message: "Failed! businessUnit must be a non-empty string"
 *                   errorInfo: null
 *               MissingDepartment:
 *                 summary: Missing Department
 *                 value:
 *                   message: "Failed! department must be a non-empty string"
 *                   errorInfo: null
 *               MissingShift:
 *                 summary: Missing Shift
 *                 value:
 *                   message: "Failed! shift must be a non-empty string"
 *                   errorInfo: null
 *               MissingUserType:
 *                 summary: Missing User Type
 *                 value:
 *                   message: "Failed! userType must be a non-empty string"
 *                   errorInfo: null
 *               MissingDesignation:
 *                 summary: Missing Designation
 *                 value:
 *                   message: "Failed! designation must be a non-empty string"
 *                   errorInfo: null
 *               MissingFirstName:
 *                 summary: Missing First Name
 *                 value:
 *                   message: "Failed! firstName must be a non-empty string"
 *                   errorInfo: null
 *               MissingLastName:
 *                 summary: Missing Last Name
 *                 value:
 *                   message: "Failed! lastName must be a non-empty string"
 *                   errorInfo: null
 *               LastNameTooLong:
 *                 summary: Last Name Too Long
 *                 value:
 *                   message: "Failed! lastName should not exceed 50 characters"
 *                   errorInfo: null
 *               MissingCountryCode:
 *                 summary: Missing Country Code
 *                 value:
 *                   message: "Failed! countryCode must be a non-empty string"
 *                   errorInfo: null
 *               CountryCodeTooLong:
 *                 summary: Country Code Too Long
 *                 value:
 *                   message: "Failed! countryCode should not exceed 4 characters"
 *                   errorInfo: null
 *               MissingContactNumber:
 *                 summary: Missing Contact Number
 *                 value:
 *                   message: "Failed! contactNumber must be a non-empty number"
 *                   errorInfo: null
 *               InvalidBusinessUnit:
 *                 summary: Invalid Business Unit type
 *                 value:
 *                   message: "Failed! businessUnit must be a string"
 *               InvalidDepartment:
 *                 summary: Invalid Department type
 *                 value:
 *                   message: "Failed! department must be a string"
 *               InvalidShift:
 *                 summary: Invalid Shift type
 *                 value:
 *                   message: "Failed! shift must be a string"
 *               InvalidUserType:
 *                 summary: Invalid User Type
 *                 value:
 *                   message: "Failed! userType must be a string"
 *               InvalidDesignation:
 *                 summary: Invalid Designation type
 *                 value:
 *                   message: "Failed! designation must be a string"
 *               InvalidFirstName:
 *                 summary: Invalid First Name type
 *                 value:
 *                   message: "Failed! firstName must be a string"
 *               InvalidLastName:
 *                 summary: Invalid Last Name type
 *                 value:
 *                   message: "Failed! lastName must be a string"
 *               InvalidCountryCode:
 *                 summary: Invalid Country Code type
 *                 value:
 *                   message: "Failed! countryCode must be a string"
 *               InvalidContactNumber:
 *                 summary: Invalid Contact Number type
 *                 value:
 *                   message: "Failed! contactNumber must be a number"
 *               InvalidEmployeeId:
 *                 summary: Invalid Employee Id type
 *                 value:
 *                   message: "Failed! Employee Id must be a string!"
 *                   errorInfo: null
 *               MissingEmail:
 *                 summary: Missing Email
 *                 value:
 *                   message: "Failed! Email must be provided!"
 *                   errorInfo: null 
 *               InvalidEmail:
 *                 summary: Invalid Email
 *                 value:
 *                   message: "Failed! Email is not valid"
 *                   errorInfo: null
 *               EmailAlreadyExists:
 *                 summary: Email Already in Use
 *                 value:
 *                   message: "Failed! Email already exists for the business unit"
 *                   errorInfo: null
 *               ImageAndSignatureSame:
 *                 summary: Image and eSignature Conflict
 *                 value:
 *                   message: "Failed! User image and eSignature cannot be the same"
 *                   errorInfo: null
 *               InvalidImageType:
 *                 summary: Invalid Image type
 *                 value:
 *                   message: "Failed! Image must be a string!"
 *                   errorInfo: null
 *               InvalidImage:
 *                 summary: Invalid Image
 *                 value:
 *                   message: "Failed! image is not valid"
 *                   errorInfo: null
 *               InvalideESignatureType:
 *                 summary: Invalid eSignature Id type
 *                 value:
 *                   message: "Failed! eSignature must be a string!"
 *                   errorInfo: null
 *               InvalidESignature:
 *                 summary: Invalid eSignature
 *                 value:
 *                   message: "Failed! eSignature is not valid"
 *                   errorInfo: null
 *               InvalidIsEnabled:
 *                 summary: Invalid isEnabled Field
 *                 value:
 *                   message: "Failed! isEnabled must be a boolean"
 *                   errorInfo: null
 *               UserNotCreated:
 *                 summary: User creation failed
 *                 value:
 *                   message: "Failed! User not created"
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
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team not found"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               TeamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   message: Team does not exist
 *                   errorInfo: null
 *               ShiftNotFound:
 *                 summary: Shift not found
 *                 value:
 *                   message: "Failed! Shift does not exist."
 *                   errorInfo: null  
 *       '409':
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Conflict User already created"
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
*/


/**
 * @swagger
 * /api/v1/auth/resetPassword:
 *   put:
 *     summary: Reset user password
 *     description: Allows authenticated users to reset their password.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buUserId:
 *                 type: string
 *                 example: "12345"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               employeeId:
 *                 type: string
 *                 example: "E12345"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "newPassword123"
 *               source:
 *                 type: string
 *                 example: "SECURITY_SRC_1_NAME"
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *                 password:
 *                   type: string
 *                   example: "encryptedPassword123"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! email, buUserId or employeeId is required"
 *             examples:
 *               MissingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "Failed! buUserId, email, or employeeId is required"
 *               UserNotExist:
 *                 summary: User does not exist
 *                 value:
 *                   message: "Failed! User doesn't exist!"
 *               UserDoesNotMatch:
 *                 summary: User doesn't match
 *                 value:
 *                   message: "Failed! User doesn't match. Only account owner can reset password"
 *               InvalidSource:
 *                 summary: Invalid source
 *                 value:
 *                   message: "Failed! Invalid source"
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
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
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
 *                   example: "Some internal server error"
*/
