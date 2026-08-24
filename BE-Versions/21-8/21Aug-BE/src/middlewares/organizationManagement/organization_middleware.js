const { Organizations } = require("../../models/mongoDB/organizationManagement/organization_model.js");
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager.js");
const organizationManager = require("../../managers/internalManagers/organizationManagement/organization_manager.js");
const businessUnitManager = require("../../managers/internalManagers/organizationManagement/businessUnit_manager.js");
const mongoose = require("mongoose");

const validateField = async (field, value, options) => {
    const {
        type,
        maxLength,
        minLength,
        unique,
        required,
        checkExists,
        enumValues,
        alphanumeric,
        itemType,
        itemMaxLength,
        itemMinLength,
    } = options;

    if (required && (value === undefined || value === null || value === '')) {
        return `Failed! ${field} is required`;
    }

    if (value !== undefined && value !== null) {
        if (type === 'array') {
            if (!Array.isArray(value)) {
                return `Failed! ${field} must be an array`;
            }

            if (maxLength && value.length > maxLength) {
                return `Failed! ${field} should not contain more than ${maxLength} items`;
            }

            if (minLength && value.length < minLength) {
                return `Failed! ${field} should contain at least ${minLength} items`;
            }

            if (itemType || itemMaxLength || itemMinLength) {
                for (const [index, item] of value.entries()) {
                    if (itemType && typeof item !== itemType) {
                        return `Failed! ${field}[${index}] must be a ${itemType}`;
                    }

                    if (itemMaxLength && item.length > itemMaxLength) {
                        return `Failed! ${field}[${index}] must not exceed ${itemMaxLength} characters`;
                    }

                    if (itemMinLength && item.length < itemMinLength) {
                        return `Failed! ${field}[${index}] must be at least ${itemMinLength} characters`;
                    }
                }
            }

        } else if (type && typeof value !== type) {
            return `Failed! ${field} must be a ${type}`;
        }

        if (type === 'string') {
            if (maxLength && value.length > maxLength) {
                return `Failed! ${field} should not exceed ${maxLength} characters`;
            }

            if (minLength && value.length < minLength) {
                return `Failed! ${field} should be at least ${minLength} characters`;
            }
        }

        if (unique) {
            const exists = await Organizations.findOne({
                [`${field}`]: value,
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


const validateCreateOrganizationRequest = async (req, res, next) => {
    const { name, allowedDomains = [] } = req.body;
    
    const isDomainRestricted = Array.isArray(allowedDomains) && allowedDomains.length > 0;
    
    req.organizationCreateObject = {
        name,
        allowedDomains,
        isDomainRestricted,
        isEnabled: req.body.isEnabled !== undefined ? req.body.isEnabled : true,
        createdBy: req.userId,
        updatedBy: req.userId
    };

   const fieldsToValidate = [
    { field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
    {
        field: "allowedDomains",
        options: {
            type: "array",
            required: true,
            maxLength: 100,
            itemType: "string",
            itemMinLength: 0,
            itemMaxLength: 100
        }
    },
    { field: "isEnabled", options: { type: "boolean" } },
    { field: "isDomainRestricted", options: { type: "boolean" } }
];
    
  
    for (const { field, options } of fieldsToValidate) {
          console.log("fieldsToValidate", fieldsToValidate)
        const error = await validateField(field, req.organizationCreateObject[field], options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
        }
    }
    next();
};


const validateUpdateOrganizationRequest = async (req, res, next) => {
    const { name, allowedDomains = [], isEnabled } = req.body;
    const id = req.params.organization;

    const organization = await Organizations.findById(id);
    if (!organization) {
        return apiResponseHandler.errorResponse(null, req, res, "Organization not found", 404, null);
    }

    // Merge and deduplicate allowedDomains
    let updatedAllowedDomains = organization.allowedDomains;
    if (Array.isArray(allowedDomains) && allowedDomains.length > 0) {
        const existingDomainsSet = new Set(organization.allowedDomains);
        allowedDomains.forEach(domain => {
            if (typeof domain === 'string') {
                existingDomainsSet.add(domain.trim());
            }
        });
        updatedAllowedDomains = Array.from(existingDomainsSet);
    }

    const isDomainRestricted = updatedAllowedDomains.length > 0;

    req.organizationUpdateObject = {
        name: name ?? organization.name,
        allowedDomains: updatedAllowedDomains,
        isEnabled: isEnabled ?? organization.isEnabled,
        isDomainRestricted
    };

    const fieldsToValidate = [
        { field: "name", options: { type: "string", maxLength: 50, unique: true, required: true } },
        {
            field: "allowedDomains",
            options: {
                type: "array",
                required: true,
                maxLength: 100,
                itemType: "string",
                itemMinLength: 1,
                itemMaxLength: 100
            }
        },
        { field: "isEnabled", options: { type: "boolean" } }
        // no need to validate isDomainRestricted — it's derived
    ];

    for (const { field, options } of fieldsToValidate) {
        if (field === "name" && name === organization.name) {
            continue;
        }

        const valueToValidate =
            field === "allowedDomains" ? updatedAllowedDomains : req.body[field];

        const error = await validateField(field, valueToValidate, options);
        if (error) {
            return apiResponseHandler.errorResponse(null, req, res, error, 400, null);
        }
    }

    next();
};



const validateDeleteOrganizationsRequest = async (req, res, next) => {
    const { organizationsToDelete } = req.body;
    if (!organizationsToDelete) {
        return apiResponseHandler.errorResponse(null, req, res, "Organization ids are required", 400, null);
    }

    if (!Array.isArray(organizationsToDelete) || organizationsToDelete.length === 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Organization ids must be a non-empty array of strings", 400, null);
    }

    const idSet = new Set();
    const duplicateIds = new Set();
    for (const id of organizationsToDelete) {
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
    let invalidOrganizationIds = await organizationManager.returnInvalidOrganizationIds(organizationsToDelete);
    if (invalidOrganizationIds.length > 0) {
        return apiResponseHandler.errorResponse(null, req, res, "Failed! Invalid Organization ids", 400, {
            invalidOrganizationIds
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


  const validateOrganization = async (req, res, next) => {
    // Check if organization is in req.params
    if (req.params.organization && typeof req.params.organization === "string") {
      req.organization = req.params.organization;
    }
    // If not, check if organization is in req.body
    else if (req.body.organization && typeof req.body.organization === "string") {
      req.organization = req.body.organization;
    } else if (req.query.organization && typeof req.query.organization === "string") {
      req.organization = req.query.organization;
    }
    // If organization is not in req.params or req.body, return an error response
    else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "organization id must be a non-empty string in req.params or req.body",
        400,
        null
      );
    }
    if (!mongoose.Types.ObjectId.isValid(req.organization)) {
        return apiResponseHandler.errorResponse(
          null,
          req,
          res,
          "Failed! Invalid organization Id",
          400,
          null
        );
      }
    
    let checkExistingOrganization;
    let fetchByField = req.query.fetchByField;
    if (fetchByField) {
      if (fetchByField == "name") {
  
        checkExistingOrganization =
          await organizationManager.checkExistingOrganizationByName(
            "name",
            req.organization,
          );
      }
    } else {
        if (!mongoose.Types.ObjectId.isValid(req.organization)) {
            return apiResponseHandler.errorResponse(
              null,
              req,
              res,
              "Failed! Invalid Organization Id",
              400,
              null
            );
          }
      checkExistingOrganization =
        await organizationManager.checkExistingOrganizationById(req.organization);
    }

    if (checkExistingOrganization) {
      req.organizationObj = checkExistingOrganization;
      next();
    } else {
      return apiResponseHandler.errorResponse(
        null,
        req,
        res,
        "Failed! Organization does not exist",
        404,
        null
      );
    }
  };

const validateUserDomain = async (req, res, next) => {

    const { email , businessUnit } = req.body;

    if (!email) {
        return apiResponseHandler.errorResponse(null, req, res, "Email is required", 400, null);
    }
    if (!businessUnit) {
        return apiResponseHandler.errorResponse(null, req, res, "businessUnit is required", 400, null);
    }

    // Populate the organizations data from business unit
    const businessUnitData = await businessUnitManager.getBusinessUnit(businessUnit, "", "organization");
    const organization = businessUnitData.organization;
    console.log("first",organization);

    const emailDomain = email.split("@")[1]?.split(".")[0]?.toLowerCase();

    if (!emailDomain) {
        return apiResponseHandler.errorResponse(null, req, res, "Invalid email address", 400, null);
    }

    // Allow all domains if:
    // - isDomainRestricted is false
    // - OR isDomainRestricted is true AND allowedDomains is empty
    const allowedDomains = organization.allowedDomains.map(d => d.toLowerCase());

    const allowAllDomains = !organization.isDomainRestricted || allowedDomains.length === 0;

    if (allowAllDomains) {
        console.log("All domains allowed due to config");
        return next();
    }

    // Domain restriction active and allowedDomains are defined
    if (!allowedDomains.includes(emailDomain)) {
        return apiResponseHandler.errorResponse(null, req, res, "Email domain not allowed", 403, null);
    }

 
//   return apiResponseHandler.errorResponse(null, req, res, "wait", 403, null);
  next();
};


const organizationMiddleware = {
    validateCreateOrganizationRequest,
    validateUpdateOrganizationRequest,
    validateDeleteOrganizationsRequest,
    validateFetchAllRequest,
    validateOrganization,
    validateUserDomain
};

module.exports = organizationMiddleware;


