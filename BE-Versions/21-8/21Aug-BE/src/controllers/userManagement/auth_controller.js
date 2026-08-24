/*
date              cr/qid      comments
15-april-2026     CR0018      [Modified] - User Enumeration [Generic response]
*/
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // CR0016
const { authConfig } = require("../../configs");
const Token = require("../../models/mongoDB/tokenManagement/token_model.js"); // CR0016
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const dataConstructor = require("../../managers/common/DataObjectConstructor_manager.js")
const userManager = require("../../managers/internalManagers/userManagement/user_manager");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager");
const { generateRandomPasswordString, hashPassword } = require("../../utils/password_utils.js");
const userAuthenticationManager = require("../../managers/internalManagers/userManagement/userAuthentication_manager.js");
const teamManager = require("../../managers/internalManagers/userManagement/team_manager.js");
const {
	createUserPermission
} = require("../../managers/internalManagers/userManagement/userPermission_manager.js");
const {
	sendViaUserID,
	sendViaUserType,
} = require('../../utils/socket/socketHandler.js')
const {
	fetchUserTypeByDepartment,
} = require('../../utils/socket/socketUserHandler.js')
const { securityConfig } = require("../../configs/index.js");
const { decryptCBC, encryptCBC } = require("../../utils/security.js");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager.js");
const { generateBusinessUnitToken, isBusinessUnitTokenExpired } = require("../../utils/businessUnitToken.js");
const organization_model = require("../../models/mongoDB/organizationManagement/organization_model.js");
const userAuthentication_model=require("../../models/mongoDB/userManagement/userAuthentication_model.js")
// const { mongoDbManager } = require("../../managers/dBManagers/index.js");


exports.signin = async (req, res) => {
	try {
		const { email, password, source } = req.body;

		if (!email || !password) {
			return apiResponseHandler.errorResponse(null, req, res, "Email and password are required", 400, null);
		}

		// Get user authentication by email
		const userAuth = await userAuthenticationManager.getUserAuthenticationByField(
			"email",
			email,
			"user,password,businessUnitToken,businessUnitTokenCreatedAt,isSuperAdmin"
		);

		if (!userAuth) {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid credentials", 401, null);//CR0018
		}

		// Decrypt password based on source
		let decryptedPassword;
		if (source === securityConfig.SECURITY_SRC_0_NAME) {
			decryptedPassword = password;
		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
			decryptedPassword = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_1);
		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
			decryptedPassword = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_2);
		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
			decryptedPassword = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_3);
		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
			decryptedPassword = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_4);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid source", 400, null);
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(decryptedPassword, userAuth.password);
		if (!isValidPassword) {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid credentials", 401, null);
		}

		// Get all users linked to this authentication
		const linkedUsers = await userManager.getUsersByAuthentication(userAuth.id);
		if (linkedUsers.length === 1) {
			// Single user case - proceed with normal login
			const user = await userManager.getUser(req, linkedUsers[0].id, "businessUnit department", "permissions");
			// CR0016
			const currentKey = crypto.randomBytes(32).toString("hex");
			const hashedKey = crypto
				// .createHmac("sha256", process.env.SECRET_HMAC_KEY)
				.createHmac("sha256", securityConfig.SECRET_HMAC_KEY)
				.update(currentKey)
				.digest("hex");

			// console.log("CK:->",currentKey)
			// console.log("HK:->",hashedKey)

			const jwtpayload = { id: user.id, permissions: user.permissions, businessUnit: user.businessUnit, isSuperAdmin: userAuth.isSuperAdmin,department:user.department,secretKey: currentKey };
			const token = jwt.sign(
				jwtpayload,
				authConfig.SECRET,
				{ expiresIn: authConfig.EXPIRES_IN }
			);
			
			// CR0016
			const userAgent = req.headers["user-agent"];
			const ip = req.ip;

			// remove old tokens (single session)
			await Token.deleteMany({ userId: user.id });

			await Token.create({
			userId: user.id,
			token: token,
			userAgent,
			ip,
			secretKey: hashedKey
			});


			return apiResponseHandler.successResponse(res, "User signed in successfully", 200, {
			accessToken: token
		});
		}
		// CR0031- Restricted unwanted  Show BU Screen 
		else if (linkedUsers.length === 0) {
			return apiResponseHandler.successResponse(res,"User account is disabled. Contact admin",400,null)
		}// CR0031- Restricted unwanted  Show BU Screen 
		else {
			// Multiple users case - generate businessUnitToken
			const businessUnitToken = generateBusinessUnitToken();
			await userAuthenticationManager.updateUserAuthentication(userAuth.id, {
				businessUnitToken,
				businessUnitTokenCreatedAt: new Date()
			});

				return apiResponseHandler.successResponse(res, "Business Unit Token sent successfully", 200, {
					authId: userAuth.id,
					businessUnitToken: businessUnitToken,
				});
		}
	} catch (error) {
		console.error("Signin error:", error);
		return apiResponseHandler.errorResponse(null, req, res, "Internal server error", 500, error);
	}
};

// signout - CR0016
exports.signout = async (req, res) => {
	try {
		const userId = req.userId;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return apiResponseHandler.errorResponse(
				null, req, res, "No token provided", 400, null
			);
		}

		const deletedToken = await Token.findOneAndDelete({
			userId: userId,
			token: token
		});

		if (!deletedToken) {
			return apiResponseHandler.errorResponse(
				null, req, res, "Token not found or already logged out", 404, null
			);
		}

		return apiResponseHandler.successResponse(
			res, "User signed out successfully", 200, null
		);
	} catch (error) {
		console.error("Signout error:", error);
		return apiResponseHandler.errorResponse(
			error, req, res, "Internal server error during signout", 500, null
		);
	}
};

exports.getLinkedUnits = async (req, res) => {
	try {
		const { authId } = req.params;
			const { businessUnitToken } = req.body;

		if (!authId) {
			return apiResponseHandler.errorResponse(null, req, res, "Auth ID is required", 400, null);
		}
		if (!businessUnitToken) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"BusinessUnitToken is required",
				400,
				null
			);
		}

		// Get user authentication
		const userAuth = await userAuthenticationManager.getUserAuthenticationByField(
			"_id",
			authId,
			"businessUnitToken,businessUnitTokenCreatedAt"
		);

		if (!userAuth.businessUnitToken || userAuth.businessUnitToken !== businessUnitToken || isBusinessUnitTokenExpired(userAuth.businessUnitTokenCreatedAt)) {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid or expired businessUnitToken", 401, null);
		}

		// Get all users linked to this authentication
		const linkedUsers = await userManager.getUsersByAuthentication(authId);

		if (!linkedUsers.length) {
			return apiResponseHandler.errorResponse(null, req, res, "Selected user has no linked units", 404, null);
		}

		// Get unique organizations and their business units
		const orgsWithBUs = new Map();
		
		for (const user of linkedUsers) {
			const businessUnit = await businessUnitManager.getBusinessUnit(user._doc.businessUnit, "name organization", "organization");
			
			
			if (!businessUnit) continue;
			const org = businessUnit.organization;
			
			if (!orgsWithBUs.has(org.id.toString())) {
				orgsWithBUs.set(org.id.toString(), {
					organization: {
						id: org.id,
						name: org.name
					},
					businessUnits: []
				});
			}
			

			const orgData = orgsWithBUs.get(org.id.toString());
			orgData.businessUnits.push({
				id: businessUnit.id,
				name: businessUnit.name
			});

		}

		return apiResponseHandler.successResponse(
			res,
			"Linked units retrieved successfully",
			200,
			Array.from(orgsWithBUs.values())
		);
	} catch (error) {
		console.error("Get linked units error:", error);
		return apiResponseHandler.errorResponse(null, req, res, "Internal server error", 500, error);
	}
};

exports.verifyBusinessUnitToken = async (req, res) => {
	try {
		const authId = req.params.authId;
		const businessUnitId = req.params.businessUnitId;
		const { businessUnitToken } = req.body;

		if (!authId || !businessUnitToken || !businessUnitId) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"Auth ID, businessUnitToken, and Business Unit ID are required",
				400,
				null
			);
		}

		// Get user authentication
		const userAuth = await userAuthenticationManager.getUserAuthenticationByField(
			"_id",
			authId,
			"businessUnitToken,businessUnitTokenCreatedAt"
		);

		if (!userAuth) {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid auth ID", 404, null);
		}

		// Verify BusinessUnitToken
		if (!userAuth.businessUnitToken || userAuth.businessUnitToken !== businessUnitToken || isBusinessUnitTokenExpired(userAuth.businessUnitTokenCreatedAt)) {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid or expired businessUnitToken", 401, null);
		}

		// Get user with matching business unit
		const userByAuthAndBusinessUnit = await userManager.getUserByAuthAndBusinessUnit(authId, businessUnitId);
		if (!userByAuthAndBusinessUnit) {
			return apiResponseHandler.errorResponse(
				null,
				req,
				res,
				"No user found with the specified business unit",
				404,
				null
			);
		}

	// CR0016
	const currentKey = crypto.randomBytes(32).toString("hex");
	const hashedKey = crypto
			// .createHmac("sha256", process.env.SECRET_HMAC_KEY)
			.createHmac("sha256", securityConfig.SECRET_HMAC_KEY)
			.update(currentKey)
			.digest("hex");

	const user = await userManager.getUser(req, userByAuthAndBusinessUnit.id, "businessUnit", "permissions");
			const token = jwt.sign(
				{ id: user.id, permissions: user.permissions, businessUnit: user.businessUnit, secretKey: currentKey },
				authConfig.SECRET,
				{ expiresIn: authConfig.EXPIRES_IN }
			);

			// CR0016
			const userAgent = req.headers["user-agent"];
			const ip = req.ip;

			await Token.deleteMany({ userId: user.id });

			await Token.create({
			userId: user.id,
			token: token,
			userAgent,
			ip,
			secretKey: hashedKey
			});

		// Clear businessUnitToken
		await userAuthenticationManager.updateUserAuthentication(authId, {
			businessUnitToken: null,
			businessUnitTokenCreatedAt: null
		});

		return apiResponseHandler.successResponse(
			res,
			"User signed in successfully",
			200,
			{
				accessToken: token
			}
		);
	} catch (error) {
		console.error("Verify businessUnitToken error:", error);
		return apiResponseHandler.errorResponse(null, req, res, "Internal server error", 500, error);
	}
};

exports.signup = async (req, res) => {
	try {
		if (req.userObj && !req.userObj.isDraft) {
			return apiResponseHandler.errorResponse(null, req,
				res,
				"Failed! Conflict User already created",
				409,
				null
			);
		} else if (!req.query.draft && !req.userObj) {
			const userReqObj = createUserObject(req);
			const buUserIdAndName = await businessUnitManager.returnNewBuUserIdAndName(req, req.businessUnit);
			userReqObj.buUserId = buUserIdAndName.buUserId;
			const user = await userManager.createUser(userReqObj);
			if (user) {
				await businessUnitManager.updateBusinessUnitUserCountByOne(req.businessUnit);
				if (req.team) {
					await teamManager.appendUsersToTeam(req.team, [user.id]);
				}
				// let generatedPassword = generateRandomPasswordString(8);
				// let encryptPassword = encryptCBC(
				// 	generatedPassword,
				// 	securityConfig.SECURITY_SECRET_KEY_SRC_1
				// );
				// let hashedPassword = hashPassword(generatedPassword);
				// const userAuthenticationReqObj = createUserAuthenticationObject(
				// 	user.id,
				// 	userReqObj.buUserId,
				// 	userReqObj.email,
				// 	userReqObj.employeeId,
				// 	hashedPassword,
				// 	24 * 60 * 60 * 1000 * 180,
				// 	req.businessUnit
				// );
				const userAuthentication = await userAuthenticationManager.getUserAuthenticationByField("email", userReqObj.email);
				const userPermissionReqObj = createUserPermissionObject(req, user.id);
				const userPermission = await createUserPermission(userPermissionReqObj);
				const updateUserReq = {
					userPermission: userPermission.id
				}
				if (userAuthentication) {
					updateUserReq.userAuthentication = userAuthentication.id
				}
				await userManager.updateUser(user.id, updateUserReq );
				if (userReqObj.image) {
					await fileManager.updateFilePath(null, userReqObj.image, "users", user.id, req.userId);
				}
				if (userReqObj.eSignature) {
					await fileManager.updateFilePath(null, userReqObj.eSignature, "users", user.id, req.userId);
				}
				const message = "User created successfully";

				user.userPermission = userPermission.id;
				// user.userAuthentication = {
				// 	password: encryptPassword,
				// 	passwordExpireAt: userAuthentication.passwordExpireAt
				// };

				const data = dataConstructor.constructNotification(
					"create",
					`has ben added to your department`,
					{ "id": user.id, "name": user.name },
					"users",
					req.userId,
					req.businessUnit
				);

				let userTypes = await fetchUserTypeByDepartment(user.department);
				await sendViaUserType("notification", userTypes, data);
				if (user.reportsTo) {
					const data = dataConstructor.constructNotification(
						"assign",
						`has been assigned to you.`,
						{ "id": user.id, "name": user.name },
						"users",
						req.userId,
						req.businessUnit
					);
					await sendViaUserID("notification", user.reportsTo.toHexString(), data);
				}
				delete user.department;
				delete user.name;
				delete user.reportsTo;
				return apiResponseHandler.successResponse(res, message, 201, user);
			} else {
				return apiResponseHandler.errorResponse(null, req, res, "Failed! User not created", 400, null);
			}
		} else if (!req.query.draft && req.userObj) {
			const userReqObj = createUserObject(req);

			const buUserIdAndName = await businessUnitManager.returnNewBuUserIdAndName(req, req.businessUnit);
			userReqObj.buUserId = buUserIdAndName.buUserId;
			userReqObj.isDraft = false;
			const user = await userManager.updateUser(req.body.user, userReqObj);
			const response = { id: req.body.user };
			if (user) {
				await businessUnitManager.updateBusinessUnitUserCountByOne(req.businessUnit);
				// let generatedPassword = generateRandomPasswordString(8);
				// let encryptPassword = encryptCBC(
				// 	generatedPassword,
				// 	securityConfig.SECURITY_SECRET_KEY_SRC_1
				// );
				// let hashedPassword = hashPassword(generatedPassword);
				// const userAuthenticationReqObj = createUserAuthenticationObject(
				// 	req.body.user,
				// 	userReqObj.buUserId,
				// 	userReqObj.email,
				// 	userReqObj.employeeId,
				// 	hashedPassword,
				// 	24 * 60 * 60 * 1000 * 180,
				// 	req.businessUnit
				// );
				const userAuthentication = await userAuthenticationManager.getUserAuthenticationByField("email", userReqObj.email);
				const userPermissionReqObj = createUserPermissionObject(req, req.body.user);
				const userPermission = await createUserPermission(userPermissionReqObj);
					const updateUserReq = {
					userPermission: userPermission.id
				}
				if (userAuthentication) {
					updateUserReq.userAuthentication = userAuthentication.id
				}
				await userManager.updateUser(req.body.user, updateUserReq);
				const message = "User created successfully";

				response.userPermission = userPermission.id;
				// response.userAuthentication = {
				// 	password: encryptPassword,
				// 	passwordExpireAt: userAuthentication.passwordExpireAt
				// };
				return apiResponseHandler.successResponse(res, message, 201, response);
			} else {
				return apiResponseHandler.errorResponse(null, req, res, "Failed! User not created", 400, null);
			}
		} else {
			const userReqObj = createUserObject(req);
			delete userReqObj.team;
			userReqObj.isDraft = true;
			const user = await userManager.createUser(userReqObj);
			const message = "User drafted successfully";
			return apiResponseHandler.successResponse(res, message, 201, user);
		}
	} catch (error) {
		console.log("Error while creating the user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

//CR0020

// exports.resetPassword = async (req, res) => {
// 	try {
// 		const { buUserId, email, employeeId } = req.body;

// 		if (!buUserId && !email && !employeeId) {
// 			return apiResponseHandler.errorResponse(null, req, res, "Failed! buUserId, email, or employeeId is required", 400, null);
// 		}

// 		let userAuth = null;
// 		if (buUserId) {
// 			userAuth = await userAuthenticationManager.getUserAuthenticationByField("buUserId", buUserId, "user");
// 		} else if (email) {
// 			userAuth = await userAuthenticationManager.getUserAuthenticationByField("email", email, "user");
// 		} else if (employeeId) {
// 			userAuth = await userAuthenticationManager.getUserAuthenticationByField("employeeId", employeeId, "user");
// 		}

// 		if (!userAuth) {
// 			return apiResponseHandler.errorResponse(null, req, res, "Failed! User doesn't exist!", 400, null);
// 		}

// 		if (userAuth && userAuth.user) {
// 			const user = await userManager.getUser(req, userAuth.user);
// 			if (!user) {
// 				return apiResponseHandler.errorResponse(null, req, res, "Failed! User doesn't exist!", 400, null);
// 			}
// 		}
// 		else {
// 			return apiResponseHandler.errorResponse(null, req, res, "Failed! User doesn't exist!", 400, null);
// 		}
// 		if (userAuth.user != req.userId) {
// 			return apiResponseHandler.errorResponse(
// 				null,
// 				req,
// 				res,
// 				"Failed! User doesn't match. Only account owner can reset password",
// 				400,
// 				null
// 			);
// 		}

// 		const newPassword = req.body.password || generateRandomPasswordString(8);
// 		// const hashedPassword = hashPassword(newPassword);

// 		let dcrptPass;
// 		const source = req.body.source;
// 		if (source === securityConfig.SECURITY_SRC_0_NAME) {
// 			dcrptPass = newPassword;
// 		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
// 			dcrptPass = newPassword;
// 			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_1);
// 		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
// 			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_2);
// 		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
// 			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_3);
// 		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
// 			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_4);
// 		} else {
// 			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
// 		}
// 		let encryptedPassword;

// 		if (source === securityConfig.SECURITY_SRC_0_NAME) {
// 			encryptedPassword = dcrptPass;
// 		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
// 			encryptedPassword = dcrptPass;
// 			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_1);
// 		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
// 			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_2);
// 		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
// 			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_3);
// 		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
// 			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_4);
// 		} else {
// 			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
// 		}
// 		const hashedPassword = hashPassword(dcrptPass);
// 		const updateUserAuthenticationObj = updateUserAuthenticationPasswordObject(hashedPassword);

// 		updateUserAuthenticationObj.updatedBy = req.userId;

// 		await userAuthenticationManager.updateUserAuthentication(userAuth.id, updateUserAuthenticationObj);

// 		const message = "Password reset successfully";
// 		return apiResponseHandler.successResponse(res, message, 200, { password: encryptedPassword });
// 	} catch (error) {
// 		console.log("Error while resetting the password", error.message);
// 		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
// 	}
// };

exports.resetPassword = async (req, res) => {
  try {
    const { email, password ,source} = req.body;
	console.log(req.body,"pass")
    //  Validate input
    if (!email || !password ||!source) {
      return apiResponseHandler.errorResponse(
		null,
        req,
        res,
        "All fields are required",
        400,
        null
      );
    }

    //  Find user
    const user = await userAuthentication_model.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
      isEnabled: true
    });
	console.log(user,"updatePassword")

    if (!user) {
      return apiResponseHandler.errorResponse(
		null,
        req,
        res,
        "User not found",
        404,
        null
      );
    }

        let dcrptPass;
		
		if (source === securityConfig.SECURITY_SRC_0_NAME) {
			dcrptPass = password;
		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
			dcrptPass = password;
			dcrptPass = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_1);
		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
			dcrptPass = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_2);
		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
			dcrptPass = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_3);
		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
			dcrptPass = decryptCBC(password, securityConfig.SECURITY_SECRET_KEY_SRC_4);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
		}
		const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[*@$!%?&])[A-Za-z0-9*@$!%?&]{8,15}$/;

		if (!passwordRegex.test(dcrptPass)) {
  return apiResponseHandler.errorResponse(
    null,
    req,
    res,
    "Password must be 8-15 characters and include uppercase, lowercase, number, and special character",
    400,
    null
  );
		}
		let encryptedPassword;

		if (source === securityConfig.SECURITY_SRC_0_NAME) {
			encryptedPassword = dcrptPass;
		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
			encryptedPassword = dcrptPass;
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_1);
		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_2);
		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_3);
		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_4);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
		}
        console.log("encryptedPassword", encryptedPassword)
		const hashedPassword = hashPassword(dcrptPass);

    //  Update password
    user.password = hashedPassword;
    await user.save();
    return apiResponseHandler.successResponse(
      res,
      "Password updated successfully",
      200,
      null
    );

  } catch (error) {
    console.log(error);

    return apiResponseHandler.errorResponse(
	  error,
      req,
      res,
      "Some internal server error",
      500,
      null
    );
  }
};

// CR0020

exports.registerUserAuthentication = async (req, res) => {
	try {
		const { email } = req.body;
		const newPassword = req.body.password || generateRandomPasswordString(8);

		const userAuth = await userAuthenticationManager.getUserAuthenticationByField(
			"email",
			email,
			"user,password,businessUnitToken,businessUnitTokenCreatedAt,isSuperAdmin"
		);

		if (userAuth) {
			return apiResponseHandler.errorResponse(null, req, res, "User already exist", 400, null);
		}

		let dcrptPass;
		// console.log("dcrptPass", dcrptPass, securityConfig.SECURITY_SRC_0_NAME)
		const source = req.body.source;
		console.log("source", source)

		if (source === securityConfig.SECURITY_SRC_0_NAME) {
			dcrptPass = newPassword;
		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
			dcrptPass = newPassword;
			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_1);
		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_2);
		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_3);
		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
			dcrptPass = decryptCBC(newPassword, securityConfig.SECURITY_SECRET_KEY_SRC_4);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
		}
		console.log("dcrptPass", dcrptPass, req.body.password)
		const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[*@$!%?&])[A-Za-z0-9*@$!%?&]{8,15}$/;

if (!passwordRegex.test(dcrptPass)) {
  return apiResponseHandler.errorResponse(
    null,
    req,
    res,
    "Password must be 8-15 characters and include uppercase, lowercase, number, and special character",
    400,
    null
  );
}
		let encryptedPassword;

		if (source === securityConfig.SECURITY_SRC_0_NAME) {
			encryptedPassword = dcrptPass;
		} else if (source === securityConfig.SECURITY_SRC_1_NAME) {
			encryptedPassword = dcrptPass;
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_1);
		} else if (source === securityConfig.SECURITY_SRC_2_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_2);
		} else if (source === securityConfig.SECURITY_SRC_3_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_3);
		} else if (source === securityConfig.SECURITY_SRC_4_NAME) {
			encryptedPassword = encryptCBC(dcrptPass, securityConfig.SECURITY_SECRET_KEY_SRC_4);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid source", 400, null);
		}
				
		console.log("encryptedPassword", encryptedPassword)
		const hashedPassword = hashPassword(dcrptPass);

		const userAuthenticationReqObj = createUserAuthenticationObject(
					email,
					hashedPassword,
					24 * 60 * 60 * 1000 * 180,
				);
		const userAuthentication = await userAuthenticationManager.createUserAuthentication(userAuthenticationReqObj);

		const linkedUsers = await userManager.getUsersByEmail(email);

		

		// update all linked user with authId
		if(linkedUsers.length > 0) {
			await userManager.updateUsers(linkedUsers.map(user => user.id), { userAuthentication: userAuthentication.id });
		}

		// return apiResponseHandler.successResponse(res, "User registered successfully", 200, { password: encryptedPassword });
		return apiResponseHandler.successResponse(res, "User registered successfully", 200,null);
	} catch (error) {
		console.log("Error while registering the user", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}

};

const createUserObject = (req) => {
	const userCreateObj = {
		firstName: req.body.firstName || req.userObj?.firstName,
		lastName: req.body.lastName || req.userObj?.lastName,
		name: req.body.firstName + " " + req.body.lastName || req.userObj?.name,
		buUserId: req.body.buUserId || req.userObj?.buUserId,
		employeeId: req.body.employeeId || req.userObj?.employeeId,
		email: req.body.email || req.userObj?.email,
		contactNumber: req.body.contactNumber || req.userObj?.contactNumber,
		countryCode: req.body.countryCode || req.userObj?.countryCode,
		isEnabled: req.body.isEnabled ? req.body.isEnabled : true || req.userObj?.isEnabled,
		reportsTo: req.body.reportsTo || req.userObj?.reportsTo,
		eSignature: req.body.eSignatureId || req.userObj?.eSignature,
		businessUnit: req.businessUnit || req.userObj?.businessUnit,
		shift: req.body.shift || req.userObj?.shift,
		department: req.body.department || req.userObj?.department,
		userType: req.body.userType || req.userObj?.userType,
		designation: req.body.designation || req.userObj?.designation,
		team: req.body.team || req.userObj?.team,
		image: req.body.image || req.userObj?.image,
		eSignature: req.body.eSignature || req.userObj?.eSignature,
		createdBy: req.userId || req.userObj?.createdBy,
		updatedBy: req.userId || req.userObj?.updatedBy
	};
	return userCreateObj;
};

const createUserAuthenticationObject = (
	email,
	password,
	expiryDuration = 24 * 60 * 60 * 1000 * 180,
) => {
	return {
		email: email,
		password: password,
		passwordExpireAt: Date.now() + expiryDuration,
	};
};

const updateUserAuthenticationPasswordObject = (password, expiryDuration = 24 * 60 * 60 * 1000 * 180) => {
	return {
		password: password,
		passwordExpireAt: Date.now() + expiryDuration
	};
};

const createUserPermissionObject = (req, user) => {
	return {
		user: user,
		businessUnit: req.businessUnit,
		createdBy: req.userId,
		updatedBy: req.userId
	};
};
exports.createUserAuthenticationObject = createUserAuthenticationObject// recommended for using it within the local module and external modules
