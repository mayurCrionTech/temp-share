const {adminSeeder} = require("./adminSeeder");

const {updateBusinessUnits} = require("./addBusinessUnit");

const {
  runOrganizationMigration,  createOrganizationsFromBusinessUnits,
  updateBusinessUnitsWithOrganizations,  updateExistingBusinessUnits,
} = require("./addOrganizations");

const {
  consolidatePermissionsAndGroups,  validateMigration,  runPermissionMigration,
} = require("./updatePermissionToRootLevel");

const {
  identifyBrokenUserPermissions,  fixBrokenUserPermissions,  getBrokenPermissionDetails,  runFullDiagnosis,
} = require("./userPermissionDiagnosisScript");

const {updateLogEntriesIsFormula} = require("./logEntriesIsFormulaUpdate")



module.exports = {
  adminSeeder,
  updateBusinessUnits,
  runOrganizationMigration,
  createOrganizationsFromBusinessUnits,
  updateBusinessUnitsWithOrganizations,
  updateExistingBusinessUnits,
  consolidatePermissionsAndGroups,
  validateMigration,
  runPermissionMigration,
  identifyBrokenUserPermissions,
  fixBrokenUserPermissions,
  getBrokenPermissionDetails,
  runFullDiagnosis,
  updateLogEntriesIsFormula,
};
