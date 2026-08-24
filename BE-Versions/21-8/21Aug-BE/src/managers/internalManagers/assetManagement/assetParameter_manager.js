const { AssetParameters } = require("../../../models/mongoDB/assetManagement/assetParameter_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = AssetParameters;
const mongoose = require("mongoose");
const {LiveData} = require("../../../models/mongoDB/liveDataManagement/liveData_model");
const {TagLive}=require("../../../models/mongoDB/tags/tagsModel")

// async function createAssetParameter(createObj,businessUnit,asset) {	
// 	try {
// 		const datum = await mongoDbManager.insertOne(Model, createObj);
// 		return { id: datum._id };
// 	} catch (error) {
// 		throw error;
// 	}
// }

// Just for DICV purpose this is commented . This is working code 

// async function createAssetParameter(tagId,businessUnit,asset) {	
// 	try {
		
// 		const datum = await mongoDbManager.insertOne(Model, {tagId,businessUnit,asset });
// 		await mongoDbManager.updateOne(LiveData,{_id:tagId},{asset:asset})
// 		// return
// 		return { id: datum._id };
// 	} catch (error) {
// 		throw error;
// 	}
// }

// DICV

async function createAssetParameter(tagId, businessUnit, asset) {
  try {

    // 1. Get tag from tag_mocks
    const tag = await TagLive.findById(tagId).lean();
	// console.log("TAG DATA:", tag);

    if (!tag) {
      throw new Error("Tag not found");
    }

    // 2. Save into assetParameters WITH fields
    const datum = await mongoDbManager.insertOne(Model, {
      tagId,
      businessUnit,
      asset,
      name: tag.tagname,              // ADD
      value: String(tag.latestValue), // ADD
      unit: tag.unit 
    });

	await TagLive.findByIdAndUpdate(
      tagId,
      {
        $addToSet: { assetId: asset } // prevents duplicates
      },
      { new: true }
    );

    return { id: datum._id };

  } catch (error) {
    throw error;
  }
}



async function createAssetParameters(createObj) {
	try {
		const data = await mongoDbManager.insertMany(Model, createObj);
		return multipleCreateResponseObject(data);
	} catch (error) {
		throw error;
	}
}

// async function updateAssetParameter(id, updateObj) {
// 	try {
// 		const datum = await mongoDbManager.updateOne(Model, id, updateObj);
// 		return datum;
// 	} catch (error) {
// 		throw error;
// 	}
// }

// Just for DICV purpose this is commented . This is working code 

// async function updateAssetParameter(id, updateObj, asset, businessUnit) {
//   try {

//     const tagId = updateObj.tagId;
//     // 1 Find the current asset parameter
//     const assetParameter = await mongoDbManager.findOne(Model, { _id: id });
//     if (!assetParameter) throw new Error("Asset parameter not found");

//     const currentTagId = assetParameter.tagId;

//     //  If tag changed → unassign old tag & assign new one
//     if (tagId && tagId.toString() !== currentTagId?.toString()) {
//       // Unlink old tag from LiveData
//       if (currentTagId) {
//         await mongoDbManager.updateOne(
//           LiveData,
//           { _id: currentTagId },
//           { $set: { asset: null } }
//         );
//       }

//       // Link new tag to asset in LiveData
//       await mongoDbManager.updateOne(
//         LiveData,
//         { _id: tagId },
//         { $set: { asset: asset } }
//       );
//     }

//     // Update the asset parameter document (not insert)
//     const updateFields = {
//       ...updateObj,
//       businessUnit,
//       asset,
//     };

//     const result = await mongoDbManager.updateOne(
//       Model,
//       { _id: id },
//       { $set: updateFields }
//     );

//     //  Return updated ID
//     return { id, modifiedCount: result.modifiedCount || 1 };
//   } catch (error) {
//     console.error("Error in updateAssetParameter:", error);
//     throw error;
//   }
// }


// DICV
async function updateAssetParameter(id, updateObj, asset, businessUnit) {
  try {

    const tagId = updateObj.tagId;
    // 1 Find the current asset parameter
    const assetParameter = await mongoDbManager.findOne(Model, { _id: id });
    if (!assetParameter) throw new Error("Asset parameter not found");

    const currentTagId = assetParameter.tagId;

    //  If tag changed → unassign old tag & assign new one
    if (tagId && tagId.toString() !== currentTagId?.toString()) {
      // Unlink old tag from LiveData
      if (currentTagId) {
        await mongoDbManager.updateOne(
          TagLive,
          { _id: currentTagId },
          { $set: { asset: null } }
        );
      }

      // Link new tag to asset in LiveData
      await mongoDbManager.updateOne(
        TagLive,
        { _id: tagId },
        { $set: { asset: asset } }
      );
    }

    // Update the asset parameter document (not insert)
    const updateFields = {
      ...updateObj,
      businessUnit,
      asset,
    };

    const result = await mongoDbManager.updateOne(
      Model,
      { _id: id },
      { $set: updateFields }
    );

    //  Return updated ID
    return { id, modifiedCount: result.modifiedCount || 1 };
  } catch (error) {
    console.error("Error in updateAssetParameter:", error);
    throw error;
  }
}


// async function deleteAssetParameters(ids) {
// 	try {
// 		const deleteResults = await mongoDbManager.updateMany(
// 			Model,
// 			{ _id: { $in: ids } },
// 			{ $set: { isDeleted: true } }
// 		);
// 		return deleteResults;
// 	} catch (error) {
// 		throw error;
// 	}
// }

// Just for DICV purpose this is commented . This is working code 

// async function deleteAssetParameters(ids) {
// 	try {
// 		const paramsToDelete = await Model.find({ _id: { $in: ids } }).select("tagId");

//     const tagIds = paramsToDelete
//       .filter((p) => p.tagId)
//       .map((p) => p.tagId);

//     // Soft delete the asset parameters
//     const deleteResults = await mongoDbManager.updateMany(
//       Model,
//       { _id: { $in: ids } },
//       { $set: { isDeleted: true } }
//     );

//     //  Unlink tags in LiveData
//     if (tagIds.length > 0) {
//       await mongoDbManager.updateMany(
//         LiveData,
//         { _id: { $in: tagIds } },
//         { $set: { asset: null } }
//       );
//     }

// 		return deleteResults;
// 	} catch (error) {
// 		throw error;
// 	}
// }

// DICV

async function deleteAssetParameters(ids) {
	try {
		const paramsToDelete = await Model.find({ _id: { $in: ids } }).select("tagId");

    const tagIds = paramsToDelete
      .filter((p) => p.tagId)
      .map((p) => p.tagId);

    // Soft delete the asset parameters
    const deleteResults = await mongoDbManager.updateMany(
      Model,
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    //  Unlink tags in LiveData
    if (tagIds.length > 0) {
      await mongoDbManager.updateMany(
        TagLive,
        { _id: { $in: tagIds } },
        { $set: { asset: null } }
      );
    }

		return deleteResults;
	} catch (error) {
		throw error;
	}
}
async function updateAssetParameters(updateObjects) {
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

const returnInvalidParameterIds = async (ids, asset) => {
	try {
		let invalidParameterIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidParameterIds.length > 0) {
			return invalidParameterIds;
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false
		};

		if (asset) {
			query.asset = asset;
		}

		const existingParameters = await mongoDbManager.findManyWithPopulate(
			Model,
			query,
			null,
			null,
			null,
			"_id",
			[]
		);

		const existingParameterIds = existingParameters.map((parameter) => parameter._id.toString());

		invalidParameterIds.push(...ids.filter((id) => !existingParameterIds.includes(id)));

		return Array.from(new Set(invalidParameterIds));
	} catch (error) {
		throw error;
	}
};

// const getAssetParameters = async (reqData) => {
// 	try {
// 		const queryObj = queryBuilder(reqData);
// 		const fieldMapping = fieldMappings();
// 		const countData = await mongoDbManager.count(Model, queryObj.query);

// 		// Handle cases where either page or limit is not provided
// 		if (queryObj.page === null && queryObj.limit === null) {
// 			queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
// 			queryObj.page = 1; // Set page to 1 if no page is provided
// 		} else if (queryObj.page === null) {
// 			queryObj.page = 1; // Set default page to 1 if not provided
// 		} else if (queryObj.limit === null) {
// 			queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
// 		}

// 		if (queryObj.limit === 0 && queryObj.page > 1) {
// 			return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
// 		}

// 		const populateFields = [];

// 		const selectFields = ["name", "value", "unit", "isTrackingEnabled", "isComparable", "trackingStatus"];

// 		let data = await mongoDbManager.fetchAllAndPopulate(
// 			Model,
// 			queryObj.query,
// 			fieldMapping,
// 			queryObj.limit,
// 			queryObj.page,
// 			queryObj.sortOrder,
// 			populateFields,
// 			selectFields
// 		);

// 		if (data) {
// 			data = data.map((result) => {
// 				const { _id, ...rest } = result;
// 				return { ...rest, id: _id };
// 			});
// 		}

// 		const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);

// 		return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
// 	} catch (error) {
// 		throw error;
// 	}
// };

// const { LiveData } = require("../../../models/mongoDB/liveDataManagement/liveData_model");

const getAssetParameters = async (reqData) => {
  try {
    const queryObj = queryBuilder(reqData);
    const fieldMapping = fieldMappings();
    const countData = await mongoDbManager.count(Model, queryObj.query);

    // Handle pagination defaults
    if (queryObj.page === null && queryObj.limit === null) {
      queryObj.limit = countData || 1;
      queryObj.page = 1;
    } else if (queryObj.page === null) {
      queryObj.page = 1;
    } else if (queryObj.limit === null) {
      queryObj.limit = countData;
    }

    if (queryObj.limit === 0 && queryObj.page > 1) {
      return paginationHandler.paginationResObj(queryObj.page, 1, countData, []);
    }

    // Fetch parameters (no populate)
    let data = await mongoDbManager.fetchAllAndPopulate(
      Model,
      queryObj.query,
      fieldMapping,
      queryObj.limit,
      queryObj.page,
      queryObj.sortOrder
    );

    // Map live tag values
    if (data && data.length > 0) {
      const tagIds = data.filter(p => p.tagId).map(p => p.tagId);
      const liveTags = await LiveData.find({ _id: { $in: tagIds } })
        .select("tagName latestValue unit lastUpdated");
      const liveMap = Object.fromEntries(liveTags.map(t => [t._id.toString(), t]));

      data = data.map(param => {
        const { _id, ...rest } = param;
        const live = liveMap[param.tagId?.toString()];
        return {
          ...rest,
          id: _id,
          name: live?.tagName || rest.name,
          value: live?.latestValue ?? rest.value,
          unit: live?.unit || rest.unit,
          lastUpdated: live?.lastUpdated || null
        };
      });
    }

    const totalPages = countData === 0 ? 0 : queryObj.limit === 0 ? 1 : Math.ceil(countData / queryObj.limit);
    return paginationHandler.paginationResObj(queryObj.page, totalPages, countData, data);
  } catch (error) {
    throw error;
  }
};



async function getParameter(parameterId, reqData) {
	try {
		const queryObj = queryBuilder(reqData);
		const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
		const populateFields = ["asset"];

		const selectFields = ["name", "value", "unit", "asset","isTrackingEnabled", "isComparable", "trackingStatus"];

		parameterId = new mongoose.Types.ObjectId(parameterId);
		let datum = await mongoDbManager.buildSingleAggregationPipeline(
			Model,
			parameterId,
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

async function checkExistingParameterByAssetId(assetId){
	try{
		let assetParameter;
		if(assetId){
			assetParameter = await mongoDbManager.findOne(Model,{asset:assetId, isDeleted:false})
		}
		return assetParameter
	}catch(error){
		throw error;
	}
}


async function checkExistingParameterById(id){
	try{
		let assetParameter;
		if(id){
			assetParameter = await mongoDbManager.findOne(Model,{_id:id, isDeleted:false})
		}
		return assetParameter
	}catch(error){
		throw error;
	}
}

async function checkExistingParameterByNameAndAsset(field, name, asset, businessUnit) {
    try {
        let query = {isDeleted : false}
		if( field == "name"){
			query.asset = asset,
			query.name = name
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

async function fetchLiveDataTags(reqData) {
	const { tag, page = 1, limit = 10 } = reqData; // default page 1, limit 10

  try {
	const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	const regex = new RegExp(escapeRegex(tag), 'i');

	// Build the query
	const query = {
	asset: null,
	tagName: { $regex: regex },
	};

	// Optional: projection if you only need some fields
	const projection = { tagName: 1, _id: 1 ,latestValue: 1, unit: 1};

	// Optional: sort by tagName ascending
	const sort = { tagName: 1 };

	// Use your helper
	const liveTags = await mongoDbManager.findMany(
	LiveData,
	query,
	page,
	limit,
	sort,
	"asc",
	projection
	);


return liveTags;
  } catch (error) {
	throw error;
  }
}


module.exports = {
	createAssetParameter,
	createAssetParameters,
	updateAssetParameter,
	updateAssetParameters,
	deleteAssetParameters,
	returnInvalidParameterIds,
	getAssetParameters,
	getParameter,
	checkExistingParameterByAssetId,
	checkExistingParameterById,
	checkExistingParameterByNameAndAsset,
	fetchLiveDataTags
};



function multipleCreateResponseObject(data) {
	const ids = data.map((result) => result._id);
	return { ids: ids };
}


function fieldMappings() {
	return {
		businessUnit: {
			localField: "generalDetails.businessUnit",
			collection: "businessUnits",
			fieldsToInclude: ["name", "id"] // Example fields to include
		},
		asset: {
			localField: "asset",
			collection: "assets",
			fieldsToInclude: ["generalDetails.name", "generalDetails.number", "id"] // Example fields to include
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
		},
	};
}

function queryBuilder(reqData) {
	const query = {
		isDeleted: false,
		businessUnit : new mongoose.Types.ObjectId(reqData.businessUnit),
		...(reqData.name && { name: { $regex: reqData.name, $options: "i" } }),
		...(reqData.value && { value: { $regex: reqData.value, $options: "i" } }),
		...(reqData.unit && { unit: { $regex: reqData.unit, $options: "i" } }),
		...(reqData.trackingStatus && { trackingStatus: { $regex: reqData.trackingStatus, $options: "i" } }),
		...(reqData.isComparable && { isComparable: reqData.isComparable }),
		...(reqData.asset && { asset: new mongoose.Types.ObjectId(reqData.asset) }),
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
