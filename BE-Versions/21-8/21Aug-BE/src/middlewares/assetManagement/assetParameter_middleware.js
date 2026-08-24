const { AssetParameters, parameterConstant } = require("../../models/mongoDB/assetManagement/assetParameter_model.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const assetParameterManager = require("../../managers/internalManagers/assetManagement/assetParameter_manager.js");
const mongoose = require("mongoose");

const validateField = async (field, value, options, asset) => {
	const { type, maxLength, unique, required, checkExists, enumValues, alphanumeric } = options;

	if (required && !value) {
		return `Failed! ${field} is required`;
	}

	if (value) {
		if (type && typeof value !== type) {
			return `Failed! ${field} must be a ${type}`;
		}

		if (maxLength && value.length > maxLength) {
			return `Failed! ${field} should not exceed ${maxLength} characters`;
		}

		if (unique) {
			const exists = await AssetParameters.findOne({
				[`${field}`]: value,
				asset,
				isDeleted: false
			});
			if (exists) {
				return `Failed! ${field} already exists in the server`;
			}
		}

		if (checkExists && !(await checkExists(value))) {
			return `Failed! Invalid ${field}`;
		}

		if (enumValues && !enumValues.includes(value)) {
			return `Failed! Invalid ${field}`;
		}

		if (alphanumeric && !/^[a-zA-Z0-9\s]*$/.test(value)) {
			return `Failed! ${field} should contain only alphanumeric characters`;
		}
	}

	return null;
};

const validateCreateAssetParameterRequest = async (req, res, next) => {
	const { name, value, unit } = req.body;

	req.assetParameterCreateObject = {
		name,
		value,
		unit,
		asset: req.asset,
		businessUnit: req.businessUnit,
		createdBy: req.userId,
		updatedBy: req.userId
	};

	const fieldsToValidate = [
		{ field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
		{
			field: "value",
			options: { type: "string", maxLength: 10, alphanumeric: true, required: true }
		},
		{ field: "unit", options: { type: "string", maxLength: 100, required: true } }
	];

	for (const { field, options } of fieldsToValidate) {
		const error = await validateField(field, req.body[field], options, req.asset);
		if (error) {
			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
		}
	}

	next();
};

const validateCreateAssetParametersRequest = async (req, res, next) => {
	const { parameters } = req.body;

	if (!parameters) {
		return apiResponseHandler.errorResponse(null, req, res, "Parameters are required", 400, null);
	}
	else if (!Array.isArray(parameters) || parameters.length === 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Parameters must be a non-empty array of objects", 400, null);
	}

	req.assetParameterCreateObjects = [];
	const duplicateNamesInRequest = new Set();
	const duplicateNamesInDatabase = new Set();
	const seenNames = new Set();

	const fieldsToValidate = [
		{ field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
		{
			field: "value",
			options: { type: "string", maxLength: 10, alphanumeric: true, required: true }
		},
		{ field: "unit", options: { type: "string", maxLength: 100, required: true } }
	];

	for (const parameter of parameters) {
		const parameterCreateObject = {
			name: parameter.name,
			value: parameter.value,
			unit: parameter.unit,
			asset: req.asset,
			businessUnit: req.businessUnit,
			createdBy: req.userId,
			updatedBy: req.userId
		};

		for (const { field, options } of fieldsToValidate) {
			const error = await validateField(field, parameter[field], options, req.asset);
			if (error) {
				if (error.includes("already exists in the server")) {
					duplicateNamesInDatabase.add(parameter.name);
				} else {
					return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
				}
			}

			if (field === "name") {
				if (seenNames.has(parameter.name)) {
					duplicateNamesInRequest.add(parameter.name);
				} else {
					seenNames.add(parameter.name);
				}
			}
		}

		req.assetParameterCreateObjects.push(parameterCreateObject);
	}

	if (duplicateNamesInRequest.size > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Duplicate names found in request", 400, {
			duplicateNamesInRequest: Array.from(duplicateNamesInRequest)
		});
	}

	if (duplicateNamesInDatabase.size > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Duplicate names found for the asset", 400, {
			duplicateNamesInDatabase: Array.from(duplicateNamesInDatabase)
		});
	}

	next();
};

const validateUpdateAssetParameterRequest = async (req, res, next) => {
	const { name, value, unit, trackingStatus } = req.body;
	const id = req.params.parameter;

	const assetParameter = await AssetParameters.findById(id);
	if (!assetParameter) {
		return apiResponseHandler.errorResponse(null, req, res, "Asset parameter not found", 404, null);
	}

	req.assetParameterUpdateObject = {
		name: name ?? assetParameter.name,
		value: value ?? assetParameter.value,
		unit: unit ?? assetParameter.unit,
		asset: assetParameter.asset,
		trackingStatus: trackingStatus ?? assetParameter.trackingStatus,
		updatedBy: req.userId
	};

	const fieldsToValidate = [
		{ field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
		{
			field: "value",
			options: { type: "string", maxLength: 10, alphanumeric: true, required: true }
		},
		{ field: "unit", options: { type: "string", maxLength: 100, required: true } },
		{ field: "trackingStatus", options: { enumValues: Object.values(parameterConstant.trackingStatus) } }
	];

	for (const { field, options } of fieldsToValidate) {
		if (field === "name" && name === assetParameter.name) {
			continue;
		}

		const error = await validateField(field, req.body[field], options, assetParameter.asset);
		if (error) {
			return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
		}
	}

	next();
};

const validateUpdateAssetParametersRequest = async (req, res, next) => {
	const { parametersToDelete, parametersToEdit } = req.body;
	const asset = req.asset;
	const idSet = new Set();
	const duplicateIds = new Set();

	// Validate parametersToDelete
	if (parametersToDelete) {
		if (!Array.isArray(parametersToDelete) || parametersToDelete.length === 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Parameters to delete must be a non-empty array of ids", 400, null);
		}

		let invalidParameterIds = await assetParameterManager.returnInvalidParameterIds(parametersToDelete, asset);
		if (invalidParameterIds.length > 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Parameter ids", 400, {
				invalidParameterIds: invalidParameterIds
			});
		}

		for (const id of parametersToDelete) {
			if (idSet.has(id)) {
				duplicateIds.add(id);
			} else {
				idSet.add(id);
			}
		}
	}

	if (!parametersToEdit) {
		return apiResponseHandler.errorResponse(null, req, res, "Parameters to edit are required", 400, null);
	}

	// Validate parametersToEdit
	req.assetParameterUpdateObjects = [];
	const duplicateNamesInRequest = new Set();
	const duplicateNamesInDatabase = new Set();
	const seenNames = new Set();

	if (parametersToEdit) {
		if (!Array.isArray(parametersToEdit) || parametersToEdit.length === 0) {
			return apiResponseHandler.errorResponse(null, req, res, "Parameters to edit must be a non-empty array of objects", 400, null);
		} else {
			const fieldsToValidate = [
				{ field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
				{
					field: "value",
					options: { type: "string", maxLength: 10, alphanumeric: true, required: true }
				},
				{ field: "unit", options: { type: "string", maxLength: 100, required: true } },
				{ field: "trackingStatus", options: { enumValues: Object.values(parameterConstant.trackingStatus) } }
			];

			for (const parameter of parametersToEdit) {
				if (!parameter.id) {
					return apiResponseHandler.errorResponse(null, req, res, "Parameter id is required", 400, null);
				}
				if (idSet.has(parameter.id)) {
					duplicateIds.add(parameter.id);
				} else {
					idSet.add(parameter.id);
				}

				const assetParameter = await AssetParameters.findById(parameter.id);
				if (!assetParameter) {
					return apiResponseHandler.errorResponse(null, req, res, `Asset parameter with id ${parameter.id} not found`, 404, null);
				}

				const parameterUpdateObject = {
					name: parameter.name ?? assetParameter.name,
					value: parameter.value ?? assetParameter.value,
					unit: parameter.unit ?? assetParameter.unit,
					asset: assetParameter.asset,
					trackingStatus: parameter.trackingStatus ?? assetParameter.trackingStatus,
					updatedBy: req.userId
				};

				for (const { field, options } of fieldsToValidate) {
					if (field === "name" && parameter.name === assetParameter.name) {
						continue;
					}

					const error = await validateField(field, parameter[field], options, assetParameter.asset);
					if (error) {
						if (error.includes("already exists in the server")) {
							duplicateNamesInDatabase.add(parameter.name);
						} else {
							return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
						}
					}

					if (field === "name") {
						if (seenNames.has(parameter.name)) {
							duplicateNamesInRequest.add(parameter.name);
						} else {
							seenNames.add(parameter.name);
						}
					}
				}

				req.assetParameterUpdateObjects.push({
					updateObject: parameterUpdateObject,
					id: parameter.id
				});
			}

			if (duplicateNamesInRequest.size > 0) {
				return apiResponseHandler.errorResponse(null, req, res, "Duplicate names found in request", 400, {
					duplicateNamesInRequest: Array.from(duplicateNamesInRequest)
				});
			}

			if (duplicateNamesInDatabase.size > 0) {
				return apiResponseHandler.errorResponse(null, req, res, "Duplicate names found in server", 400, {
					duplicateNamesInDatabase: Array.from(duplicateNamesInDatabase)
				});
			}
		}
	}

	if (duplicateIds.size > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Duplicate id found", 400, {
			duplicateIds: Array.from(duplicateIds)
		});
	}

	next();
};

const validateDeleteAssetParametersRequest = async (req, res, next) => {
	const { parametersToDelete } = req.body;
	const asset = req.asset;
	if (!parametersToDelete) {
		return apiResponseHandler.errorResponse(null, req, res, "Parameter ids are required", 400, null);
	}

	if (!Array.isArray(parametersToDelete) || parametersToDelete.length === 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Parameter ids must be a non-empty array of strings", 400, null);
	}

	const idSet = new Set();
	const duplicateIds = new Set();
	for (const id of parametersToDelete) {
		if (idSet.has(id)) {
			duplicateIds.add(id);
		} else {
			idSet.add(id);
		}
	}

	if (duplicateIds.size > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Duplicate id found", 400, {
			duplicateIds: Array.from(duplicateIds)
		});
	}
	let invalidParameterIds = await assetParameterManager.returnInvalidParameterIds(parametersToDelete, asset);
	if (invalidParameterIds.length > 0) {
		return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Parameter ids", 400, {
			invalidParameterIds: invalidParameterIds
		});
	}

	next();
};

const validateFetchAllRequest = async (req, res, next) => {

	const { name } = req.query;
	if (name && typeof name !== 'string') {
		return apiResponseHandler.errorResponse(null, req, res, 'Name must be a string', 400, null);
	}

	next();
};


  const validateParameterExistsForAsset = async (req, res, next) => {
    try {
      const assetParameter =
        await assetParameterManager.checkExistingParameterByAssetId(
          req.params.asset
        );
      if (assetParameter) {
        return next();
      } else {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Parameter for this Asset does not exist",
          404,
          null
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const validateParameter = async (req, res, next) => {
    // Check if parameter is in req.params
    if (req.params.parameter && typeof req.params.parameter === "string") {
      req.parameter = req.params.parameter;
    }
    // If not, check if parameter is in req.body
    else if (req.body.parameter && typeof req.body.parameter === "string") {
      req.parameter = req.body.parameter;
    } else if (req.query.parameter && typeof req.query.parameter === "string") {
      req.parameter = req.query.parameter;
    }
    // If parameter is not in req.params or req.body, return an error response
    else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "parameter id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }
	if (!mongoose.Types.ObjectId.isValid(req.params.asset)) {
		return apiResponseHandler.errorResponse(
		  null,
		  req,
		  res,
		  "Failed! Invalid Asset Id",
		  400,
		  null
		);
	  }
	
    // let checkAssetDocument = await assetDocumentManager.checkExistingAssetDocument(req.assetDocument);
    let checkExistingParameter;
    let fetchByField = req.query.fetchByField;
    if (fetchByField) {
      let businessUnit = req.query.businessUnit;
      if (fetchByField == "name") {
        if (!req.params.asset) {
          return apiResponseHandler.errorResponse(
            null,
            req,
            res,
            "Asset id must be a non-empty string in req.params or req.body",
            400,
            null
          );
        }
        // Check if the user with the given ID exists
        checkExistingParameter =
          await assetParameterManager.checkExistingParameterByNameAndAsset(
            "name",
            req.parameter,
            req.params.asset,
            businessUnit
          );
      }
    } else {
		if (!mongoose.Types.ObjectId.isValid(req.parameter)) {
			return apiResponseHandler.errorResponse(
			  null,
			  req,
			  res,
			  "Failed! Invalid Parameter Id",
			  400,
			  null
			);
		  }
      checkExistingParameter =
        await assetParameterManager.checkExistingParameterById(req.parameter);
    }

    if (checkExistingParameter) {
      req.assetParameterObj = checkExistingParameter;
      next();
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Asset Parameter does not exist",
        404,
        null
      );
    }
  };

const assetMiddleware = {
	validateCreateAssetParametersRequest,
	validateCreateAssetParameterRequest,
	validateUpdateAssetParameterRequest,
	validateUpdateAssetParametersRequest,
	validateDeleteAssetParametersRequest,
	validateFetchAllRequest,
	validateParameter,
	validateParameterExistsForAsset,
};

module.exports = assetMiddleware;


