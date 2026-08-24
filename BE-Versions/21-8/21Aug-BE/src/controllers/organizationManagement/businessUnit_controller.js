/**
 * This is the controller for the BusinessUnit resource
 */

const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager");
/**
 * Create a BusinessUnit
 *
 */

exports.createBusinessUnit = async (req, res) => {
    try {
        const businessUnitObject = createBusinessUnitObject(req);

        const businessUnit = await businessUnitManager.createBusinessUnit(businessUnitObject);

        const message = "BusinessUnit created successfully";

        return apiResponseHandler.successResponse(res, message, 201, businessUnit);
    } catch (error) {
        console.log("Some error happened while creating businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
};


/**
 * Get all BusinessUnits
 *
 */

exports.getAllBusinessUnits = async (req, res) => {
    try {
        const requestBU = req.businessUnit ? req.businessUnit : null;
        const businessUnits = await businessUnitManager.getAllBusinessUnits(req.query, requestBU);

        const message = "BusinessUnits fetched successfully";

        return apiResponseHandler.successResponse(res, message, 200, businessUnits);
    } catch (error) {
        console.log("Some error happened while fetching businessUnits", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

/**
 * Get a BusinessUnit
 *
 */

exports.getBusinessUnit = async (req, res) => {

    try {

        const businessUnit = await businessUnitManager.getBusinessUnit(req.params.businessUnit, req.query.selectFields || "", req.query.populateFields || "");

        if (!businessUnit) {
            return apiResponseHandler.errorResponse(null, req, res, "BusinessUnit not found", 404);
        }

        const message = "BusinessUnit fetched successfully";

        return apiResponseHandler.successResponse(res, message, 200, businessUnit);
    } catch (error) {
        console.log("Some error happened while fetching businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

// /**
//  * Enable a BusinessUnit
//  *
//  */

exports.enableBusinessUnit = async (req, res) => {
    try {
        await businessUnitManager.enableBusinessUnit(req.params.businessUnit);

        const message = "BusinessUnit enabled successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while enabling businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

// /**
//  * Disable a BusinessUnit
//  *
//  */

exports.disableBusinessUnit = async (req, res) => {
    try {
        await businessUnitManager.disableBusinessUnit(req.params.businessUnit);

        const message = "BusinessUnit disabled successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while disabling businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

//     /**
//      * Enable BusinessUnits
//      *
//      */

exports.enableBusinessUnits = async (req, res) => {
    try {
        await businessUnitManager.enableBusinessUnits(req.body.businessUnits);

        const message = "BusinessUnits enabled successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while enabling businessUnits", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

//     /**
//      * Disable BusinessUnits
//      *
//      */

exports.disableBusinessUnits = async (req, res) => {
    try {
        await businessUnitManager.disableBusinessUnits(req.body.businessUnits);

        const message = "BusinessUnits disabled successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while disabling businessUnits", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}


//     /**
//      * Delete a BusinessUnit
//      *
//      */

exports.deleteBusinessUnit = async (req, res) => {
    try {
        await businessUnitManager.deleteBusinessUnit(req.params.businessUnit);

        const message = "BusinessUnit deleted successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while deleting businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

//     /**
//      * Delete BusinessUnits
//      *
//      */

exports.deleteBusinessUnits = async (req, res) => {
    try {
        await businessUnitManager.deleteBusinessUnits(req.body.businessUnits);

        const message = "BusinessUnits deleted successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while deleting businessUnits", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}

//     /**
//      * Update a BusinessUnit
//      *
//      */

exports.updateBusinessUnit = async (req, res) => {
    try {
        const businessUnitObject = updateBusinessUnitObject(req);

        await businessUnitManager.updateBusinessUnit(req.params.businessUnit, businessUnitObject);

        const message = "BusinessUnit updated successfully";

        return apiResponseHandler.successResponse(res, message, 200, null);
    } catch (error) {
        console.log("Some error happened while updating businessUnit", error.message);
        return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500);
    }
}










const createBusinessUnitObject = (req) => {
    return {
        name: req.body.name,
        shortName: req.body.shortName,
        isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
        organization: req.organization,
        createdBy: req.userId,
        updatedBy: req.userId
    };
};

const updateBusinessUnitObject = (req) => {
    const businessUnitObject = {
        updatedBy: req.userId
    };
    if (req.body.name) businessUnitObject.name = req.body.name;
    if (req.body.shortName) businessUnitObject.shortName = req.body.shortName;
    if (req.body.isEnabled !== undefined) businessUnitObject.isEnabled = req.body.isEnabled;

    return businessUnitObject;
};


