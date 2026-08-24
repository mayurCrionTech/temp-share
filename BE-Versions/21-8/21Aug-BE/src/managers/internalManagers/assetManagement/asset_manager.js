/*
date              cr/qid      comments
24-march-2026     CR0001      1) Updated - ref of asset category removed for - dropdown api & replaced by dropdown_options

date            qid / cr#         comments
14-mar-2026     CR0002           filteration for ASSET

*/
/*
date            qid / cr#         comments
19-mar-2026     CR0008           ASSET import by xlsx

*/
const {
  Assets,
  assetConstant,
} = require("../../../models/mongoDB/assetManagement/asset_model");
const { mongoDbManager } = require("../../dBManagers");
const paginationHandler = require("../../common/paginationHandler_manager");
const spareManager = require("../../../managers/internalManagers/assetManagement/sparesAndInventory_manager");
const assetParameterManager = require("../../../managers/internalManagers/assetManagement/assetParameter_manager")
const assetDocumentManager = require("../../../managers/internalManagers/assetManagement/assetDocument_manager");
const Model = Assets;
const mongoose = require("mongoose");
const {
  buildSingleAggregationPipeline,
  fetchAllAndPopulate,
} = require("../../dBManagers/mongoDB_manager");
const fileManager = require("../../../managers/internalManagers/fileSystem/fileSystem_manager");
//start 
//CR0002
// Added User & Department models to support name-based filtering
// This enables converting name → ObjectId before building query
const User = require("../../../models/mongoDB/userManagement/user_model");
const Department = require("../../../models/mongoDB/organizationManagement/department_model");
//end
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const moduleConfig = require("../../../configs/module_config.js");
//START
//CR0008
const XLSX = require("xlsx");//19\03 for xlsx upload
//END

async function createAsset(createObj) {
  try {
    // const datum = await mongoDbManager.insertOne(Model, createObj);
    const datum = new Model(createObj);
    const assetId = "ast_"+datum._id.toString();

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(assetId);

    // Define file path for QR code
    const qrCodeDirectory = path.join(
      __dirname,
      "../../../../internalUploads/assets/qrcodes"
    );
    const qrCodeFilePath = path.join(qrCodeDirectory, `${assetId}.png`);

    // Ensure directory exists
    if (!fs.existsSync(qrCodeDirectory)) {
      fs.mkdirSync(qrCodeDirectory, { recursive: true });
    }

    // Save QR code to a file
    await new Promise((resolve, reject) => {
      const base64Data = qrCodeData.replace(/^data:image\/png;base64,/, "");
      fs.writeFile(qrCodeFilePath, base64Data, "base64", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const uploadResult = await fileManager.uploadFileInternal(qrCodeFilePath, createObj.businessUnit);
    datum.qrCode = uploadResult._id;

		await datum.save();
		// await updateAsset(datum._id, { qrCode: uploadResult });
    return { id: datum._id , name:datum.generalDetails.name, department:datum.generalDetails.department, createdBy: datum.createdBy, businessUnit: datum.generalDetails.businessUnit};
  } catch (error) {
    throw error;
  }
}
// added new code down for cpu utilisation
// async function updateAllAssetsStatusHistory() {
//   try {

// 	const assets = await Assets.find({});
// 	let updatedCount = 0;

// 	for (const asset of assets) {
// 	  const installationDate =
// 		asset.specifications?.manufacturingDetails?.installationDate;

// 	  // Skip if no installation date
// 	  if (!installationDate) continue;

// 	  const statusHistory = asset.statusHistory || [];

// 	  // Skip if history already exists
// 	  if (statusHistory.length > 0) continue;

// 	  // Create a new statusHistory entry
// 	  const newHistory = [
// 		{
// 		  status: asset.status || "Active",
// 		  startTime: new Date(installationDate),
// 		  endTime: null,
// 		},
// 	  ];

// 	  await Assets.findByIdAndUpdate(
// 		asset._id,
// 		{
// 		  $set: {
// 			statusHistory: newHistory,
// 			updatedAt: new Date(),
// 		  },
// 		},
// 		{ new: true }
// 	  );

// 	  updatedCount++;
// 	}

// 	console.log(` Updated ${updatedCount} assets with new status history.`);
//   } catch (err) {
// 	console.error(" Error updating assets:", err);

//   }
// }

async function updateAllAssetsStatusHistory() {
  try {
  // Only fetch assets that have an installation date but no status history yet
  const assets = await Assets.find(
    {
    "specifications.manufacturingDetails.installationDate": { $exists: true, $ne: null },
    $or: [
      { statusHistory: { $exists: false } },
      { statusHistory: { $size: 0 } },
    ],
    },
    { _id: 1, status: 1, "specifications.manufacturingDetails.installationDate": 1 }
  ).lean();

  if (assets.length === 0) {
    console.log("No assets need status history initialization.");
    return;
  }

  // Use bulkWrite instead of individual findByIdAndUpdate calls
  const bulkOps = assets.map((asset) => ({
    updateOne: {
    filter: { _id: asset._id },
    update: {
      $set: {
      statusHistory: [
        {
        status: asset.status || "Active",
        startTime: new Date(asset.specifications.manufacturingDetails.installationDate),
        endTime: null,
        },
      ],
      updatedAt: new Date(),
      },
    },
    },
  }));

  const result = await Assets.bulkWrite(bulkOps, { ordered: false });
  console.log(`Updated ${result.modifiedCount} assets with new status history.`);
  } catch (err) {
  console.error("Error updating assets:", err);
  }
}

async function updateAsset(assetId, updateObj) {
  try {
    const query = {
      _id: assetId,
      isDeleted: false,
    };
    return await mongoDbManager.updateOne(Model, query, { $set: updateObj });
  } catch (error) {
    throw error;
  }
}
async function updateStatusHistoryOnInstallation(assetId, installationDate) {
  if (!installationDate) return;

  const asset = await Model.findById(assetId);
  if (!asset) return;

  const currentStatus = asset.status || "Active";
  const statusHistory = asset.statusHistory || [];

  // Close the previous open status entry (if any)
  const lastEntry = statusHistory[statusHistory.length - 1];
  if (lastEntry && !lastEntry.endTime) {
    lastEntry.endTime = new Date();
  }

  // Add new status entry with installation date
  statusHistory.push({
    status: currentStatus,
    startTime: new Date(installationDate),
    endTime: null,
  });

  // Update the asset document directly
  await Model.findByIdAndUpdate(
    assetId,
    {
      $set: {
        statusHistory,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  console.log(` Status history updated for asset ${assetId}`);
}


async function getAllAssets(req) {
   //CR0002
  //start
  // ["Handled both ObjectId and name-based filtering by dynamically converting names to IDs."]
    try {
      
      if (req.query.owner && !mongoose.Types.ObjectId.isValid(req.query.owner)) {
    const matchingOwners = await User.find({
      name: { $regex: req.query.owner.trim(), $options: "i" },
    }).select("_id");
    req.query.ownerIds = matchingOwners.map((u) => u._id);
    delete req.query.owner;
    }

    if (req.query.department && !mongoose.Types.ObjectId.isValid(req.query.department)) {
      const matchingDepts = await Department.find({
        name: { $regex: req.query.department.trim(), $options: "i" },
      }).select("_id");
      req.query.departmentIds = matchingDepts.map((d) => d._id);
      delete req.query.department;
    }

  //end
		const queryObj = queryBuilder(req.query);
		const fieldMapping = fieldMappings();
		const countData = await mongoDbManager.count(Model, queryObj.query);

		// // Handle cases where either page or limit is not provided
		// if (queryObj.page === null && queryObj.limit === null) {
		// 	queryObj.limit = countData || 1; // Set limit to the total number of records if no limit is provided
		// 	queryObj.page = 1; // Set page to 1 if no page is provided
		// } else if (queryObj.page === null) {
		// 	queryObj.page = 1; // Set default page to 1 if not provided
		// } else if (queryObj.limit === null) {
		// 	queryObj.limit = countData; // Set limit to the total number of records if no limit is provided
		// }

		// Handle cases where either page or limit is not provided
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

		let populateFields = [];

		let selectFields = [];
		if (queryObj.allDetails === true) {
			populateFields = [
				"department",
				"createdBy",
				"updatedBy",
				"businessUnit",
				"owner",
				"parent",
				"termsAndConditions",
				"images",
        "createdBy",
        "updatedBy",
        "category"
			];

			selectFields = [
				"generalDetails",
				"isRegistrationCompleted",
				"updatedBy",
				"createdBy",
				"createdAt",
				"updatedAt",
				"status",
				"specifications",
				"locationAndHierarchyDetails",
				"termsAndConditions",
        "images",
        "createdBy",
        "updatedBy",
        "category",
        "isMaintenancePresent",
			];
		} else {
			populateFields = ["department", "businessUnit", "owner", "images", "category"];// cr0008

			selectFields = [
				"generalDetails",
				"isRegistrationCompleted",
				"createdAt",
				"updatedAt",
				"status",
				"images",
        "isMaintenancePresent",
			];
		}

		let data = await fetchAllAndPopulate(
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
			if (queryObj.allDetails === true) {
				// data = data.map(async (datum) => {
				for (let i = 0; i < data.length; i++) {
					const datum = data[i];

					if (Object.keys(datum.locationAndHierarchyDetails.hierarchy).length === 0) {
						delete datum.locationAndHierarchyDetails.hierarchy;
					}
					// Remove 'locationAndHierarchyDetails' if it is now empty
					if (Object.keys(datum.locationAndHierarchyDetails).length === 0) {
						delete datum.locationAndHierarchyDetails;
					}

					// Check and remove empty 'warrantyDetails' object within 'specifications'
					if (Object.keys(datum.specifications.warrantyDetails).length === 0) {
						delete datum.specifications.warrantyDetails;
					}
					// Remove 'specifications' if it is now empty
					if (Object.keys(datum.specifications).length === 0) {
						delete datum.specifications;
					}

					if (
						datum.specifications &&
						datum.specifications.warrantyDetails &&
						datum.specifications.warrantyDetails.termsAndConditions
					) {
						datum.specifications.warrantyDetails.termsAndConditions = await fileManager.transformFileObj(
							datum.specifications.warrantyDetails.termsAndConditions,
							"download",
							req.get("host"),
							req.protocol
						);
					}
					if (datum.images && datum.images.length > 0) {
            for (let i = 0; i < datum.images.length; i++) {
              datum.images[i] = await fileManager.transformFileObj(datum.images[i], "download", req.get("host"), req.protocol);
            }
					}
				}
			} else {
				if (data) {
					for (let i = 0; i < data.length; i++) {
						data[i].image = data[i]?.images?.length
							? await fileManager.transformFileObj(data[i].images[0], "download", req.get("host"), req.protocol)
							: { test: "test" };
						delete data[i].images;
					}
				}
			}

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
}


async function getAsset(assetId, req) {
  try {
    const queryObj = queryBuilder(req.query);
    const fieldMapping = fieldMappings(queryObj.constructedPopulateFields);
    const populateFields = [
      "department",
      "createdBy",
      "updatedBy",
      "businessUnit",
      "owner",
      "parent",
      "termsAndConditions",
      "images",
      "category"
    ];

    const selectFields = [
      "generalDetails",
      "isRegistrationCompleted",
      "updatedBy",
      "createdBy",
      "createdAt",
      "updatedAt",
      "status",
      "specifications",
      "locationAndHierarchyDetails",
      "termsAndConditions",
      "images",
      "isMaintenancePresent",
    ];
    assetId = new mongoose.Types.ObjectId(assetId);
    let datum = await buildSingleAggregationPipeline(
      Model,
      assetId,
      queryObj.query,
      fieldMapping,
      populateFields,
      selectFields
    );
      if (Object.keys(datum.locationAndHierarchyDetails.hierarchy).length === 0) {
				delete datum.locationAndHierarchyDetails.hierarchy;
			}
			// Remove 'locationAndHierarchyDetails' if it is now empty
			if (Object.keys(datum.locationAndHierarchyDetails).length === 0) {
				delete datum.locationAndHierarchyDetails;
			}

			// Check and remove empty 'warrantyDetails' object within 'specifications'
			if (Object.keys(datum.specifications.warrantyDetails).length === 0) {
				delete datum.specifications.warrantyDetails;
			}
			// Remove 'specifications' if it is now empty
			if (Object.keys(datum.specifications).length === 0) {
				delete datum.specifications;
			}
    if (datum) {
      if (datum.images && datum.images.length > 0) {
        for (let i = 0; i < datum.images.length; i++) {
          datum.images[i] = await fileManager.transformFileObj(datum.images[i], "download", req.get("host"), req.protocol);
        }
      }
      
      if (
        datum.specifications &&
        datum.specifications.warrantyDetails &&
        datum.specifications.warrantyDetails.termsAndConditions
      ) {
        datum.specifications.warrantyDetails.termsAndConditions = await fileManager.transformFileObj(
          datum.specifications.warrantyDetails.termsAndConditions,
          "download",
          req.get("host"),
          req.protocol
        );
      }
      const { _id, ...rest } = datum;
      return { ...rest, id: _id };
    } else return null;
  } catch (err) {
    throw err;
  }
}

async function deleteAsset(assetId) {
  try {
    const query = {
      _id: assetId,
      isDeleted: false,
    };
    const updateObj = { isDeleted: true };
    return await mongoDbManager.updateOne(Model, query, { $set: updateObj });
  } catch (error) {
    throw error;
  }
}

async function deleteAssets(ids) {
  try {
    let query = {
      _id: { $in: ids },
      isDeleted: false,
    };
    let updateObj = { isDeleted: true };
    return await mongoDbManager.updateMany(Model, query, updateObj);
  } catch (error) {
    throw error;
  }
}

async function checkExistingAsset(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const query = { _id: id, isDeleted: false };
    const existingAsset = await mongoDbManager.findOne(Model, query);
    return existingAsset;
  } catch (error) {
    throw error;
  }
}

//fetch asset by field
async function checkAssetByField(field, value, businessUnit, department) {
  try {
    const query = { [field]: value, isDeleted: false };
    if (businessUnit) {
      query.businessUnit = businessUnit;
    }
    if (department) {
      query.department = department;
    }
    const asset = await mongoDbManager.findOne(Model, query);
    return asset;
  } catch (error) {
    throw error;
  }
}

const returnInvalidAssetIds = async (ids) => {
  try {
    let invalidAssetIds = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidAssetIds.length > 0) {
      return {invalidAssetIds};
    }

    const query = {
      _id: { $in: ids },
      isDeleted: false,
    };

    const existingAssets = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      ["_id","generalDetails.name","generalDetails.department","generalDetails.businessUnit"],
      []
    );

    const existingAssetIds = existingAssets.map((asset) =>
      asset._id.toString()
    );

    invalidAssetIds.push(...ids.filter((id) => !existingAssetIds.includes(id)));
    const inValidAssetArray = Array.from(new Set(invalidAssetIds));
    return {existingAssets,inValidAssetArray}
  } catch (error) {
    throw error;
  }
};

const hasNonEmptyValues = (obj) => {
	return Object.values(obj).some((value) =>
		typeof value === "object" && value !== null
			? hasNonEmptyValues(value)
			: value !== null && value !== undefined && value !== ""
	);
};

const incompleteRegisterationDetails = async (assetObj, businessUnit) => {
	const result = {
		isGeneralDetailsPresent: false,
		isSpecificationsPresent: false,
		isLocationAndHierarchyDetailsPresent: false
	};

	if (assetObj.locationAndHierarchyDetails && hasNonEmptyValues(assetObj.locationAndHierarchyDetails)) {
		result.isLocationAndHierarchyDetailsPresent = true;
	}

	if (assetObj.specifications && hasNonEmptyValues(assetObj.specifications)) {
		result.isSpecificationsPresent = true;
	}

	if (assetObj.generalDetails && hasNonEmptyValues(assetObj.generalDetails)) {
		result.isGeneralDetailsPresent = true;
	}

	if (assetObj._id) {
		const assetParameter = await assetParameterManager.checkExistingParameterByAssetId(assetObj._id);
		result.isParametersPresent = !!assetParameter;
	}

	if (assetObj._id) {
    const assetDocument = await assetDocumentManager.checkExistingDocumentByAssetId(assetObj._id);
		result.isDocumentsPresent = !!assetDocument; 
	}

	if (assetObj._id) {
		const spare = await spareManager.checkExistingSpareByAssetId(assetObj._id);
		result.isSparesPresent = !!spare;
	}

	if (moduleConfig.REFERENCE_MANUAL_MODULE == "true") {
		result.isReferenceManualsPresent = false; 
	}

	if (moduleConfig.PLANT3D_MODULE == "true") {
		result.isPlant3DPresent = false; 
	}

	return result;
};

const countAssets = async (businessUnit) => {
  try {
    const returnObj = {
      totalAssets: 0,
      activeAssets: 0,
      underMaintainanceAssets: 0,
      decommissionedAssets: 0,
      breakdownAssets: 0,
      standbyAssets: 0,
    };

    const aggregationPipeline = [
      {
        $match: {
          isDeleted: false,
          "generalDetails.businessUnit": businessUnit, // Filter by businessUnit
        },
      },
      {
        $facet: {
          totalAssets: [{ $count: "count" }],
          activeAssets: [
            { $match: { status: assetConstant.status.Active } },
            { $count: "count" },
          ],
          underMaintainanceAssets: [
            { $match: { status: assetConstant.status.UnderMaintenance } },
            { $count: "count" },
          ],
          decommissionedAssets: [
            { $match: { status: assetConstant.status.Decommissioned } },
            { $count: "count" },
          ],
          breakdownAssets: [
            { $match: { status: assetConstant.status.Breakdown } },
            { $count: "count" },
          ],
          standbyAssets: [
            { $match: { status: assetConstant.status.Standby } },
            { $count: "count" },
          ],
        },
      },
    ];

    const results = await mongoDbManager.aggregation(Model, aggregationPipeline);

    const getCount = (arr) => (arr.length > 0 ? arr[0].count : 0);

    returnObj.totalAssets = getCount(results[0].totalAssets);
    returnObj.activeAssets = getCount(results[0].activeAssets);
    returnObj.underMaintainanceAssets = getCount(results[0].underMaintainanceAssets);
    returnObj.decommissionedAssets = getCount(results[0].decommissionedAssets);
    returnObj.breakdownAssets = getCount(results[0].breakdownAssets);
    returnObj.standbyAssets = getCount(results[0].standbyAssets);

    return returnObj;
  } catch (error) {
    throw error;
  }
};


const fetchHierarchy = async (assetId) => {
  const asset = await mongoDbManager.findOne(Model,{ _id: assetId});
  if (!asset) throw new Error("Asset not found");
 let hierarchy = []
  // Get the root ancestor using the first element in the hierarchy path
  const rootAsset = await mongoDbManager.findOne(Model,{ _id: asset.locationAndHierarchyDetails.hierarchy.hierarchyPath[0] });
  if(rootAsset){
    // Fetch the full hierarchy including siblings and children
    hierarchy = await mongoDbManager.aggregation(Model,[
  [
    { $match: { _id: rootAsset._id } }, // Step 1: Fetch the root asset
    {
      $graphLookup: {
        from: "assets",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "locationAndHierarchyDetails.hierarchy.parent",
        as: "allAssets"
      }
    },
    { 
      $unwind: {
        path: "$allAssets",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "assets",
        localField: "allAssets.locationAndHierarchyDetails.hierarchy.parent",
        foreignField: "_id",
        as: "parentAssetDetails"
      }
    },
    {
      $addFields: {
        "allAssets.parentAssetDetails": { $arrayElemAt: ["$parentAssetDetails", 0] }
      }
    },
    {
      $project: {
        _id: 0,
        id: "$allAssets._id",
        generalDetails: "$allAssets.generalDetails",
        parentAsset: {
          id: "$allAssets.locationAndHierarchyDetails.hierarchy.parent",
          generalDetails: "$allAssets.parentAssetDetails.generalDetails"
        }
      }
    },
    {
      $unionWith: {
        coll: "assets",
        pipeline: [
          { $match: { _id: rootAsset._id } },
          {
            $project: {
              _id: 0,
              id: "$_id",
              generalDetails: "$generalDetails",
              parentAsset: null // Root asset has no parent
            }
          }
        ]
      }
    },
    // { $sort: { parentAsset: 1 } } // Ensures root asset appears first
    { $sort: { "parentAsset.id": 1, id: 1 } }
  ]
    ]);
  }
  else{
    if (hierarchy.length === 0) {
      hierarchy = [
        {
          id: asset._id,
          generalDetails: asset.generalDetails,
          parentAsset: null
        }
      ];
    }
  }
  return hierarchy
};


const updateParentAsset = async (assetId, newParentId) => {

  const newParent = await mongoDbManager.findOne(Model,newParentId);
  if (!newParent) throw new Error("New parent asset not found");

  // Old hierarchy path before updating
  // const oldHierarchyPath = asset.hierarchyPath;

  // New hierarchy path
  const newHierarchyPath = [...newParent.locationAndHierarchyDetails.hierarchy.hierarchyPath, newParent._id];

  // Update the asset's parentId and hierarchyPath
  await mongoDbManager.updateOne(Model,{_id:assetId}, {
    $set: {
      "locationAndHierarchyDetails.hierarchy.parent": newParentId,
      "locationAndHierarchyDetails.hierarchy.hierarchyPath": newHierarchyPath
    }
  });

  // Update all child assets that reference the old hierarchy path
  const updates = await mongoDbManager.updateMany(Model,
    { "locationAndHierarchyDetails.hierarchy.hierarchyPath": assetId }, // Find all child assets
    [
      {
        $set: {
          "locationAndHierarchyDetails.hierarchy.hierarchyPath": {
            $concatArrays: [
              newHierarchyPath, // Append new hierarchy path
              "$locationAndHierarchyDetails.hierarchy.hierarchyPath" // Retain old hierarchy path
            ] // Update their hierarchy path
          }
        }
      }
    ]
  );

  return updates;
};

//START
//CR0008
// For Excel upload - 19\03
async function importAssetsFromExcel(filePath, userId) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const totalRecords = rows.length;
        const inserted = [];
        const failed = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;

            try {
                const assetName   = row["Asset Name"]       || row["name"];
                const assetNumber = row["Asset Number"]     || row["number"];
                const deptValue   = row["Asset Department"] || row["Department Name"] || row["department"];
                const ownerValue  = row["Asset Owner"]      || row["Owner Name"]      || row["owner"];
                const runningModeRaw = row["Running Mode"]      || row["runningMode"]     || "";
                const critLevelRaw   = row["Criticality Level"] || row["criticalityLevel"]|| "";
                const funcAreaRaw    = row["Functional Area"]   || row["functionalArea"]  || "";
//CR0008
                const runningModeResult = smartMatchEnum(runningModeRaw, Object.values(assetConstant.generalDetails.runningMode));
                const critLevelResult   = smartMatchEnum(critLevelRaw,   Object.values(assetConstant.generalDetails.criticalityLevel));
                const funcAreaResult    = smartMatchEnum(funcAreaRaw,     Object.values(assetConstant.generalDetails.functionalArea));
                const buValue     = row["Business Unit"]     || row["businessUnit"]    || "";
                const categoryValue = row["Asset Category"] || row["category"] || "";

                // ── Mandatory validation ──
                const errors = [];
                if (!assetName)   errors.push("Asset name is required");
                if (!assetNumber) errors.push("Asset number is required");
                if (!deptValue)   errors.push("Asset department is required");
                if (!ownerValue)  errors.push("Asset owner is required");
                if (!buValue)     errors.push("Business Unit is required");
//CR0008
                if (runningModeRaw && runningModeResult.ambiguous)
                    errors.push(`Multiple Running Modes match ${runningModeRaw} — be more specific`);
                if (critLevelRaw && critLevelResult.ambiguous)
                    errors.push(`Multiple Criticality Levels match ${critLevelRaw} — be more specific`);
                if (funcAreaRaw && funcAreaResult.ambiguous)
                    errors.push(`Multiple Functional Areas match ${funcAreaRaw} — be more specific`);

                if (errors.length > 0) {
                    failed.push({ row: rowNumber, data: row, errors });
                    continue;
                }
                
                const buResult = await smartLookup(
                    mongoose.models.BusinessUnit,
                    { isDeleted: false },
                    "name",
                    buValue
                );
                if (!buResult.doc) {
                    const reason = buResult.ambiguous
                        ? `Multiple Business Units match ${buValue} — be more specific`
                        : `Business Unit not found: ${buValue}`;
                    failed.push({ row: rowNumber, data: row, errors: [reason] });
                    continue;
                }
                const bu = buResult.doc;

                // ── Check asset number is unique in DB ──
                const existingAsset = await Assets.findOne({
                    "generalDetails.number": assetNumber.toString().trim(),
                    isDeleted: false,
                });
                if (existingAsset) {
                    failed.push({ row: rowNumber, data: row, errors: [`Asset Number ${assetNumber} already exists`] });
                    continue;
                }

                // ── Resolve Department → ObjectId ──
                //cr0008 updated
                const deptResult = await smartLookup(
                    Department,
                    { isDeleted: false, businessUnit: bu._id },
                    "name",
                    deptValue
                );
                if (!deptResult.doc) {
                    const reason = deptResult.ambiguous
                        ? `Multiple Departments match ${deptValue} in Business Unit ${buValue} — be more specific`
                        : `Department ${deptValue} not found in Business Unit ${buValue}`;
                    failed.push({ row: rowNumber, data: row, errors: [reason] });
                    continue;
                }
                const dept = deptResult.doc;

                // ── Resolve Owner → ObjectId ──
                const ownerResult = await smartLookup(User, {}, "name", ownerValue);
                if (!ownerResult.doc) {
                    const reason = ownerResult.ambiguous
                        ? `Multiple Owners match ${ownerValue} — be more specific`
                        : `Owner not found: ${ownerValue}`;
                    failed.push({ row: rowNumber, data: row, errors: [reason] });
                    continue;
                }
                const owner = ownerResult.doc;
                // ── Resolve Category → ObjectId (optional, by name only) ──

                let category = null;
                if (categoryValue) {
                    const DropdownOption = mongoose.model("DropdownOption"); // dropdown_options collection
                    const categoryResult = await smartLookup(
                        DropdownOption,
                        { isDeleted: { $ne: true } },
                        "value",          // dropdown_options uses "value" field, not "name"
                        categoryValue
                    );
                      if (!categoryResult.doc) {
                        failed.push({ row: rowNumber, data: row, errors: [`Invalid category: "${categoryValue}"`] });
                        continue;
                    }
                    category = categoryResult.doc;
                }
                
                const assetObj = {
                    generalDetails: {
                        name:             assetName.toString().trim(),
                        number:           assetNumber.toString().trim(),
                        description:      row["description"] ? row["description"].toString().trim() : "",
                        criticalityLevel: critLevelResult.val,
                        functionalArea:   funcAreaResult.val,
                        runningMode:      runningModeResult.val,
                        businessUnit:     bu._id,
                        department:       dept._id,
                        owner:            owner._id,
                        category:         category ? category._id : null,
                    },
                    businessUnit:            bu._id,
                    isRegistrationCompleted: false,
                    status: assetConstant.status.Active,
                    statusHistory: [{ status: assetConstant.status.Active, startTime: new Date(), endTime: null }],
                    createdBy: userId,
                    updatedBy: userId,
                };

                // ── Insert ──
                const created = await createAsset(assetObj);
                inserted.push({ row: rowNumber, id: created.id, name: created.name });

            } catch (err) {
                failed.push({ row: rowNumber, data: row, errors: [err.message] });
            }
        }

        return {
            totalRecords,
            insertedCount: inserted.length,
            failedCount:   failed.length,
            inserted,
            failed,
        };
    } catch (error) {
        throw error;
    }
}
//updated cr0008
function smartMatchEnum(value, enumValues) {
    if (!value) return { val: "", ambiguous: false };
    const trimmed = value.toString().trim().toLowerCase();

    const matches = enumValues.filter(e => e.toLowerCase().includes(trimmed));
        const val =
        matches.length === 1
            ? matches[0]
            : matches.find(e => e.toLowerCase() === trimmed) ?? "";

    return { val, ambiguous: matches.length > 1 && !val };
}

async function smartLookup(Model, filter, nameField, inputValue) {
    const trimmed = inputValue.toString().trim();
    const matches = await Model.find({...filter,[nameField]: { $regex: trimmed, $options: "i" },}).select(`_id ${nameField}`);

    const doc =
        matches.length === 1
            ? matches[0]
            : matches.find(m => m[nameField]?.trim().toLowerCase() === trimmed.toLowerCase()) ?? null;

    return { doc, ambiguous: matches.length > 1 && !doc };
}
// For Excel upload - 19\03
////CR0008 updated

module.exports = {
  createAsset,
  updateAsset,
  checkExistingAsset,
  checkAssetByField,
  deleteAsset,
  deleteAssets,
  returnInvalidAssetIds,
  incompleteRegisterationDetails,
  updateStatusHistoryOnInstallation,
  updateAllAssetsStatusHistory,
  getAllAssets,
  getAsset,
  countAssets,
  fetchHierarchy,
  updateParentAsset,
  importAssetsFromExcel, // FOR EXCEL UPLOAD  //CR0008
};

function fieldMappings() {
  return {
    businessUnit: {
      localField: "generalDetails.businessUnit",
      collection: "businessUnits",
      fieldsToInclude: ["name", "id"], // Example fields to include
    },
    department: {
      localField: "generalDetails.department",
      collection: "departments",
      fieldsToInclude: ["name", "id"], // Example fields to include
    },
    // CR0001
    category: {
      localField: "generalDetails.category",
      // collection: "assetCategories",
      collection: "dropdown_options",
      // fieldsToInclude: ["name", "id"], // Example fields to include
      fieldsToInclude: ["value", "id"], // Example fields to include
    },
    owner: {
      localField: "generalDetails.owner",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    updatedBy: {
      localField: "updatedBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    createdBy: {
      localField: "createdBy",
      collection: "users",
      fieldsToInclude: ["name", "email", "id"], // Example fields to include
    },
    parent: {
      localField: "locationAndHierarchyDetails.hierarchy.parent",
      collection: "assets",
      fieldsToInclude: ["generalDetails.name", "generalDetails.number", "id"], // Example fields to include
    },
    termsAndConditions: {
      localField: "specifications.warrantyDetails.termsAndConditions",
      collection: "files",
      fieldsToInclude: [
        "_id",
        "name",
        "extension",
        "contentType",
        "size",
        "storageLocation",
        "moduleName",
        "moduleId",
      ], // Example fields to include
    },
    images: {
      localField: "images",
      collection: "files",
      isArray: true,
      fieldsToInclude: [
        "_id",
        "name",
        "extension",
        "contentType",
        "size",
        "storageLocation",
        "moduleName",
        "moduleId",
      ], // Example fields to include
    },
  };
}

//CR0002

//start
// FIX: Centralized query builder to handle all filters in a consistent and scalable way
// Also ensures soft-deleted records are always excluded
function queryBuilder(reqData) {

  const query = { isDeleted: false };

  // ================= TEXT FILTERS =================

  if (reqData.name) {
    query["generalDetails.name"] = {
      $regex: reqData.name,
      $options: "i"
    };
  }

  if (reqData.number) {
    query["generalDetails.number"] = {
      $regex: reqData.number,
      $options: "i"
    };
  }

  // ================= OBJECT ID FILTERS =================

if (reqData.departmentIds?.length) {
  query["generalDetails.department"] = {
    $in: reqData.departmentIds.map((id) => new mongoose.Types.ObjectId(id)),
  };
} else if (reqData.department && mongoose.Types.ObjectId.isValid(reqData.department)) {
  query["generalDetails.department"] = new mongoose.Types.ObjectId(reqData.department);
}
   
  
  // if (reqData.owner && mongoose.Types.ObjectId.isValid(reqData.owner)) {
  //   query["generalDetails.owner"] =
  //     new mongoose.Types.ObjectId(reqData.owner);
  // }


if (reqData.ownerIds?.length) {
  query["generalDetails.owner"] = {
    $in: reqData.ownerIds.map((id) => new mongoose.Types.ObjectId(id)),
  };
} else if (reqData.owner && mongoose.Types.ObjectId.isValid(reqData.owner)) {
  query["generalDetails.owner"] = new mongoose.Types.ObjectId(reqData.owner);
}

  // ================= CRITICALITY LEVEL =================

  if (reqData.criticalityLevel) {
    query["generalDetails.criticalityLevel"] = reqData.criticalityLevel;
  }

  // ================= STATUS =================

  if (reqData.status) {
    query.status = reqData.status;
  }

  // ================= MAINTENANCE PLAN =================

  if (reqData.isMaintenancePresent !== undefined) {
    query.isMaintenancePresent = reqData.isMaintenancePresent === "true";
  }

  // ================= DATE FILTER =================

if (reqData.createdAt) {

  const [startDate, endDate] = reqData.createdAt.split(",");

  if (startDate && endDate) {

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    query.createdAt = {
      $gte: start,
      $lte: end
    };
  }

}

  // ================= PAGINATION =================

  const page = reqData.page ? parseInt(reqData.page, 10) : null;
  const limit = reqData.limit ? parseInt(reqData.limit, 10) : null;

  const sort = reqData.sort || "createdAt";
  const order = reqData.order === "asc" ? 1 : -1;

  const sortOrder = { [sort]: order };
  const listAll = reqData.listAll === "true";
  const allDetails = reqData.allDetails === "true";

  return {
    query,
    page,
    limit,
    sortOrder,
    listAll,
    allDetails
  };
}
//end
