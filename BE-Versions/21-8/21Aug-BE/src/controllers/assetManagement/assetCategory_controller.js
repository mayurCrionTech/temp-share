const assetCategoryManager = require("../../managers/internalManagers/assetManagement/assetCategory_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");
const {AssetDocument}=require("../../models/mongoDB/assetManagement/assetDocument_model")


const createAssetCategory = async (req, res) => {
    try {
        const assetCategoryCreateObject = req.assetCategoryCreateObject;
        const createdAssetCategory = await assetCategoryManager.createAssetCategory(assetCategoryCreateObject);
        if (assetCategoryCreateObject.image) {
            await fileManager.updateFilePath(null, assetCategoryCreateObject.image, "assetCategories", createdAssetCategory.id, req.userId);
        }
        const message = "AssetCategory created successfully";
        return apiResponseHandler.successResponse(res, message, 201, createdAssetCategory);
    } catch (error) {
        console.log("Some error happened while creating assetCategory", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const updateAssetCategory = async (req, res) => {
    try {
        const updatedAssetCategory = await assetCategoryManager.updateAssetCategory(req.assetCategory, req.assetCategoryUpdateObject);
        return apiResponseHandler.successResponse(res, "AssetCategory updated successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while updating assetCategory", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const bulkDeleteAssetCategories = async (req, res) => {
    const { assetCategoriesToDelete } = req.body;

    try {
        await assetCategoryManager.deleteAssetCategories(assetCategoriesToDelete);
        return apiResponseHandler.successResponse(res, "AssetCategories deleted successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while deleting assetCategories", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchAssetCategories = async (req, res) => {
    try {
        const reqData = req.query;
        const getAssetCategories = await assetCategoryManager.getAssetCategories(reqData);
        return apiResponseHandler.successResponse(res, "AssetCategories fetched successfully", 200, getAssetCategories);
    } catch (error) {
        console.log("Some error happened while fetching assetCategories", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchAssetCategory = async (req, res) => {
    try {
        const reqQuery = req.query;
        const assetCategoryId = req.assetCategoryObj._id;
        const getAssetCategory = await assetCategoryManager.getAssetCategory(assetCategoryId, reqQuery);
        if (!getAssetCategory) {
            return apiResponseHandler.errorResponse(null, req, res, "AssetCategory not found", 404, null);
        }

        // for removing the default document
        const originalDefaultDocs = ["warrantyDocument", "Derin"];
        if (getAssetCategory.defaultDocumentNames?.length > 0) {
            getAssetCategory.defaultDocumentNames = getAssetCategory.defaultDocumentNames.filter(
                doc => !originalDefaultDocs.includes(doc)
            );
        }

        if (
            getAssetCategory.personalProtectiveEquipments &&
            getAssetCategory.personalProtectiveEquipments.length > 0
        ) {

            //perform a loop over the personalProtectiveEquipments
            for (let i = 0; i < getAssetCategory.personalProtectiveEquipments.length; i++) {
                getAssetCategory.personalProtectiveEquipments[i].image = await fileManager.transformFileObj(
                    getAssetCategory.personalProtectiveEquipments[i].image,
                    "download",
                    req.get("host"),
                    req.protocol
                );


            }





        }

        // for removing default documents
        const userDocuments = await AssetDocument.find({
            asset: assetCategoryId,
            isDeleted: false
        }).populate("file");
        getAssetCategory.userDocuments = userDocuments;
        
        const message = "AssetCategory fetched successfully";
        return apiResponseHandler.successResponse(res, message, 200, getAssetCategory);
    } catch (error) {
        console.log("Some error happened while fetching assetCategory", error.message);
        return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
    }
};

module.exports = {
    createAssetCategory,
    updateAssetCategory,
    bulkDeleteAssetCategories,
    fetchAssetCategories,
    fetchAssetCategory,
};

