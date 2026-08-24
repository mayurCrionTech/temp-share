const assetDocumentManager = require("../../managers/internalManagers/assetManagement/assetDocument_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const { assetDocumentConstant } = require("../../models/mongoDB/assetManagement/assetDocument_model"); // Assuming you have this file for constants
const assetDocumentConstants = assetDocumentConstant;

const createAssetDocument = async (req, res) => {
	try {
		const assetDocumentCreateObject = req.assetDocumentCreateObject;
		const createdAssetDocument = await assetDocumentManager.createAssetDocument(assetDocumentCreateObject);
		const message = "AssetDocument created successfully";
		return apiResponseHandler.successResponse(res, message, 201, createdAssetDocument);
	} catch (error) {
		console.log("Some error happened while creating assetDocument", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const updateAssetDocument = async (req, res) => {
	try {
		const updatedAssetDocument = await assetDocumentManager.updateAssetDocument(
			req.assetDocument,
			req.assetDocumentUpdateObject,
			req.assetDocumentObj
		);
		return apiResponseHandler.successResponse(res, "AssetDocument updated successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while updating assetDocument", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const bulkDeleteAssetDocuments = async (req, res) => {
	const { ids } = req.body;

	try {
		await assetDocumentManager.deleteAssetDocuments(ids);
		return apiResponseHandler.successResponse(res, "AssetDocuments deleted successfully", 200, null);
	} catch (error) {
		console.log("Some error happened while deleting assetDocuments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchAssetDocuments = async (req, res) => {
	try {
		let reqData = req.query;
		reqData.asset = req.query.assets;
		const getAssetDocuments = await assetDocumentManager.getAssetDocuments(reqData);
		if (getAssetDocuments.data) {
			for (let i = 0; i < getAssetDocuments.data.length; i++) {
				getAssetDocuments.data[i].file = await fileManager.transformFileObj(
					getAssetDocuments.data[i].file,
					"download",
					req.get("host"),
					req.protocol
				);
			}
		}
		return apiResponseHandler.successResponse(res, "AssetDocuments fetched successfully", 200, getAssetDocuments);
	} catch (error) {
		console.log("Some error happened while fetching assetDocuments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
	}
};

const fetchAssetDocument = async (req, res) => {
	try {
		const reqQuery = req.query;
		const assetDocumentId = req.assetDocumentObj._id;
		const getAssetDocument = await assetDocumentManager.getAssetDocument(assetDocumentId, reqQuery);
		if (!getAssetDocument) {
			return apiResponseHandler.errorResponse(null, req, res, "AssetDocument not found", 404, null);
		}
		if (getAssetDocument.file) {
			getAssetDocument.file = await fileManager.transformFileObj(
				getAssetDocument.file,
				"download",
				req.get("host"),
				req.protocol
			);
		}
		const message = "AssetDocument Fetched Successfully";
		return apiResponseHandler.successResponse(res, message, 200, getAssetDocument);
	} catch (error) {
		console.log("Some error happened while fetching AssetDocument", error.message);
		return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
	}
};

const enums = async (req, res) => {
	const { category, subcategory, type, subType } = req.params;

	// Helper function to get only the top-level string values
	const getTopLevelStrings = (obj) => {
		return Object.values(obj).filter((value) => typeof value === "string");
	};

	try {
		const assetConstantsData = assetDocumentConstants;

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

module.exports = {
	createAssetDocument,
	updateAssetDocument,
	bulkDeleteAssetDocuments,
	fetchAssetDocuments,
	fetchAssetDocument,
	enums,
};
