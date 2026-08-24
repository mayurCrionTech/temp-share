/*
date            cr/qid      comments
17-march-2026     CR0001      routes added for dropdown
*/

const express = require("express");

const router = express.Router();

const dropdownController = require("../../controllers/dropdownManagement/dropdown_controller");

const {
  verifyIsSuperAdmin,
} = require("../../middlewares/usermanagement/authJwt_middleware");

// ----- USER ROUTES -----

// Get dropdowns (org + BU based filtering)
router.get("/", dropdownController.getDropdowns);

// Get dropdowns for specific organization - Admin
router.get("/admin", verifyIsSuperAdmin, dropdownController.getAdminDropdowns);

// Get dropdowns by code (org + BU based filtering)
router.get("/:code", dropdownController.getDropdownByCode);

// ----- ADMIN ROUTES ------

// Create dropdown
// router.post("/admin", verifyIsSuperAdmin, dropdownController.createDropdown);

// bulk add
router.post(
  "/admin/bulk-init",
  verifyIsSuperAdmin,
  dropdownController.initializeStaticDropdowns
);

// Add option to dropdown
router.post(
  "/admin/:dropdownId/options",
  verifyIsSuperAdmin,
  dropdownController.addOption,
);

// Disable option for BU
router.post(
  "/admin/:dropdownId/options/:optionId/disable",
  verifyIsSuperAdmin,
  dropdownController.disableOption,
);

// Enable option
router.delete(
  "/admin/:dropdownId/options/:optionId/disable",
  verifyIsSuperAdmin,
  dropdownController.enableOption,
);

// Get disabled for admin
router.get(
  "/admin/:dropdownId/disabled",
  verifyIsSuperAdmin,
  dropdownController.getDisabledOptions
);

module.exports = { dropdownRouter: router };
