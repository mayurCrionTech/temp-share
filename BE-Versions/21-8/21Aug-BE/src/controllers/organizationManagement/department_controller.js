/**
 * This is the controller for the department resource
 */
const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const departmentManager = require("../../managers/internalManagers/organizationManagement/department_manager");
/**
 * Create a department
 *
 */

exports.createDepartment = async (req, res) => {
	try {
		const departmentReqObj = createDepartmentObject(req);
		const department = await departmentManager.createDepartment(departmentReqObj);
		const message = "Department created successfully";
		return apiResponseHandler.successResponse(res, message, 201, department);
	} catch (error) {
		console.log("Error while creating the department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Get all departments
//  *
//  */

exports.getAllDepartments = async (req, res) => {
	try {
		const requestBU = req.businessUnit ? req.businessUnit : null;
		const departments = await departmentManager.getAllDepartments(req.query, requestBU);
		const message = "Departments fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, departments);
	} catch (error) {
		console.log("Error while fetching departments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Get a department
//  *
//  */

exports.getDepartment = async (req, res) => {
	try {
		const department = await departmentManager.getDepartment(
			req.params.department,
			req.query.selectFields,
			req.query.populateFields,
			req.businessUnit
		);

		if (!department) {
			return apiResponseHandler.errorResponse(null, req, res, "Department not found", 404, null);
		}
		const message = "Department fetched successfully";
		return apiResponseHandler.successResponse(res, message, 200, department);
	} catch (error) {
		console.log("Error while fetching department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Enable a department
//  *
//  */

exports.enableDepartment = async (req, res) => {
	try {
		const department = await departmentManager.enableDepartment(
			req.params.department,
			req.businessUnit
		);
		const message = "Department enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Disable a department
//  *
//  */

exports.disableDepartment = async (req, res) => {
	try {
		const department = await departmentManager.disableDepartment(
			req.params.department,
			req.businessUnit
		);
		const message = "Department disabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Enable departments
//  *
//  */

exports.enableDepartments = async (req, res) => {
	try {
		await departmentManager.enableDepartments(req.body.departments, req.businessUnit);
		const message = "Departments enabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while enabling departments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Disable departments
//  *
//  */

exports.disableDepartments = async (req, res) => {
	try {
		await departmentManager.disableDepartments(req.body.departments, req.businessUnit);
		const message = "Departments disabled successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while disabling departments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Delete a department
//  *
//  */

exports.deleteDepartment = async (req, res) => {
	try {
		await departmentManager.deleteDepartment(req.params.department, req.businessUnit);
		const message = "Department deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Delete departments
//  *
//  */

exports.deleteDepartments = async (req, res) => {
	try {
		await departmentManager.deleteDepartments(req.body.departments, req.businessUnit);
		const message = "Departments deleted successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while deleting departments", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

// /**
//  * Update a department
//  *
//  */

exports.updateDepartment = async (req, res) => {
	try {
		const departmentReqObj = updateDepartmentObject(req);
		const department = await departmentManager.updateDepartment(
			req.params.department,
			departmentReqObj,
			req.businessUnit
		);
		const message = "Department updated successfully";
		return apiResponseHandler.successResponse(res, message, 200, null);
	} catch (error) {
		console.log("Error while updating department", error.message);
		return apiResponseHandler.errorResponse(error, req, res, "Some internal server error", 500, null);
	}
};

const createDepartmentObject = (req) => {
	return {
		name: req.body.name,
		businessUnit: req.businessUnit,
		isEnabled: req.body.isEnabled ? req.body.isEnabled : true,
		createdBy: req.userId,
		updatedBy: req.userId
	};
};

const updateDepartmentObject = (req) => {
	const updateObject = {
		updatedBy: req.userId
	};
	if (req.body.name) {
		updateObject.name = req.body.name;
	}
	if (req.body.isEnabled !== undefined) {
		updateObject.isEnabled = req.body.isEnabled;
	}
	return updateObject;
};
