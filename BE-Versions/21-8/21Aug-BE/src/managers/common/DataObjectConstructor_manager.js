const mongoose = require('mongoose')

exports.constructNotification = function (activity, message, moduleDetails, moduleName, sender, businessUnit){
    if (
        typeof activity !== "string" ||
        typeof message !== "string" ||
        typeof moduleName !== "string"
      ) {
        throw new Error(
          "Invalid Notification Data. Please provide valid String for activity, message, objectName."
        );
      }
      if (!mongoose.Types.ObjectId.isValid(moduleDetails.id) || !mongoose.Types.ObjectId.isValid(sender)){
        throw new Error(
            "Invalid objectId or triggeredBy"
          );
      }
    return {
    activity,
    message,
    moduleDetails,
    moduleName,
    sender,
    isRead: false,
    createdTime: new Date(),
    businessUnit: businessUnit,
    }
};

exports.constructActivity = function (message,moduleDetails,moduleName,updateDoneBy){
    if(
        typeof message !== "string" ||
        typeof moduleName !== "string"
    ){
        throw new Error(
          "Invalid Activity Data. Please provide valid String for message, moduleName."
        );
    }
    if (!mongoose.Types.ObjectId.isValid(moduleDetails.id) || !mongoose.Types.ObjectId.isValid(updateDoneBy)){
        throw new Error(
            "Invalid objectId or updateDoneBy"
          );
      }
      return {
        message,
        moduleDetails: moduleDetails,
        moduleName: moduleName,
        updateDoneBy: updateDoneBy,
        createdTime: new Date()
        }
}

exports.constructHistory = function (name, description, asset, eventDate, status, workOrder, moduleName, businessUnit){
  if(
    typeof name !== "string" ||
    typeof description !== "string"
){
    throw new Error(
      "Invalid History Data. Please provide valid String for name, description."
    );
  }
  return {
    name,
    description,
    asset,
    eventDate : eventDate,
    status,
    moduleId: workOrder,
    moduleName:moduleName,
    businessUnit: businessUnit,

  }
}


