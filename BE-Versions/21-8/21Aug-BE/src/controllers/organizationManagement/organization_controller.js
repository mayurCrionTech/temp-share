const organizationManager = require("../../managers/internalManagers/organizationManagement/organization_manager");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");

const createOrganization = async (req, res) => {

    try {
        const createOrganization = await organizationManager.createOrganization(req.organizationCreateObject);
        const message = "Organization created successfully";
        return apiResponseHandler.successResponse(res, message, 201, createOrganization);
    } catch (error) {
        console.log("Some error happened while creating organization", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const createOrganizations = async (req, res) => {
    try {
        const data = await organizationManager.createOrganizations(req.organizationCreateObjects);
        console.log("data", data)
        return apiResponseHandler.successResponse(res, "Organizations created successfully", 201, data);
    } catch (error) {
        console.log("Some error happened while creating organizations", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

const updateOrganization = async (req, res) => {
    try {
        const { organization } = req.params;
        const updatedOrganization = await organizationManager.updateOrganization(organization, req.organizationUpdateObject);
        return apiResponseHandler.successResponse(res, "Organization updated successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while updating organization", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const bulkUpdateOrganizations = async (req, res) => {
    const { parametersToUpdate } = req.body;

    try {
        // Process deletions
        if (parametersToUpdate) {
            await organizationManager.deleteOrganizations(parametersToUpdate);
        }

        // Process updates
        await organizationManager.updateOrganizations(req.organizationUpdateObjects);

        return apiResponseHandler.successResponse(res, "Organizations updated successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while processing organizations", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const bulkDeleteOrganizations = async (req, res) => {
    const { organizationsToDelete } = req.body;

    try {
        await organizationManager.deleteOrganizations(organizationsToDelete);
        return apiResponseHandler.successResponse(res, "Organizations deleted successfully", 200, null);
    } catch (error) {
        console.log("Some error happened while deleting organizations", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};

const fetchOrganizations = async (req, res) => {
    try {
        const reqData = req.query;
        const data = await organizationManager.getOrganizations(reqData);
        return apiResponseHandler.successResponse(res, "Organizations fetched successfully", 200, data);
    } catch (error) {
        console.log("Some error happened while fetching organizations", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};


const fetchOrganization = async (req, res) => {
    try{
        const reqData = req.query;
        const organizationId = req.organizationObj._id;
        const data = await organizationManager.getOrganization(organizationId, reqData);
        return apiResponseHandler.successResponse(res, "Organization fetched successfully", 200, data);
    }catch(error){
        console.log(error)
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}






module.exports = {
    createOrganization,
    createOrganizations,
    updateOrganization,
    bulkUpdateOrganizations,
    bulkDeleteOrganizations,
    fetchOrganizations,
    fetchOrganization,
};
