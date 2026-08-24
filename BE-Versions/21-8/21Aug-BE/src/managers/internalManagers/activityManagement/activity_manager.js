const { mongoDbManager } = require("../../dBManagers");
const Activity = require("../../../models/mongoDB/activityManagement/activity_model");
const paginationHandler = require("../../common/paginationHandler_manager");
const Model = Activity;

async function createActivity(data, businessUnit) {
  data.businessUnit = businessUnit
    const createdNotification = await mongoDbManager.insertOne(Model, data);
    return createdNotification;
  }

  async function fetchActivities(userId, reqData, businessUnit) {
    try {
      const query = {
        updateDoneBy: userId,
        businessUnit: businessUnit,
        isActive: true
      };
      const page = parseInt(reqData.page) || 1;
      const limit = parseInt(reqData.limit) || 0;
      const skip = (page - 1) * limit;
      const sort = reqData.sort || "createdAt";
      const order = reqData.order === "asc" ? 1 : -1;
      const sortOrder = { [sort]: order };
      const selectFields = [
        "message",
        "moduleDetails",
        "moduleName",
        "updateDoneBy",
        "createdAt",
      ];
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
        selectFields
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


module.exports = {
    createActivity,
    fetchActivities
}