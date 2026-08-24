const { AssetDocument } = require("../../../models/mongoDB/assetManagement/assetDocument_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = AssetDocument;
const mongoose = require("mongoose");
const fileManager = require("../fileSystem/fileSystem_manager");

async function createAssetDocument(createObj) {
    try {
        const datum = await mongoDbManager.insertOne(Model, createObj);
        if (createObj.file) {
            await fileManager.updateFilePath(
                null,
                createObj.file,
                "assetDocuments",
                datum.id,
                createObj.createdBy
            );
        }
        return { id: datum._id };
    } catch (error) {
        throw error;
    }
}

async function createAssetDocuments(createObj) {
    try {
        const data = await mongoDbManager.insertMany(Model, createObj);
        return multipleCreateResponseObject(data);
    } catch (error) {
        throw error;
    }
}

async function updateAssetDocument(id, updateObj, existingObj) {
    try {
        const query = {
            _id: id,
            isDeleted: false,
        };
        const datum = await mongoDbManager.updateOne(Model, query, updateObj);
       if (datum) {
         if (updateObj.file) {
             await fileManager.updateFilePath(
                 null,
                 updateObj.file,
                 "assetDocuments",
                 id,
                 updateObj.updatedBy
             );
         }
           if (updateObj.file && existingObj.file) {
             if (updateObj.file !== existingObj.file) {
                 await fileManager.moveToRecycleBin(null, existingObj.file, updateObj.updatedBy);
             }
         }
       }
        return datum;
    } catch (error) {
        throw error;
    }
}

async function deleteAssetDocuments(ids) {
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

async function updateAssetDocuments(updateObjects) {
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

const returnInvalidAssetDocumentIds = async (ids) => {
    try {
        let invalidAssetDocumentIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

        if (invalidAssetDocumentIds.length > 0) {
            return invalidAssetDocumentIds;
        }

        const query = {
            _id: { $in: ids },
            isDeleted: false
        };

        const existingAssetDocuments = await mongoDbManager.findManyWithPopulate(
            Model,
            query,
            null,
            null,
            null,
            "_id",
            []
        );

        const existingAssetDocumentIds = existingAssetDocuments.map((assetDocument) => assetDocument._id.toString());

        invalidAssetDocumentIds.push(...ids.filter((id) => !existingAssetDocumentIds.includes(id)));

        return Array.from(new Set(invalidAssetDocumentIds));
    } catch (error) {
        throw error;
    }
};

const getAssetDocuments = async (reqData) => {
    try {
        const queryObj = queryBuilder(reqData);
        console.log(queryObj.query,"queryObj")
        const fieldMapping = fieldMappings();
        const countData = await mongoDbManager.count(Model, queryObj.query);

        console.log(queryObj, "QueryObj",countData)
	if (queryObj.page === null) {
			queryObj.page = 1; // Set default page to 1 if not provided
		}
		if (queryObj.limit === null && !queryObj.listAll) {
			queryObj.limit = 200; // Set default limit to 200 if not provided, unless listing all
		}

		// If queryObj.listAll is true, override limit and page to get all records
		if (queryObj.listAll === true) {
			queryObj.limit = countData; // Set limit to the total number of records
			queryObj.page = 1; // Page is irrelevant when fetching all records, but keep it 1
		}

		if (queryObj.limit === 0 && queryObj.page > 1) {
			return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
		}


        const populateFields = ["file","asset"];
        // CR0001
        // const selectFields = ["name", "number", "type", "revisionNumber", "status", "asset", "file"];

        const selectFields = ["name", "number", "type","typeId", "revisionNumber", "status","statusId", "asset", "file"];

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
         console.log(data,"data")

        const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

        return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
    } catch (error) {
        throw error;
    }
};



async function getAssetDocument(assetDocumentId, reqData) {

    try {
        console.log(reqData,"reqData")
        const queryObj = queryBuilder(reqData);
        console.log(queryObj,"queryObj")
        const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
        const populateFields = ["file", "asset"];
        // CR0001
        // const selectFields = ["name", "number", "type", "revisionNumber", "status", "asset", "file"];
        const selectFields = ["name", "number", "type","typeId", "revisionNumber", "status","statusId", "asset", "file"];

        assetDocumentId = new mongoose.Types.ObjectId(assetDocumentId);
        console.log(assetDocumentId,"assetDocumentId")
        let datum = await mongoDbManager.buildSingleAggregationPipeline(
            Model,
            assetDocumentId,
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

async function checkExistingAssetDocument(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return false;
        }
        const query = { _id: id, isDeleted: false };
        const existingAssetDocument = await mongoDbManager.findOne(Model, query);
        
        return existingAssetDocument;
    } catch (error) {
        throw error;
    }
}

async function checkAssetDocumentByField(field, value, businessUnit) {
    try {
        let query = {}

        if (field == "name" || field == "number") {
					query = { [field]: { $regex: `^${value}$`, $options: "i" }, isDeleted: false };
				} else {
					query = { [field]: value, isDeleted: false };
				}
        if (businessUnit) {
            query.businessUnit = businessUnit;
        }
        const existingAssetDocument = await mongoDbManager.findOne(Model, query);
        return existingAssetDocument;
    } catch (error) {
        throw error;
    }
}
async function checkExistingDocumentByAssetId(assetId){
    try{
        let assetParameter;
        if(assetId){
            assetParameter = await mongoDbManager.findOne(AssetDocument,{asset:assetId, isDeleted:false})
        }
        return assetParameter
    }catch(error){
        throw error;
    }
}




module.exports = {
    createAssetDocument,
    createAssetDocuments,
    updateAssetDocument,
    updateAssetDocuments,
    deleteAssetDocuments,
    returnInvalidAssetDocumentIds,
    getAssetDocuments,
    getAssetDocument,
    checkExistingAssetDocument,
    checkAssetDocumentByField,
    checkExistingDocumentByAssetId
};



function multipleCreateResponseObject(data) {
    const ids = data.map((result) => result._id);
    return { ids: ids };
}


function fieldMappings() {
    return {
			businessUnit: {
				localField: "businessUnit",
				collection: "businessUnits",
				fieldsToInclude: ["name", "id"] // Example fields to include
			},
			file: {
				localField: "file",
				collection: "files",
				fieldsToInclude: [
					"_id",
					"name",
					"extension",
					"contentType",
					"size",
					"storageLocation",
					"moduleName",
					"moduleId"
				] // Example fields to include
			},
			asset: {
				localField: "asset",
				collection: "assets",
                fieldsToInclude: ["generalDetails", "id"], // Example fields to include
			},
			updatedBy: {
				localField: "updatedBy",
				collection: "users",
				fieldsToInclude: ["name", "email", "id"] // Example fields to include
			},
			createdBy: {
				localField: "createdBy",
				collection: "users",
				fieldsToInclude: ["name", "email", "id"] // Example fields to include
			}
		};
}

// function queryBuilder(reqData) {
//     const query = {
// 			isDeleted: false,
// 			...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
// 			...(reqData.number && { number: { $regex: reqData.number, $options: "i" } }),
// 			...(reqData.assets && { asset: { $in: [reqData.assets] } }),
// 			...(reqData.revisionNumber && { revisionNumber: { $regex: reqData.revisionNumber, $options: "i" } }),
// 			...(reqData.types && { type: { $in: [reqData.types] } }),
// 			...(reqData.statuses && { status: { $in: [reqData.statuses] } }),
// 			...(reqData.businessUnits && { businessUnit: { $in: [reqData.businessUnits] } }),
// 			...(reqData.createdAt && { createdAt: reqData.createdAt }),
// 			...(reqData.updatedAt && { updatedAt: reqData.updatedAt })
// 		};

//     const page = reqData.page ? parseInt(reqData.page, 10) : null;
//     const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;
//     const skip = page && limit ? (page - 1) * limit : 0;
//     const sort = reqData.sort || "createdAt";
//     const order = reqData.order === "asc" ? 1 : -1;
//     const sortOrder = { [sort]: order };

//     return {
//         query,
//         skip,
//         page,
//         limit,
//         sortOrder
//     };
// }

/* this is updated since the asset document is not fetching */
const { Types } = require("mongoose");

const toObjectId = (id) => {
    if (!id || !Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new Types.ObjectId(id);
};

const toObjectIdArray = (value) => {
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(toObjectId);
};

function queryBuilder(reqData) {
    const query = {
        isDeleted: false,
        ...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
        ...(reqData.number && { number: { $regex: reqData.number, $options: "i" } }),
        ...(reqData.assets && { asset: { $in: toObjectIdArray(reqData.assets) } }),
        ...(reqData.revisionNumber && { revisionNumber: { $regex: reqData.revisionNumber, $options: "i" } }),
        ...(reqData.types && { type: { $in: toObjectIdArray(reqData.types) } }),
        ...(reqData.statuses && { status: { $in: toObjectIdArray(reqData.statuses) } }),
        ...(reqData.businessUnits && { businessUnit: { $in: toObjectIdArray(reqData.businessUnits) } }),
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