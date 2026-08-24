const { Organizations } = require("../../../models/mongoDB/organizationManagement/organization_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = Organizations;
const mongoose = require("mongoose");

async function createOrganization(createObj) {	
    try {
        const datum = await mongoDbManager.insertOne(Model, createObj);
        return { id: datum._id };
    } catch (error) {
        throw error;
    }
}

async function createOrganizations(createObj) {
    try {
        const data = await mongoDbManager.insertMany(Model, createObj);
        return multipleCreateResponseObject(data);
    } catch (error) {
        throw error;
    }
}

async function updateOrganization(id, updateObj) {
    try {
        const datum = await mongoDbManager.updateOne(Model, {_id:id}, updateObj);
        return datum;
    } catch (error) {
        throw error;
    }
}

async function deleteOrganizations(ids) {
    try {
        const deleteResults = await mongoDbManager.updateMany(
            Model,
            { _id: { $in: ids } },
            { $set: { isDeleted: true } }
        );
        return deleteResults;
    } catch (error) {
        throw error;
    }
}

async function updateOrganizations(updateObjects) {
    try {
        const bulkUpdateOperations = updateObjects.map(({ id, updateObject }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: updateObject }
            }
        }));

        const result = await mongoDbManager.bulkWrite(Model, bulkUpdateOperations);
        return result;
    } catch (error) {
        throw error;
    }
}

const returnInvalidOrganizationIds = async (ids) => {
    try {
        let invalidOrganizationIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

        if (invalidOrganizationIds.length > 0) {
            return invalidOrganizationIds;
        }

        const query = {
            _id: { $in: ids },
            isDeleted: false
        };

        const existingParameters = await mongoDbManager.findManyWithPopulate(
            Model,
            query,
            null,
            null,
            null,
            "_id",
            []
        );

        const existingOrganizationIds = existingParameters.map((parameter) => parameter._id.toString());

        invalidOrganizationIds.push(...ids.filter((id) => !existingOrganizationIds.includes(id)));

        return Array.from(new Set(invalidOrganizationIds));
    } catch (error) {
        throw error;
    }
};

const getOrganizations = async (reqData) => {
    try {
        const queryObj = queryBuilder(reqData);
        const fieldMapping = fieldMappings();
        const countData = await mongoDbManager.count(Model, queryObj.query);

        // Handle cases where either page or limit is not provided
        if (queryObj.page === null && queryObj.limit === null) {
            queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
            queryObj.page = 1; // Set page to 1 if no page is provided
        } else if (queryObj.page === null) {
            queryObj.page = 1; // Set default page to 1 if not provided
        } else if (queryObj.limit === null) {
            queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
        }

        if (queryObj.limit === 0 && queryObj.page > 1) {
            return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
        }

        const populateFields = [];

        const selectFields = ["name", "isDomainRestricted", "allowedDomains", "isEnabled", "isDeleted"];

        let data = await mongoDbManager.fetchAllAndPopulate(
            Model,
            queryObj.query,
            fieldMapping,
            queryObj.limit,
            queryObj.page,
            queryObj.sortOrder,
            populateFields,
            selectFields
        );

        if (data) {
            data = data.map((result) => {
                const { _id, ...rest } = result;
                return { ...rest, id: _id };
            });
        }

        const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

        return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
    } catch (error) {
        throw error;
    }
};



async function getOrganization(organizationId, reqData) {
    try {
        const queryObj = queryBuilder(reqData);
        const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
        const populateFields = [];

        const selectFields = ["name", "isDomainRestricted", "allowedDomains", "isEnabled", "isDeleted"];

        organizationId = new mongoose.Types.ObjectId(organizationId);
        let datum = await mongoDbManager.buildSingleAggregationPipeline(
            Model,
            organizationId,
            queryObj.query,
            fieldMapping,
            populateFields,
            selectFields
        );
        if (datum) {
            const { _id, ...rest } = datum;
            return { ...rest, id: _id };
        } else return null;
    } catch (err) {
        throw err;
    }
}

async function checkExistingOrganizationById(id){
    try{
        let organization;
        if(id){
            organization = await mongoDbManager.findOne(Model,{_id:id, isDeleted:false})
        }
        return organization
    }catch(error){
        throw error;
    }
}

async function checkExistingOrganizationByName(field, name) {
    try {
        let query = {isDeleted : false}
        if( field == "name"){
            query.name = name
        }
        const existingOrganization = await mongoDbManager.findOne(Model, query);
        return existingOrganization;
    } catch (error) {
        throw error;
    }
}
  


module.exports = {
    createOrganization,
    createOrganizations,
    updateOrganization,
    updateOrganizations,
    deleteOrganizations,
    getOrganizations,
    getOrganization,
    checkExistingOrganizationById,
    checkExistingOrganizationByName,
    returnInvalidOrganizationIds
};



function multipleCreateResponseObject(data) {
    const ids = data.map((result) => result._id);
    return { ids: ids };
}


function fieldMappings() {
    return {
        updatedBy: {
            localField: "updatedBy",
            collection: "users",
            fieldsToInclude: ["name", "email", "id"] // Example fields to include
        },
        createdBy: {
            localField: "createdBy",
            collection: "users",
            fieldsToInclude: ["name", "email", "id"] // Example fields to include
        },
    };
}

function queryBuilder(reqData) {
    const query = {
        isDeleted: false,
        ...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
        ...(reqData.createdAt && { createdAt: reqData.createdAt }),
        ...(reqData.updatedAt && { updatedAt: reqData.updatedAt })
    };

    const page = reqData.page ? parseInt(reqData.page, 10) : null;
    const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
    const skip = page && limit ? (page - 1) * limit : 0;
    const sort = reqData.sort || "createdAt";
    const order = reqData.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };

    return {
        query,
        skip,
        page,
        limit,
        sortOrder
    };
}
