/*
date            qid / cr#         comments
19-mar-2026     CR0008           ASSET import by xlsx

*/
const fs = require("fs");//Excel //CR0008
const assetManager = require("../../managers/internalManagers/assetManagement/asset_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const { assetConstant } = require("../../models/mongoDB/assetManagement/asset_model"); // Assuming you have this file for constants
const assetConstants = assetConstant;
const dataConstructor = require("../../managers/common/DataObjectConstructor_manager.js")
const ActivityManager = require("../../managers/internalManagers/activityManagement/activity_manager")
const {
	sendViaUserType,
} = require('../../utils/socket/socketHandler.js')
const {
	fetchUserTypeByDepartment,
	fetchAllUserTypeByDepartment,
	getUserTypeAndNameUsingUserId
} = require('../../utils/socket/socketUserHandler.js')
const assetHistoryManager = require("../../managers/internalManagers/assetManagement/assetHistory_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const sparesAndInventory_manager = require("../../managers/internalManagers/assetManagement/sparesAndInventory_manager.js");
const { createMasterAsset, updateMasterAsset } = require("../../managers/internalManagers/assetManagement/assetMastery_manager.js");

const createAssetGeneralDetails = async (req, res) => {
	try {
		const assetCreateObj = req.assetCreateObject;
		const createdAsset = await assetManager.createAsset(assetCreateObj);
		await createMasterAsset(createdAsset);
		await handleActivityForAssetCreation(createdAsset, req.userId, req.businessUnit);
		await handleNotificationForAssetCreation(createdAsset, req.userId);
		if (assetCreateObj.images) {
			await fileManager.updateFilePaths(null, assetCreateObj.images, "assets", createdAsset.id, req.userId);
		}
		if (assetCreateObj.specifications && assetCreateObj.specifications.termsAndConditions) {
			await fileManager.updateFilePaths(
				null,
				assetCreateObj.specifications.termsAndConditions,
				"assets",
				req.asset,
				req.userId
			);
		}
		// if(assetCreateObj.spares){
		// 	await sparesAndInventory_manager.updateSpare(assetCreateObj.spares, createdAsset.id)
		// }
		const message = "Asset created successfully";
		return apiResponseHandler.successResponse(res, message, 201, { id: createdAsset.id });
	} catch (error) {
		console.log("Some error happened while creating asset", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const updateAsset = async (req, res) => {
	try {
		const existingAssetObject = req.assetObj;
		const assetUpdateObject = req.assetUpdateObject;
		await assetManager.updateAsset(req.params.asset, assetUpdateObject);
		await updateMasterAsset(req.params.asset,assetUpdateObject);

		if(assetUpdateObject?.specifications?.manufacturingDetails){
			await assetManager.updateStatusHistoryOnInstallation(req.params.asset, assetUpdateObject.specifications.manufacturingDetails.installationDate);
		}
		
		if (assetUpdateObject.images?.length) {
			await fileManager.updateFilePaths(null, assetUpdateObject.images, "assets", req.asset, req.userId);
		}
		if (assetUpdateObject.specifications?.termsAndConditions && assetUpdateObject.specifications?.termsAndConditions !== null) {
			await fileManager.updateFilePaths(
				null,
				assetUpdateObject.specifications.termsAndConditions,
				"assets",
				req.asset,
				req.userId
			);
		}
		if(assetUpdateObject.locationAndHierarchyDetails?.hierarchy?.parent){
			await assetManager.updateParentAsset( req.asset,assetUpdateObject.locationAndHierarchyDetails.hierarchy.parent )
		}
		await handleActivityForAssetEdit(assetUpdateObject, existingAssetObject, req.userId, req.businessUnit)
		await handleNotificationForAssetEdit(assetUpdateObject, existingAssetObject, req.userId)
		await assetHistoryManager.updateAssetHistoryManager(req.params.asset, req.body, existingAssetObject.generalDetails.name, req.businessUnit);
		const message = "Asset updated successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Some error happened while updating asset", error);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const deleteAsset = async (req, res) => {
	try {
		await assetManager.deleteAsset(req.asset);
		await handleActivityForAssetDelete(req.assetObj, req.userId, req.businessUnit)
		await handleNotificationForAssetDelete(req.assetObj, req.userId)
		const message = "Asset deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Some error happened while deleting asset", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const deleteAssets = async (req, res) => {
	try {
		await assetManager.deleteAssets(req.body.assets);
		await handleNotificationForMultipleDelete(req.assets, req.userId)
		await handleActivityForMultipleAssetDelete(req.assets, req.userId, req.businessUnit)
		const message = "Assets deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("error", error)
		console.log("Some error happened while deleting asset", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const updateAssetStatus = async (req, res) => {
	try {
		const asset = req.assetObj;
    	const now = new Date();
    if (req.assetUpdateObject.status && req.assetUpdateObject.status !== asset.status) {
      let updatedHistory = [...asset.statusHistory];
      // Close the current active status period if it exists
      const currentRecord = updatedHistory.find((s) => !s.endTime);
      if (currentRecord) {
        currentRecord.endTime = now;
      }
      // Add new status entry
      updatedHistory.push({
        status: req.assetUpdateObject.status,
        startTime: now,
      });

      // Push updated statusHistory into updateObj
      req.assetUpdateObject.statusHistory = updatedHistory;
    }
		await assetManager.updateAsset(req.params.asset, req.assetUpdateObject);
		await handleActivityForStatusChange(req.assetObj, req.assetUpdateObject, req.userId, req.businessUnit)
		await handleNotificationForStatusChange(req)
		const message = "Asset status updated successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Some error happened while updating asset status", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const incompleteRegisterationDetails = async (req, res) => {
	try {
		const incompleteRegisterationDetails = await assetManager.incompleteRegisterationDetails(req.assetObj, req.businessUnit);
		const message = "Assets incomplete registration details fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, incompleteRegisterationDetails);
	} catch (error) {
		console.log("Some error happened while fetching incomplete registration details of an asset", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchQrCode = async (req, res) => {
	try {
		if (req.assetObj.qrCode) {
			const file = await fileManager.getFile(req.assetObj.qrCode, "download",  req.businessUnit, req.get("host"), req.protocol);
			const message = `QR code for asset ${req.assetObj.generalDetails.name} fetched successfully`;
			return apiResponseHandler.successResponse(res, message, 200, file);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Asset not found", 404, null);
		}
	} catch (error) {
		console.log("Some error happened while fetching incomplete registration details of an asset", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};


const fetchAssets = async (req, res) => {
	try {
		req.query.businessUnit = req.businessUnit
		const getAssetsData = await assetManager.getAllAssets(req);
		const message = "Assets Fetched Successfully";
		return apiResponseHandler.successResponse(res, message, 200, getAssetsData);
	} catch (error) {
		console.log("error", error);
		console.log("Some error happened while fetching Assets", error.message);
		return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
	}
};

// const fetchAsset = async (req, res) => {
// 	try {
// 		const assetId = req.assetObj._id;
// 		const getAssetData = await assetManager.getAsset(assetId, req);
// 		if (!getAssetData) {
// 			return apiResponseHandler.errorResponse(null, req, res, "Asset not found", 404, null);
// 		}
// 		const message = "Asset Fetched Successfully";
// 		return apiResponseHandler.successResponse(res, message, 200, getAssetData);
// 	} catch (error) {
// 		console.log("error", error);
// 		console.log("Some error happened while fetching Asset", error.message);
// 		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
// 	}
// };

// for forbidden error - correct code

const fetchAsset = async (req, res) => {
  try {
    const assetId = req.assetObj._id;
    // Get asset's department ID as string
    const assetDepartmentId = req.assetObj.generalDetails.department.toString();
    // Compare
    if (req.department !== assetDepartmentId) {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Forbidden! You do not have access to this asset",
        403
      );
    }
    // Fetch asset
    const getAssetData = await assetManager.getAsset(assetId, req);
    if (!getAssetData) {
      return apiResponseHandler.errorResponse(null, req, res, "Asset not found", 404);
    }
    return apiResponseHandler.successResponse(res, "Asset Fetched Successfully", 200, getAssetData);
  } catch (error) {
    console.log("Some error happened while fetching Asset:", error.message);
    return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
  }
};

const countAssets = async (req, res) => {
	try {
		const users = await assetManager.countAssets(req.businessUnit);
		const message = "Asset count fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, users);
	} catch (error) {
		console.log("Error while fetching asset count", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

const enums = async (req, res) => {
	const { category, subcategory, type, subType } = req.params;

	// Helper function to get only the top-level string values
	const getTopLevelStrings = (obj) => {
		return Object.values(obj).filter((value) => typeof value === "string");
	};

	try {
		const assetConstantsData = assetConstants;

		// Validate path and determine the result
		let result;
		if (category) {
			if (subcategory) {
				if (type) {
					if (subType) {
						// Handle fourth path parameter
						result = assetConstantsData[category]?.[subcategory]?.[type]?.[subType];
					} else {
						result = assetConstantsData[category]?.[subcategory]?.[type];
					}
				} else {
					result = assetConstantsData[category]?.[subcategory];
				}
			} else {
				result = assetConstantsData[category];
			}

			if (!result) {
				return apiResponseHandler.errorResponse(null, req, res, "Invalid path", 400, null);
			}

			// Get only the top-level strings
			result = getTopLevelStrings(result);

			// Prepare and send the response message
			const message =
				type && subType
					? `Enums of ${category}.${subcategory}.${type}.${subType} fetched successfully`
					: type
						? `Enums of ${category}.${subcategory}.${type} fetched successfully`
						: subcategory
							? `Enums of ${category}.${subcategory} fetched successfully`
							: `Enums of ${category} fetched successfully`;

			return apiResponseHandler.successResponse(res, message, 200, result);
		} else {
			return apiResponseHandler.errorResponse(null, req, res, "Invalid parameters", 400, null);
		}
	} catch (error) {
		return apiResponseHandler.errorResponse(error, req, res, error.message, 500, null);
	}
};



const getFullHierarchy = async (req, res) => {
	try{
		const result = await assetManager.fetchHierarchy(req.assetObj);
		const message = "Asset Hierarchy Fetched Successfully"
		return apiResponseHandler.successResponse(res, message, 200, result);
	}catch(error){
		console.log("error", error)
		return apiResponseHandler.errorResponse(error, req, res, error.message, 500, null);
	}
};
//Excel Import
//CR0008
//START

const importAssets = async (req, res) => {
    try {
        const result = await assetManager.importAssetsFromExcel(
            req.file.path,
            req.businessUnit,
            req.userId
        );

        return apiResponseHandler.successResponse(res, "Import completed", 200, result);
    } catch (error) {
        console.log("Error during asset import:", error.message);
        return apiResponseHandler.errorResponse(error, req, res, error.message || "Import failed", 500, null);
    }
};
//Excel Import
//END

module.exports = {
	createAssetGeneralDetails,
	updateAsset,
	deleteAsset,
	deleteAssets,
	countAssets,
	incompleteRegisterationDetails,
	fetchAssets,
	fetchAsset,
	updateAssetStatus,
	enums,
	fetchQrCode,
	getFullHierarchy,
	importAssets,//Excel Import  //CR0008
};



async function sendNotification(
	title,
	message,
	id,
	name,
	department,
	reqUserId,
	businessUnit
) {
	try {
		const data = dataConstructor.constructNotification(
			title,
			message,
			{ id: id, name: name },
			"assets",
			reqUserId,
			businessUnit
		);
		const userTypes = await fetchUserTypeByDepartment(department);
		await sendViaUserType("notification", userTypes, data);
	} catch (err) {
		throw err;
	}
}

async function handleNotificationForStatusChange(req) {
	try {
		const currentStatus = req.assetObj.status.toLowerCase();
		const newStatus = req.assetUpdateObject.status.toLowerCase();

		if (currentStatus === "decommissioned" && newStatus === "active") {
			const sender = await getUserTypeAndNameUsingUserId(req.userId);
			await sendNotification(
				"restore",
				`has been restored by ${sender.name}`,
				req.assetObj._id,
				req.assetObj.generalDetails.name,
				req.assetObj.generalDetails.department,
				req.userId,
				req.businessUnit
			);
		} else if (newStatus === "decommissioned") {
			await sendNotification(
				"decommission",
				`has been decommissioned by ${sender.name}`,
				req.assetObj._id,
				req.assetObj.generalDetails.name,
				req.assetObj.generalDetails.department,
				req.userId,
				req.businessUnit
			);
		} else if (currentStatus !== newStatus) {
			const sender = await getUserTypeAndNameUsingUserId(req.userId);
			const data = dataConstructor.constructNotification(
				"statusChange",
				`has been changed from ${req.assetObj.status} to ${req.assetUpdateObject.status} by ${sender.name}`,
				{ id: req.assetObj._id, name: req.assetObj.generalDetails.name },
				"assets",
				req.userId,
				req.businessUnit
			);
			const userTypes = await fetchAllUserTypeByDepartment(
				req.assetObj.generalDetails.department
			);
			await sendViaUserType("notification", userTypes, data);
		} else {
			console.log("No Notification can be sent");
		}
	} catch (err) {
		throw err;
	}
}

async function handleNotificationForAssetCreation(createdAsset, reqUserId) {
	try {
		const sender = await getUserTypeAndNameUsingUserId(createdAsset.createdBy);
		await sendNotification(
			"create",
			`has been created by ${sender.name}`,
			createdAsset.id,
			createdAsset.name,
			createdAsset.department,
			reqUserId,
			createdAsset.businessUnit
		);
	} catch (err) {
		throw err;
	}
}

async function handleActivityForAssetCreation(createdAsset, reqUserId, businessUnit) {
	try {
		const activityData = dataConstructor.constructActivity(
			`was created`,
			{ id: createdAsset.id, name: createdAsset.name },
			"assets",
			reqUserId
		);
		await ActivityManager.createActivity(activityData, businessUnit);
	} catch (err) {
		throw err;
	}
}

async function handleNotificationForAssetEdit(
	assetUpdateObject,
	existingAssetObject,
	reqUserId
) {
	try {
		if (
			(assetUpdateObject.specifications &&
				existingAssetObject.specifications) ||
			(assetUpdateObject.locationAndHierarchyDetails &&
				existingAssetObject.locationAndHierarchyDetails) ||
			assetUpdateObject.generalDetails
		) {
			const sender = await getUserTypeAndNameUsingUserId(reqUserId);
			const newAssetName = existingAssetObject.generalDetails.name
				? existingAssetObject.generalDetails.name
				: assetUpdateObject.generalDetails.name;
			const newDepartmentId = existingAssetObject.generalDetails.department
				? existingAssetObject.generalDetails.department
				: assetUpdateObject.generalDetails.department;
			await sendNotification(
				"edit",
				`has been edited by ${sender.name}`,
				existingAssetObject._id,
				newAssetName,
				newDepartmentId,
				reqUserId,
				existingAssetObject.generalDetails.businessUnit
			);
		}
	} catch (err) {
		throw err;
	}
}

async function handleActivityForAssetEdit(
	assetUpdateObject,
	existingAssetObject,
	reqUserId,
	businessUnit
) {
	try {
		const newAssetName = existingAssetObject.generalDetails.name
			? existingAssetObject.generalDetails.name
			: assetUpdateObject.generalDetails.name;
		const activityData = dataConstructor.constructActivity(
			`was Edited`,
			{ id: existingAssetObject._id, name: newAssetName },
			"assets",
			reqUserId
		);
		await ActivityManager.createActivity(activityData, businessUnit);
	} catch (err) {
		throw err;
	}
}

async function handleNotificationForAssetDelete(reqAssetObj, reqUserId) {
	try {
		const sender = await getUserTypeAndNameUsingUserId(reqUserId);
		await sendNotification(
			"delete",
			`has been deleted by ${sender.name}`,
			reqAssetObj._id,
			reqAssetObj.generalDetails.name,
			reqAssetObj.generalDetails.department,
			reqUserId,
			reqAssetObj.generalDetails.businessUnit
		);
	} catch (err) {
		throw err;
	}
}

async function handleActivityForAssetDelete(reqAssetObj, reqUserId, businessUnit) {
	try {
		const activityData = dataConstructor.constructActivity(
			`was Deleted`,
			{ id: reqAssetObj._id, name: reqAssetObj.generalDetails.name },
			"assets",
			reqUserId
		);
		await ActivityManager.createActivity(activityData, businessUnit);
	} catch (err) {
		throw err;
	}
}

async function handleActivityForStatusChange(
	reqAssetObj,
	reqAssetUpdateObject,
	reqUserId,
	businessUnit
) {
	try {
		if (reqAssetUpdateObject.status.toLowerCase() === "decommissioned") {
			const activityData = dataConstructor.constructActivity(
				`was Decommissioned`,
				{ id: reqAssetObj._id, name: reqAssetObj.generalDetails.name },
				"assets",
				reqUserId
			);
			await ActivityManager.createActivity(activityData, businessUnit);
		}
		const activityData = dataConstructor.constructActivity(
			`status was changed from ${reqAssetObj.status} to ${reqAssetUpdateObject.status}`,
			{ id: reqAssetObj._id, name: reqAssetObj.generalDetails.name },
			"assets",
			reqUserId
		);
		await ActivityManager.createActivity(activityData, businessUnit);
	} catch (err) {
		throw err;
	}
}

async function handleNotificationForMultipleDelete(assetsToBeDeleted, reqUserId) {
	try {
		for (let assetToBeDeleted of assetsToBeDeleted) {
			const sender = await getUserTypeAndNameUsingUserId(reqUserId);
			await sendNotification(
				"delete",
				`has been deleted by ${sender.name}`,
				assetToBeDeleted._id,
				assetToBeDeleted.generalDetails.name,
				assetToBeDeleted.generalDetails.department,
				reqUserId,
				assetToBeDeleted.generalDetails.businessUnit
			);
		}
	}
	catch (err) {
		console.log("err", err)
		throw err;
	}
}

async function handleActivityForMultipleAssetDelete(assetsToBeDeleted, reqUserId, businessUnit) {
	try {
		for (let assetToBeDeleted of assetsToBeDeleted) {
			const activityData = dataConstructor.constructActivity(
				`was Deleted`,
				{ id: assetToBeDeleted._id, name: assetToBeDeleted.generalDetails.name },
				"assets",
				reqUserId
			);
			await ActivityManager.createActivity(activityData, businessUnit);
		}
	} catch (err) {
		throw err;
	}
}
