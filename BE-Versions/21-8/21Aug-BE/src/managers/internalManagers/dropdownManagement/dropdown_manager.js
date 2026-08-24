/*
date              cr/qid      comments
17-march-2026     CR0001      Manager added for dropdown
*/

const DropdownMaster = require("../../../models/mongoDB/dropdownManagement/dropdownMaster_model");
const DropdownOption = require("../../../models/mongoDB/dropdownManagement/dropdownOption_model");
const DropdownOptionDisabled = require("../../../models/mongoDB/dropdownManagement/dropdownOptionDisabled_model");
const BusinessUnit = require("../../../models/mongoDB/organizationManagement/businessUnit_model");

// ----- USER LOGIC -----

// Get dropdowns with BU filtering
const getAllDropdowns = async (organizationId, businessUnitId) => {
  try {
    if (!organizationId) throw new Error("Organization is required");
    if (!businessUnitId) throw new Error("Business Unit is required");

    // 1. Get dropdowns
    const dropdowns = await DropdownMaster.find({
      organization: organizationId,
    }).lean();

    if (!dropdowns.length) return {};

    const dropdownIds = dropdowns.map((d) => d._id);

    // 2. Get options
    const options = await DropdownOption.find({
      dropdownId: { $in: dropdownIds },
    }).lean();

    // 3. Get disabled options
    const disabledOptions = await DropdownOptionDisabled.find({
      organization: organizationId,
      businessUnit: businessUnitId,
      dropdownId: { $in: dropdownIds },
    }).lean();

    const disabledSet = new Set(
      disabledOptions.map((d) => d.optionId.toString()),
    );

    // 4. Map dropdownId - code
    const dropdownMap = {};
    dropdowns.forEach((d) => {
      dropdownMap[d._id.toString()] = d.code;
    });

    // 5. Build result
    const result = {};

    for (const option of options) {
      const dropdownId = option.dropdownId.toString();

      if (disabledSet.has(option._id.toString())) continue;

      const code = dropdownMap[dropdownId];

      if (!result[code]) result[code] = [];

      result[code].push({
        _id: option._id,
        value: option.value,
      });
    }

    return result;
  } catch (error) {
    console.error("Error in getAllDropdowns:", error);
    throw error;
  }
};

// Get dropdowns by code
const getDropdownByCode = async (organizationId, businessUnitId, code) => {
  try {
    if (!organizationId) throw new Error("Organization is required");
    if (!businessUnitId) throw new Error("Business Unit is required");
    if (!code) throw new Error("Code is required");

    // 1. Get dropdown
    const dropdown = await DropdownMaster.findOne({
      organization: organizationId,
      code: code,
    }).lean();

    if (!dropdown) {
      throw new Error("Dropdown not found");
    }

    // 2. Get options
    const options = await DropdownOption.find({
      dropdownId: dropdown._id,
    }).lean();

    // 3. Get disabled options
    const disabledOptions = await DropdownOptionDisabled.find({
      organization: organizationId,
      businessUnit: businessUnitId,
      dropdownId: dropdown._id,
    }).lean();

    const disabledSet = new Set(
      disabledOptions.map((d) => d.optionId.toString()),
    );

    // 4. Filter options
    const filteredOptions = options
      .filter((opt) => !disabledSet.has(opt._id.toString()))
      .map((opt) => ({
        _id: opt._id,
        value: opt.value,
      }));

    return {
      code: dropdown.code,
      name: dropdown.name,
      options: filteredOptions,
    };
  } catch (error) {
    console.error("Error in getDropdownByCode:", error);
    throw error;
  }
};

// ----- ADMIN READ -----

// Get dropdowns with all options (with filtering)
// const getAdminDropdowns = async (organizationId) => {
//   try {
//     if (!organizationId) throw new Error("Organization is required");

//     const dropdowns = await DropdownMaster.find({
//       organization: organizationId,
//     }).lean();

//     if (!dropdowns.length) return [];

//     const dropdownIds = dropdowns.map((d) => d._id);

//     const options = await DropdownOption.find({
//       dropdownId: { $in: dropdownIds },
//     }).lean();

//     const optionMap = {};

//     options.forEach((opt) => {
//       const key = opt.dropdownId.toString();

//       if (!optionMap[key]) optionMap[key] = [];

//       optionMap[key].push({
//         _id: opt._id,
//         value: opt.value,
//       });
//     });

//     return dropdowns.map((dropdown) => ({
//       _id: dropdown._id,
//       name: dropdown.name,
//       code: dropdown.code,
//       options: optionMap[dropdown._id.toString()] || [],
//     }));
//   } catch (error) {
//     console.error("Error in getAdminDropdowns:", error);
//     throw error;
//   }
// };
const getAdminDropdowns = async (organizationId, businessUnitId) => {
  try {
    if (!organizationId) throw new Error("Organization is required");

    // 1. Get dropdowns
    const dropdowns = await DropdownMaster.find({
      organization: organizationId,
    }).lean();

    if (!dropdowns.length) return [];

    const dropdownIds = dropdowns.map((d) => d._id);

    // 2. Get options
    const options = await DropdownOption.find({
      dropdownId: { $in: dropdownIds },
    }).lean();

    // 3. Get disabled options (if BU provided)
    let disabledSet = new Set();

    if (businessUnitId) {
      const disabledOptions = await DropdownOptionDisabled.find({
        organization: organizationId,
        businessUnit: businessUnitId,
        dropdownId: { $in: dropdownIds },
      }).lean();

      disabledSet = new Set(
        disabledOptions.map((d) => d.optionId.toString())
      );
    }

    // 4. Map options with isDisabled flag
    const optionMap = {};

    options.forEach((opt) => {
      const key = opt.dropdownId.toString();

      const isDisabled =
        businessUnitId && disabledSet.has(opt._id.toString());

      if (!optionMap[key]) optionMap[key] = [];

      optionMap[key].push({
        _id: opt._id,
        value: opt.value,
        isDisabled: !!isDisabled,
      });
    });

    // 5. Final response
    return dropdowns.map((dropdown) => ({
      _id: dropdown._id,
      name: dropdown.name,
      code: dropdown.code,
      options: optionMap[dropdown._id.toString()] || [],
    }));

  } catch (error) {
    console.error("Error in getAdminDropdowns:", error);
    throw error;
  }
};

// ----- ADMIN WRITE -----

// Create dropdown
const staticDropdowns = require("../../../configs/staticDropdowns");

const initializeStaticDropdowns = async (organization) => {
  try {
    if (!organization) throw new Error("Organization is required");

    const existingDropdowns = await DropdownMaster.find({
      organization,
    })
      .select("code name")
      .lean();

    const existingCodeSet = new Set(
      existingDropdowns.map((dropdown) => dropdown.code)
    );

    const dropdownsToInsert = [];
    const created = [];
    const skipped = [];

    Object.entries(staticDropdowns).forEach(([code, name]) => {
      const formattedCode = String(code).trim();
      const formattedName = String(name).trim();

      if (!formattedCode || !formattedName) return;

      if (existingCodeSet.has(formattedCode)) {
        skipped.push({
          code: formattedCode,
          name: formattedName,
          reason: "Already exists",
        });
        return;
      }

      existingCodeSet.add(formattedCode);

      dropdownsToInsert.push({
        organization,
        name: formattedName,
        code: formattedCode,
      });

      created.push({
        code: formattedCode,
        name: formattedName,
      });
    });

    if (dropdownsToInsert.length) {
      await DropdownMaster.insertMany(dropdownsToInsert, { ordered: false });
    }

    return {
      created,
      skipped,
    };
  } catch (error) {
    console.error("Error in initializeStaticDropdowns:", error);
    throw error;
  }
};

// Add option
const addOption = async (dropdownId, value) => {
  try {
    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!value) throw new Error("Value is required");

    // Check dropdown exists
    const dropdown = await DropdownMaster.findById(dropdownId);
    if (!dropdown) throw new Error("Dropdown not found");

    // Prevent duplicate option (case-insensitive)
    const existing = await DropdownOption.findOne({
      dropdownId,
      value: { $regex: `^${value}$`, $options: "i" },
    });

    if (existing) throw new Error("Option already exists");

    const option = await DropdownOption.create({
      dropdownId,
      value,
    });

    return {
      _id: option._id,
      value: option.value,
    };
  } catch (error) {
    console.error("Error in addOption:", error);
    throw error;
  }
};

// Disable option for BU
const disableOption = async ({
  organization,
  businessUnit,
  dropdownId,
  optionId,
}) => {
  try {
    if (!organization) throw new Error("Organization is required");
    if (!businessUnit) throw new Error("Business Unit is required");
    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!optionId) throw new Error("Option ID is required");

    // Ensure option exists
    const option = await DropdownOption.findById(optionId);
    if (!option) throw new Error("Option not found");

    // Insert disable record
    const record = await DropdownOptionDisabled.create({
      organization,
      businessUnit,
      dropdownId,
      optionId,
    });

    return record;
  } catch (error) {
    console.error("Error in disableOption:", error);

    // Handle duplicate disable
    if (error.code === 11000) {
      throw new Error("Option already disabled for this Business Unit");
    }

    throw error;
  }
};

// Enable option (remove disable)
const enableOption = async ({
  organization,
  businessUnit,
  dropdownId,
  optionId,
}) => {
  try {
    if (!organization) throw new Error("Organization is required");
    if (!businessUnit) throw new Error("Business Unit is required");
    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!optionId) throw new Error("Option ID is required");

    const result = await DropdownOptionDisabled.findOneAndDelete({
      organization,
      businessUnit,
      dropdownId,
      optionId,
    });

    if (!result) {
      throw new Error("Option is not disabled for this Business Unit");
    }

    return result;
  } catch (error) {
    console.error("Error in enableOption:", error);
    throw error;
  }
};

// Get disabled records
const getDisabledOptions = async (dropdownId) => {
  try {
    if (!dropdownId) throw new Error("Dropdown ID is required");

    // 1. Get disabled records
    const disabledRecords = await DropdownOptionDisabled.find({
      dropdownId,
    }).lean();

    if (!disabledRecords.length) return [];

    const optionIds = disabledRecords.map((d) => d.optionId);
    const businessUnitIds = disabledRecords.map((d) => d.businessUnit);

    // 2. Fetch options
    const options = await DropdownOption.find({
      _id: { $in: optionIds },
    }).lean();

    const optionMap = {};
    options.forEach((opt) => {
      optionMap[opt._id.toString()] = opt.value;
    });

    // 3. Fetch business units
    const businessUnits = await BusinessUnit.find({
      _id: { $in: businessUnitIds },
    }).lean();

    const buMap = {};
    businessUnits.forEach((bu) => {
      buMap[bu._id.toString()] = bu.name;
    });

    // 4. Build result
    const result = disabledRecords.map((record) => ({
      organization: record.organization,
      dropdownId: record.dropdownId,
      optionId: record.optionId,
      optionValue: optionMap[record.optionId.toString()] || null,
      businessUnitId: record.businessUnit,
      businessUnitName: buMap[record.businessUnit.toString()] || null,
    }));

    return result;

  } catch (error) {
    console.error("Error in getDisabledOptions:", error);
    throw error;
  }
};

module.exports = {
  getAllDropdowns,
  getDropdownByCode,
  getAdminDropdowns,
  initializeStaticDropdowns,
  addOption,
  disableOption,
  enableOption,
  getDisabledOptions
};
