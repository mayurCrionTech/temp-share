const { Assets } = require("../../../models/mongoDB/assetManagement/asset_model");
const masterAsset_model = require("../../../models/mongoDB/assetManagement/masterAsset_model");

const createMasterAsset = async (asset) => {
  const familyKey = asset.name;
  let fetchedAsset = await Assets.findById(asset.id);
  const modifiedAsset = {
    generalDetails: fetchedAsset.generalDetails,
    specifications: fetchedAsset.specifications,
  };
  // Insert new master record
  const newMaster = await masterAsset_model.create({
    familyKey,
    templateData: modifiedAsset,
    flag: 1,
  });

  // Set all previous masters to flag=0
  await masterAsset_model.updateMany(
    { familyKey: newMaster.familyKey, _id: { $ne: newMaster._id }, flag: 1 },
    { $set: { flag: 0 } }
  );

  return newMaster;
};
const updateMasterAsset = async (assetId,assetUpdateObject) => {

try {
    // Fetch the main asset
    const assetDetails = await Assets.findById(assetId);
    if (!assetDetails) throw new Error("Asset not found");

    const familyKey = assetDetails.generalDetails.name;


    // Prepare modified fields (only if present)
    const modifiedAsset = {};

    if (assetUpdateObject.generalDetails) {
      modifiedAsset.generalDetails = assetUpdateObject.generalDetails;
    }

    if (assetUpdateObject.specifications) {
      modifiedAsset.specifications = assetUpdateObject.specifications;
    }

    // Find the latest master for this family
    const latestMaster = await masterAsset_model.findOne({ familyKey, flag: 1 });

    if (latestMaster) {
      // Merge existing templateData with modifiedAsset
      latestMaster.templateData = {
        ...latestMaster.templateData,
        ...modifiedAsset
      };

      await latestMaster.save();
      return latestMaster;

    } else {
      // No master exists: create new master
      const newMaster = await masterAsset_model.create({
        familyKey,
        templateData: modifiedAsset,
        flag: 1
      });

      // Set previous masters flag=0 just in case
      await masterAsset_model.updateMany(
        { familyKey, _id: { $ne: newMaster._id }, flag: 1 },
        { $set: { flag: 0 } }
      );

      return newMaster;
    }

  } catch (error) {
    console.error("Error in updateMasterAsset:", error.message);
    throw error;
  }
};

const fetchMasterAssets = async (familyKey, assetNumber ,assetModel, assetMake, page = 1, limit = 10) => {
  // Escape regex safely
  const escapeRegex = (text) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const skip = (page - 1) * limit;

  // Build dynamic match object
  const matchObj = {};

  if (familyKey) {
    matchObj.familyKey = {
      $regex: new RegExp(escapeRegex(familyKey), "i"),
    };
  }

  if (assetNumber) {
    matchObj["templateData.generalDetails.number"] = {
      $regex: new RegExp(escapeRegex(assetNumber), "i"),
    };
  }
  if (assetModel) {
    matchObj["templateData.specifications.manufacturingDetails.model"] = {
      $regex: new RegExp(escapeRegex(assetModel), "i"),
    };
  }
  if (assetMake) {
    matchObj["templateData.specifications.manufacturingDetails.make"] = {
      $regex: new RegExp(escapeRegex(assetMake), "i"),
    };
  }

  // ---- MAIN PIPELINE ----
  const pipeline = [
    { $match: matchObj },

    { $sort: { createdAt: -1 } },

    {
      $group: {
        _id: "$familyKey",
        latest: { $first: "$$ROOT" },
      },
    },

    { $replaceRoot: { newRoot: "$latest" } },

    // businessUnit
    {
      $lookup: {
        from: "businessUnits",
        let: { buId: "$templateData.generalDetails.businessUnit" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$buId"] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: "templateData.generalDetails.businessUnitObj",
      },
    },
    {
      $addFields: {
        "templateData.generalDetails.businessUnit": {
          $let: {
            vars: {
              bu: {
                $arrayElemAt: [
                  "$templateData.generalDetails.businessUnitObj",
                  0,
                ],
              },
            },
            in: { id: "$$bu._id", name: "$$bu.name" },
          },
        },
      },
    },
    { $unset: "templateData.generalDetails.businessUnitObj" },

    // department
    {
      $lookup: {
        from: "departments",
        let: { deptId: "$templateData.generalDetails.department" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$deptId"] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: "templateData.generalDetails.departmentObj",
      },
    },
    {
      $addFields: {
        "templateData.generalDetails.department": {
          $let: {
            vars: {
              dept: {
                $arrayElemAt: [
                  "$templateData.generalDetails.departmentObj",
                  0,
                ],
              },
            },
            in: { id: "$$dept._id", name: "$$dept.name" },
          },
        },
      },
    },
    { $unset: "templateData.generalDetails.departmentObj" },

    // owner
    {
      $lookup: {
        from: "users",
        let: { ownerId: "$templateData.generalDetails.owner" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$ownerId"] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: "templateData.generalDetails.ownerObj",
      },
    },
    {
      $addFields: {
        "templateData.generalDetails.owner": {
          $let: {
            vars: {
              owner: {
                $arrayElemAt: [
                  "$templateData.generalDetails.ownerObj",
                  0,
                ],
              },
            },
            in: { id: "$$owner._id", name: "$$owner.name" },
          },
        },
      },
    },
    { $unset: "templateData.generalDetails.ownerObj" },

    // category
    {
      $lookup: {
        from: "assetCategories",
        let: { catId: "$templateData.generalDetails.category" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$catId"] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: "templateData.generalDetails.categoryObj",
      },
    },
    {
      $addFields: {
        "templateData.generalDetails.category": {
          $let: {
            vars: {
              cat: {
                $arrayElemAt: [
                  "$templateData.generalDetails.categoryObj",
                  0,
                ],
              },
            },
            in: { id: "$$cat._id", name: "$$cat.name" },
          },
        },
      },
    },
    { $unset: "templateData.generalDetails.categoryObj" },

    { $skip: skip },
    { $limit: limit },
  ];

  // Main data fetch
  const data = await masterAsset_model.aggregate(pipeline);

  // ---- FIXED COUNT QUERY ----
  const countPipeline = [
    { $match: matchObj },
    { $group: { _id: "$familyKey" } },
  ];

  const totalGroups = await masterAsset_model.aggregate(countPipeline);

  const total = totalGroups.length;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
};


module.exports = { createMasterAsset, fetchMasterAssets ,updateMasterAsset};