const { AssetCategory } = require("../../../models/mongoDB/assetManagement/assetCategory_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = AssetCategory;
const mongoose = require("mongoose");

async function createAssetCategory(createObj) {
    try {
        const datum = await mongoDbManager.insertOne(Model, createObj);
        return { id: datum._id };
    } catch (error) {
        throw error;
    }
}

async function createAssetCategories(createObj) {
    try {
        const data = await mongoDbManager.insertMany(Model, createObj);
        return multipleCreateResponseObject(data);
    } catch (error) {
        throw error;
    }
}

async function updateAssetCategory(id, updateObj) {
    try {
        const query = {
            _id: id,
            isDeleted: false,
        };
        const datum = await mongoDbManager.updateOne(Model, query, updateObj);
        return datum;
    } catch (error) {
        throw error;
    }
}

async function deleteAssetCategories(ids) {
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

async function updateAssetCategories(updateObjects) {
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

const returnInvalidAssetCategoryIds = async (ids) => {
    try {
        let invalidAssetCategoryIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

        if (invalidAssetCategoryIds.length > 0) {
            return invalidAssetCategoryIds;
        }

        const query = {
            _id: { $in: ids },
            isDeleted: false
        };

        const existingAssetCategories = await mongoDbManager.findManyWithPopulate(
            Model,
            query,
            null,
            null,
            null,
            "_id",
            []
        );

        const existingAssetCategoryIds = existingAssetCategories.map((assetCategory) => assetCategory._id.toString());

        invalidAssetCategoryIds.push(...ids.filter((id) => !existingAssetCategoryIds.includes(id)));

        return Array.from(new Set(invalidAssetCategoryIds));
    } catch (error) {
        throw error;
    }
};

const getAssetCategories = async (reqData) => {
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

        const selectFields = ["name"];

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



async function getAssetCategory(assetCategoryId, reqData) {

    try {
        const queryObj = queryBuilder(reqData);
        const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
        const populateFields = ["personalProtectiveEquipments", "businessUnit"];

        const selectFields = ["name", "defaultDocumentNames", "personalProtectiveEquipments", "businessUnit"];
        assetCategoryId = new mongoose.Types.ObjectId(assetCategoryId);
        let datum = await mongoDbManager.buildSingleAggregationPipeline(
            Model,
            assetCategoryId,
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

async function checkExistingAssetCategory(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
        }
        const query = { _id: id, isDeleted: false };
        const existingAssetCategory = await mongoDbManager.findOne(Model, query);

        return existingAssetCategory;
    } catch (error) {
        throw error;
    }
}







module.exports = {
    createAssetCategory,
    createAssetCategories,
    updateAssetCategory,
    updateAssetCategories,
    deleteAssetCategories,
    returnInvalidAssetCategoryIds,
    getAssetCategories,
    getAssetCategory,
    checkExistingAssetCategory
};



function multipleCreateResponseObject(data) {
    const ids = data.map((result) => result._id);
    return { ids: ids };
}


function fieldMappings() {
    return {
        personalProtectiveEquipments: {
            localField: "personalProtectiveEquipments",
            collection: "personalProtectiveEquipments",
            fieldsToInclude: ["name", "id", "image"], // Example fields to include
            isArray: true, // Indicate this should always be an array
            subFields: [
                {
                    localField: "image",
                    collection: "files",
                    fieldsToInclude: ["id", "name", "extension", "contentType", "size", "storageLocation", "moduleName", "moduleId"],
                    isArray: false,
                },
            ],
        },
        businessUnit: {
            localField: "businessUnit",
            collection: "businessUnits",
            fieldsToInclude: ["name", "id"], // Example fields to include
            isArray: false // Indicate this should not be forced into an array
        },
        updatedBy: {
            localField: "updatedBy",
            collection: "users",
            fieldsToInclude: ["name", "email", "id"], // Example fields to include
            isArray: false
        },
        createdBy: {
            localField: "createdBy",
            collection: "users",
            fieldsToInclude: ["name", "email", "id"], // Example fields to include
            isArray: false
        },
    };
}

function queryBuilder(reqData) {
    const query = {
        isDeleted: false,
        ...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
        ...(reqData.businessUnits && { businessUnit: { $in: reqData.businessUnits } }),
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
