const {LogTemplateModel} = require("../../models/mongoDB/logManagement/template_model")
const {LogEntryModel} = require("../../models/mongoDB/logManagement/logEntry_model")

async function updateLogEntriesIsFormula() {
  try {
    // Step 1: Build the template map
    const templateMap = {};
    const templates = await LogTemplateModel.find({ "dataSets.formula": { $exists: true } }, { dataSets: 1 }).lean(); 
    for (const template of templates) {
      const formulas = {};
      (template.dataSets || []).forEach((field) => {
        formulas[field.fieldName] = Object.prototype.hasOwnProperty.call(
          field,
          "formula"
        );
      });
      templateMap[String(template._id)] = formulas;
    }

    // Step 2: Batch update logentries where isFormula is missing
    const batchSize = 5000;
    let totalUpdated = 0;
    let lastId = null;
    let updatedTrue = 0;
    let updatedFalse = 0;

    while (true) {
      const query = lastId ? { _id: { $gt: lastId } } : {};
      const entries = await LogEntryModel.find(query) // ✅ no .toArray()
        .sort({ _id: 1 })
        .limit(batchSize)
        .lean();
      if (entries.length === 0) break;
      const bulkOps = [];
      for (const entry of entries) {
        lastId = entry._id;
        const templateId = String(entry.templateId);
        const formulas = templateMap[templateId];
        if (!formulas || !Array.isArray(entry.data)) continue;

        for (const field of entry.data) {
          if (Object.prototype.hasOwnProperty.call(field, "isFormula")) continue; // Skip if already present
          const fieldName = field.fieldName;
          const isFormula = formulas[fieldName] || false;

          if (isFormula) updatedTrue++;
          else updatedFalse++;

          bulkOps.push({
            updateOne: {
              filter: { _id: entry._id, "data.fieldName": fieldName },
              update: { $set: { "data.$[elem].isFormula": isFormula } },
              arrayFilters: [
                {
                  "elem.fieldName": fieldName,
                  "elem.isFormula": { $exists: false }, // only if missing
                },
              ],
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        const result = await LogEntryModel.bulkWrite(bulkOps);
        totalUpdated += result.modifiedCount;
        console.log(
          `Batch updated: ${result.modifiedCount}, Total updated: ${totalUpdated}`
        );
      }
    }

    console.log(`✅ Finished. Total fields updated: ${totalUpdated}`);
    console.log(
      `👉 Of these, ${updatedTrue} set to true, ${updatedFalse} set to false`
    );
  } catch (err) {
    console.error("Error occurred:", err);
  }
}



module.exports = {
    updateLogEntriesIsFormula
}