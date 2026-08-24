/*
date              cr/qid      comments
17-march-2026     CR0001      Controller added for dropdown
*/

const dropdownManager = require("../../managers/internalManagers/dropdownManagement/dropdown_manager");
const BusinessUnit = require("../../models/mongoDB/organizationManagement/businessUnit_model");

// ----- USER CONTROLLER -----

// GET /api/v1/dropdowns
const getDropdowns = async (req, res) => {
  try {
    const businessUnitId = req.businessUnit;

    if (!businessUnitId) throw new Error("Business Unit is required");

    // Get organization from Business Unit
    const businessUnit = await BusinessUnit.findById(businessUnitId)
      .select("organization")
      .lean();

    if (!businessUnit || !businessUnit.organization) {
      throw new Error("Organization is required");
    }

    const organizationId = businessUnit.organization;

    const dropdowns = await dropdownManager.getAllDropdowns(
      organizationId,
      businessUnitId,
    );

    return res.status(200).json({
      message: "Dropdowns fetched successfully",
      result: dropdowns,
    });
  } catch (error) {
    console.error("Error in getDropdowns:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// GET /api/v1/dropdowns/:code
const getDropdownByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const businessUnitId = req.businessUnit;

    if (!code) throw new Error("Code is required");
    if (!businessUnitId) throw new Error("Business Unit is required");

    // Get organization from BU
    const businessUnit = await BusinessUnit.findById(businessUnitId)
      .select("organization")
      .lean();

    if (!businessUnit || !businessUnit.organization) {
      throw new Error("Organization is required");
    }

    const organizationId = businessUnit.organization;

    const dropdown = await dropdownManager.getDropdownByCode(
      organizationId,
      businessUnitId,
      code,
    );

    return res.status(200).json({
      message: "Dropdown fetched successfully",
      result: dropdown,
    });
  } catch (error) {
    console.error("Error in getDropdownByCode:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// ----- ADMIN CONTROLLERS -----

// GET /api/v1/dropdowns/admin?organization=ORG_ID
// GET /api/v1/dropdowns/admin?organization=ORG_ID&businessUnit=BU_ID
const getAdminDropdowns = async (req, res) => {
  try {
    const organizationId = req.query?.organization;
    const businessUnitId = req.query?.businessUnit;

    if (!organizationId) throw new Error("Organization is required");

    const dropdowns = await dropdownManager.getAdminDropdowns(
      organizationId,
      businessUnitId,
    );

    return res.status(200).json({
      message: "Admin dropdowns fetched successfully",
      result: dropdowns,
    });
  } catch (error) {
    console.error("Error in getAdminDropdowns:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// POST /api/v1/dropdowns/admin
const initializeStaticDropdowns = async (req, res) => {
  try {
    const { organization } = req.body;

    if (!organization) throw new Error("Organization is required");

    const result =
      await dropdownManager.initializeStaticDropdowns(organization);

    return res.status(200).json({
      message: "Dropdowns initialized successfully",
      result,
    });
  } catch (error) {
    console.error("Error in initializeStaticDropdowns:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// POST /api/v1/dropdowns/admin/:dropdownId/options
const addOption = async (req, res) => {
  try {
    const { dropdownId } = req.params;
    const { value } = req.body;

    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!value) throw new Error("Option value is required");

    const option = await dropdownManager.addOption(dropdownId, value);

    return res.status(201).json({
      message: "Option added successfully",
      result: option,
    });
  } catch (error) {
    console.error("Error in addOption:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// POST /api/v1/dropdowns/admin/:dropdownId/options/:optionId/disable
const disableOption = async (req, res) => {
  try {
    const { dropdownId, optionId } = req.params;
    const { businessUnit } = req.body;
    const organization = req.body.organization || req.query?.organization;

    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!optionId) throw new Error("Option ID is required");
    if (!businessUnit) throw new Error("Business Unit is required");
    if (!organization) throw new Error("Organization is required");

    const result = await dropdownManager.disableOption({
      organization,
      businessUnit,
      dropdownId,
      optionId,
    });

    return res.status(200).json({
      message: "Option disabled successfully",
      result,
    });
  } catch (error) {
    console.error("Error in disableOption:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// DELETE /api/v1/dropdowns/admin/:dropdownId/options/:optionId/disable
const enableOption = async (req, res) => {
  try {
    const { dropdownId, optionId } = req.params;
    const { businessUnit } = req.body;
    const organization = req.body.organization || req.query?.organization;

    if (!dropdownId) throw new Error("Dropdown ID is required");
    if (!optionId) throw new Error("Option ID is required");
    if (!businessUnit) throw new Error("Business Unit is required");
    if (!organization) throw new Error("Organization is required");

    const result = await dropdownManager.enableOption({
      organization,
      businessUnit,
      dropdownId,
      optionId,
    });

    return res.status(200).json({
      message: "Option enabled successfully",
      result,
    });
  } catch (error) {
    console.error("Error in enableOption:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// GET /api/v1/dropdowns/admin/:dropdownId/disabled
const getDisabledOptions = async (req, res) => {
  try {
    const { dropdownId } = req.params;

    if (!dropdownId) throw new Error("Dropdown ID is required");

    const result = await dropdownManager.getDisabledOptions(dropdownId);

    return res.status(200).json({
      message: "Disabled options fetched successfully",
      result,
    });
  } catch (error) {
    console.error("Error in getDisabledOptions:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getDropdowns,
  getDropdownByCode,
  getAdminDropdowns,
  initializeStaticDropdowns,
  addOption,
  disableOption,
  enableOption,
  getDisabledOptions,
};
