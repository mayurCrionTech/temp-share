const personalProtectiveEquipmentManager = require("../../managers/internalManagers/assetManagement/personalProtectiveEquipment_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");

const createPersonalProtectiveEquipment = async (req, res) => {
    try {
        const personalProtectiveEquipmentCreateObject = req.personalProtectiveEquipmentCreateObject
        const createdPersonalProtectiveEquipment = await personalProtectiveEquipmentManager.createPersonalProtectiveEquipment(personalProtectiveEquipmentCreateObject);
        if (personalProtectiveEquipmentCreateObject.image) {
            await fileManager.updateFilePath(null, personalProtectiveEquipmentCreateObject.image, "personalProtectiveEquipments", createdPersonalProtectiveEquipment.id, req.userId);
        }
        const message = "PersonalProtectiveEquipment created successfully";
        return apiResponseHandler.successResponse(res, message, 201, createdPersonalProtectiveEquipment);
    } catch (error) {
        console.log("Some error happened while creating personalProtectiveEquipment", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const updatePersonalProtectiveEquipment = async (req, res) => {
    try {
        const updatedPersonalProtectiveEquipment = await personalProtectiveEquipmentManager.updatePersonalProtectiveEquipment(req.personalProtectiveEquipment, req.personalProtectiveEquipmentUpdateObject);
        return apiResponseHandler.successResponse(res, "PersonalProtectiveEquipment updated successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while updating personalProtectiveEquipment", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const bulkDeletePersonalProtectiveEquipments = async (req, res) => {
    const { personalProtectiveEquipmentsToDelete } = req.body;

    try {
        await personalProtectiveEquipmentManager.deletePersonalProtectiveEquipments(personalProtectiveEquipmentsToDelete);
        return apiResponseHandler.successResponse(res, "PersonalProtectiveEquipments deleted successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while deleting personalProtectiveEquipments", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchPersonalProtectiveEquipments = async (req, res) => {
    try {
        const reqData = req.query;
        reqData.asset = req.params.asset;
        const getPersonalProtectiveEquipments = await personalProtectiveEquipmentManager.getPersonalProtectiveEquipments(reqData);
        if (getPersonalProtectiveEquipments.data) {
            for (let i = 0; i < getPersonalProtectiveEquipments.data.length; i++) {
                getPersonalProtectiveEquipments.data[i].image = await fileManager.transformFileObj(
                    getPersonalProtectiveEquipments.data[i].image,
                    "download",
                    req.get("host"),
                    req.protocol
                );
                delete getPersonalProtectiveEquipments.data[i].images;
            }
        }
        return apiResponseHandler.successResponse(res, "PersonalProtectiveEquipments fetched successfully", 200, getPersonalProtectiveEquipments);
    } catch (error) {
        console.log("Some error happened while fetching personalProtectiveEquipments", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchPersonalProtectiveEquipment = async (req, res) => {

    try {
        const reqQuery = req.query;
        const personalProtectiveEquipmentId = req.personalProtectiveEquipmentObj._id;
        const getPersonalProtectiveEquipment = await personalProtectiveEquipmentManager.getPersonalProtectiveEquipment(personalProtectiveEquipmentId, reqQuery);
        if (!getPersonalProtectiveEquipment) {
            return apiResponseHandler.errorResponse(null, req, res, "PersonalProtectiveEquipment not found", 404, null);
        }
        if (getPersonalProtectiveEquipment.image) {
            getPersonalProtectiveEquipment.image = await fileManager.transformFileObj(
                getPersonalProtectiveEquipment.image,
                "download",
                req.get("host"),
                req.protocol
            );
        }
        const message = "PersonalProtectiveEquipment Fetched Successfully";
        return apiResponseHandler.successResponse(res, message, 200, getPersonalProtectiveEquipment);
    } catch (error) {
        console.log("Some error happened while fetching PersonalProtectiveEquipment", error.message);
        return apiResponseHandler.errorResponse(error, req, res, error.message || "Some internal server error", 500);
    }
};







module.exports = {
    createPersonalProtectiveEquipment,
    updatePersonalProtectiveEquipment,
    bulkDeletePersonalProtectiveEquipments,
    fetchPersonalProtectiveEquipments,
    fetchPersonalProtectiveEquipment,
};
