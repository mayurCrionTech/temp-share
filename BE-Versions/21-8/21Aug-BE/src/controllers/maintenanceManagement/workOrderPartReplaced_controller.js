const apiResponseHandler = require("../../managers/common/apiResponseHandler_manager");
const workOrderPartReplacedManager = require("../../managers/internalManagers/maintenanceManagement/workOrderPartReplaced_manager");
const fileManager = require("../../managers/internalManagers/fileSystem/fileSystem_manager");

exports.createWorkOrderPartReplaced = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const result = { data: [] };
    const workOrderPartReplacedObj = workOrderPartReplacedObject(req);
    const createdworkOrderPartReplaced =
      await workOrderPartReplacedManager.createWorkOrderPartReplaced(
        workOrderPartReplacedObj, req.userId
      );
    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          null,
          "spareReplaced",
          createdworkOrderPartReplaced._id,
          req.userId,
          req.businessUnit
        );
        let responseObj;

        if (returnMetaData && returnMetaData != "false") {
          responseObj = await fileManager.transformFileObj(createdFile);
        } else {
          responseObj = { id: createdFile._id };
        }

        if (
          createdFile.extension === "jpg" ||
          createdFile.extension === "jpeg" ||
          createdFile.extension === "png"
        ) {
          const transformFile = await fileManager.transformFileObj(
            createdFile,
            "download",
            req.get("host"),
            req.protocol
          );
          responseObj.url = transformFile.url;
        }

        result.data.push(responseObj);
      } catch (error) {
        result.failures = [];
        // Handle individual file upload errors
        const fileNameWithoutExtension = req.files[i].originalname
          .split(".")
          .slice(0, -1)
          .join(".");
        result.failures.push({
          name: fileNameWithoutExtension,
          extension: req.files[i].originalname.split(".").pop(),
          arrayPosition: i,
        });
      }
    }
    if (result.failures?.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Images uploaded partially",
        207,
        result
      );
    }
    const imageIds = result.data.map((image) => image.id);
    await workOrderPartReplacedManager.updateSpareReplacedAdded(
      createdworkOrderPartReplaced._id,
      imageIds
    );
    const responseObject = {
      id: createdworkOrderPartReplaced._id,
    };
    return apiResponseHandler.successResponse(
      res,
      "SpareReplaced requested successfully",
      201,
      responseObject
    );
  } catch (error) {
    console.log(error);
     if (error.name === "ValidationError") {
                const errors = Object.values(error.errors).map((error) => error.message);
                const errorObject = { "Validation error": errors.join(", ") };
                console.log("Validation error: " + errors.join(", "));
                return apiResponseHandler.errorResponse(error, req,
                  res,
                  errors.join(", "),
                  400,
                  null
                );
              }
    return apiResponseHandler.errorResponse(
          error,
          req,
          res,
          error.message || "Some internal server error",
          500
        );
  }
};


exports.fetchWorkOrderPartsReplaced = async (req, res) => {
  try {
    const getSpareData = await workOrderPartReplacedManager.getPartsReplaced(
      req.query,
      req.workOrder,
      req.businessUnit
    );

    return apiResponseHandler.successResponse(
      res,
      "SpareReplaced Fetched successfully",
      200,
      getSpareData
    );
  } catch (error) {
    console.error("Error in fetchWorkOrderPartsReplaced:", error);

    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internal server error",
      500
    );
  }
};


exports.addImages = async (req, res) => {
  try {
    const returnMetaData = req.query.returnMetaData;
    const result = { data: [] };

    for (let i = 0; i < req.files.length; i++) {
      try {
        const createdFile = await fileManager.uploadFile(
          req.files[i],
          null,
          "spareReplaced",
          req.spareReplaced,
          req.userId,
          req.businessUnit
        );
        let responseObj;

        if (returnMetaData && returnMetaData != "false") {
          responseObj = await fileManager.transformFileObj(createdFile);
        } else {
          responseObj = { id: createdFile._id };
        }

        if (
          createdFile.extension === "jpg" ||
          createdFile.extension === "jpeg" ||
          createdFile.extension === "png"
        ) {
          const transformFile = await fileManager.transformFileObj(
            createdFile,
            "download",
            req.get("host"),
            req.protocol
          );
          responseObj.url = transformFile.url;
        }

        result.data.push(responseObj);
      } catch (error) {
        result.failures = [];
        // Handle individual file upload errors
        const fileNameWithoutExtension = req.files[i].originalname
          .split(".")
          .slice(0, -1)
          .join(".");
        result.failures.push({
          name: fileNameWithoutExtension,
          extension: req.files[i].originalname.split(".").pop(),
          arrayPosition: i,
        });
      }
    }
    if (result.failures?.length > 0) {
      return apiResponseHandler.successResponse(
        res,
        "Images uploaded partially",
        207,
        result
      );
    }
    const imageIds = result.data.map((image) => image.id);
    await workOrderPartReplacedManager.updateSpareReplacedAdded(
      req.spareReplaced,
      imageIds
    );

    return apiResponseHandler.successResponse(
      res,
      "Images uploaded successfully",
      201,
      result
    );
  } catch (error) {
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      error.message,
      500,
      null
    );
  }
};

exports.getImages = async (req, res) => {
  try{
    const reqQuery = req.query
    const getWorkOrderSpareReplaced = await workOrderPartReplacedManager.getImagesForSpareReplaced(
      reqQuery,
      req.spareReplaced,
      req.get("host"),
      req.protocol,
      req.workOrder,
    );
    // if (getWorkOrderSpareReplaced.images && getWorkOrderSpareReplaced.images.length > 0) {
    //   const fileDocuments = [];
    //   for (let document of getWorkOrderSpareReplaced.images) {
    //     const images = await fileManager.transformFileObj(
    //       document,
    //       "download",
    //       req.get("host"),
    //       req.protocol
    //     );
    //     fileDocuments.push(images);
    //   }
    //   getWorkOrderSpareReplaced.images = fileDocuments;
    // }
    return apiResponseHandler.successResponse(res, "Images for SpareReplaced fetched successfully", 200, getWorkOrderSpareReplaced);
  }catch(error){
    console.log("error",error)
    return apiResponseHandler.errorResponse(
      error,
      req,
      res,
      "Some internel server error",
      500,
      null
    );
  }
};

const workOrderPartReplacedObject = (req) => {
    return {
        workOrder : req.workOrder,
        businessUnit : req.businessUnit,
        spare : req.spare,
        replacedQuantity : Number(req.body.replacedQuantity),
        spareRequested: req.spareRequested,
        images : req.body.images? JSON.parse(req.body.images): [],
        // images: Array.isArray(req.body.images) ? req.body.images:[req.body.images],
        remarks: req.body.remarks,
        createdBy : req.userId,
        updatedBy : req.userId,
        createdAt : Date.now(),
        updatedAt : Date.now()
    }
}


