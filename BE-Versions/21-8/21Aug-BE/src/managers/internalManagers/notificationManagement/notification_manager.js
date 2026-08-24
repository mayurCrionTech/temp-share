const { mongoDbManager } = require("../../dBManagers");
const mongoose = require('mongoose')
const User = require("../../../models/mongoDB/userManagement/user_model");
const Notification = require("../../../models/mongoDB/notificationManagement/notification_model");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = Notification;

async function createNotificationForUserTypes(userTypes, data) {
  try{
  const users = await mongoDbManager.findManyWithPopulate(User, {
    userType: { $in: userTypes },
  });
  const userIds = users.map((user) => user._id);
  const documents = userIds.map((userId) => ({ ...data, receiver: userId }));
  const createdNotification = await mongoDbManager.insertMany(Model, documents);
  return createdNotification;
}catch(error){
  throw error;
}
}

async function createNotificationForUserId(userId, data) {
  try {
    const documents = { ...data, receiver: userId };
    createdNotification = await mongoDbManager.insertOne(Model, documents);
    return createdNotification;
  } catch (error) {
    throw error;
  }
}

async function fetchNotifications(userId, reqData, businessUnit) {
  try {
    const query = {
      receiver: userId,
      businessUnit: new mongoose.Types.ObjectId(businessUnit)
    };
    const page = parseInt(reqData.page) || 1;
    const limit = parseInt(reqData.limit) || 0;
    const skip = (page - 1) * limit;
    const sort = reqData.sort || "createdAt";
    const order = reqData.order === "asc" ? 1 : -1;
    const sortOrder = { [sort]: order };
    const selectFields = [
      "activity",
      "message",
      "moduleDetails",
      "moduleName",
      "sender",
      "receiver",
      "isRead",
      "createdAt",
    ];
    const populateFields = getPopulateOptions(["sender","receiver"], "_id name")
    const countData = await mongoDbManager.count(Model, query);
    if (limit === 0 && page > 1) {
      // Return an appropriate response for your use case
      return paginationHandler.paginationResObj(page, 1, countData, []);
    }
    let data = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      limit,
      skip,
      sortOrder,
      selectFields,
      populateFields
    );
    if (data) {
      data = data.map((result) => {
        const { _id, ...rest } = result;
        return { ...rest, id: _id };
      });
    }
    const totalPages =
      countData === 0 ? 0 : limit === 0 ? 1 : Math.ceil(countData / limit);
    return paginationHandler.paginationResObj(
      page,
      totalPages,
      countData,
      data
    );
  } catch (error) {
    throw error;
  }
}

async function updateNotifications(NotificationIds, bool = true) {
  try {
    const notifications = await mongoDbManager.updateMany(
      Model,
      { _id: { $in: NotificationIds } },
      { $set: { isRead: true } }
    );
  } catch (error) {
    throw error;
  }
}

async function returnInvalidNotifications(ids) {
  try { 
    let invalidNotifications = ids.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    
    if (invalidNotifications.length > 0) {
      return invalidNotifications;
    }
    const query = {
      _id: { $in: ids }
    };
    const existingNotifications = await mongoDbManager.findManyWithPopulate(
      Model,
      query,
      null,
      null,
      null,
      "_id",
      []
    );

    const validNotifications = existingNotifications.map(
      (existingSpare) => existingSpare._id.toString()
    );

    invalidNotifications.push(
      ...ids.filter((id) => !validNotifications.includes(id))
    );

    return Array.from(new Set(invalidNotifications));
  } catch (err) {
    throw err;
  }
}

function getPopulateOptions(
  populateFields,
  defaultSelectFields = "_id name"
) {
  let populateOptions = [];
  // Populate each field with the default select fields
  populateFields.forEach((field) => {
    if (Model.schema.path(field)) {
      // Get the select fields for the current field
      let selectFields = defaultSelectFields

      // Push the populate object into the options array
      populateOptions.push({ path: field, select: selectFields });
    }
  });

  return populateOptions;
}

async function getUnReadCount (userId, businessUnit) {
  try{
    const countIsRead = await mongoDbManager.count(Model, {isRead: false, receiver: userId, businessUnit: businessUnit});
    return countIsRead;
  }catch(error){
    throw error;
  }
}

module.exports = {
  createNotificationForUserTypes,
  createNotificationForUserId,
  updateNotifications,
  fetchNotifications,
  returnInvalidNotifications,
  getUnReadCount,
};
