const {LogEntryModel}  = require("../models/mongoDB/logManagement/logEntry_model")
const {LogTemplateModel} = require("../models/mongoDB/logManagement/template_model");



async function fixMissingIsMandatoryInLogEntries() {
    try {
    //   const collection = db.collection('logEntries'); // uses globally available `db`
      const batchSize = 500;
      let totalUpdated = 0;
      let bulkOps = [];
  
      const cursor = LogEntryModel.find({
        data: { $elemMatch: { isMandatory: { $exists: false } } }
      });
  
      for await (const doc of cursor) {
        const updatedData = doc.data.map(entry => {
          if (entry.isMandatory === undefined) {
            return { ...entry, isMandatory: true };
          }
          return entry;
        });
  
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { data: updatedData } }
          }
        });
  
        // Execute in batches
        if (bulkOps.length >= batchSize) {
          const result = await LogEntryModel.bulkWrite(bulkOps);
          totalUpdated += result.modifiedCount;
          // console.log(`Batch updated: ${result.modifiedCount}`);
          bulkOps.length = 0; // clear the array
        }
      }
  
      // Final remaining ops
      if (bulkOps.length > 0) {
        const result = await LogEntryModel.bulkWrite(bulkOps);
        totalUpdated += result.modifiedCount;
        // console.log(`Final batch updated: ${result.modifiedCount}`);
    }
    
    console.log(`Finished. Total documents updated: ${totalUpdated}`);

} catch (error) {
    console.error('Error in fixMissingIsMandatoryInLogEntries:', error);
}
}


async function fixMissingIsMandatoryInLogTemplates() {
    try {
      const templates = await LogTemplateModel.find({
        dataSets: { $elemMatch: { isMandatory: { $exists: false } } }
      }).lean();
  
      let totalUpdated = 0;
  
      for (const doc of templates) {
        const updatedDataSets = doc.dataSets.map(entry => {
          if (entry.isMandatory === undefined) {
            return { ...entry, isMandatory: true };
          }
          return entry;
        });
  
        const result = await LogTemplateModel.updateOne(
          { _id: doc._id },
          { $set: { dataSets: updatedDataSets } }
        );
  
        if (result.modifiedCount > 0) {
          totalUpdated += result.modifiedCount;
        }
      }
  
      console.log(`Finished. Total logTemplates updated: ${totalUpdated}`);
    } catch (error) {
      console.error('Error in fixMissingIsMandatoryInLogTemplates:', error);
    }
  }



  module.exports = {
    fixMissingIsMandatoryInLogEntries,
    fixMissingIsMandatoryInLogTemplates
  }



