async function insertOne(Model, data) {
  // Insert a single document using insertOne
  return Model.create(data);
}

async function insertMany(Model, data) {
  // Insert multiple documents using insertMany
  return Model.insertMany(data);
}

async function findOne(Model, query, projection) {
  // Find a single document using findOne
  return Model.findOne(query, projection);
}

async function findMany(
  Model,
  query,
  pageNumber = 1,
  pageSize = 10,
  sort = {},
  sortOrder = "asc",
  projection
) {
  // Calculate the number of documents to skip
  const skip = (pageNumber - 1) * pageSize;

  // Define the sort object based on the sortOrder parameter
  const sortObject = {};
  for (const field in sort) {
    sortObject[field] = sortOrder === "asc" ? 1 : -1;
  }

  // Find multiple documents using find with pagination and sorting
  return Model.find(query, projection)
    .sort(sortObject)
    .skip(skip)
    .limit(pageSize);
}

async function findOneWithPopulate(
  Model,
  query,
  selectFields = "",
  populateFields = []
) {
  try {
    // Start building the query object
    let queryObject = Model.findOne(query);

    // Apply field selection if specified
    if (selectFields) {
      queryObject = queryObject.select(selectFields);
    }

    // Apply population if specified
    if (populateFields.length > 0) {
      populateFields.forEach((populateField) => {
        const { path, select } = populateField;
        if (Model.schema.path(path)) {
          queryObject = queryObject.populate({
            path,
            select: select || "", // Use provided select or an empty string
            options: {
              lean: true,
              transform: (doc) => {
                if (!doc) return null; // Return null if doc is null
                // Rename _id to id within the populated item
                const { _id, ...rest } = doc;
                return { ...rest, id: _id };
              }
            }
          });
        }
      });
    }

    // Execute the query and get results
    let result = await queryObject.lean();
    return result;
    //   if (result) {
    //     const { _id, ...rest } = result;
    //     return { ...rest, id: _id };
    // }
    //   return null;
  } catch (error) {
    console.error(`Error in get${Model}:`, error);
    return null;
  }
}

async function fetchAllAndPopulate(
  Model,
  query,
  fieldMappings = {},
  limit = 10,
  page = 1,
  sortOrder = { ["createdAt"]: -1 },
  populateFields = [],
  selectFields = []
) {
  try {
    const idField = "_id";
    const pipeline = [{ $match: query }]; // Stage 1: Match

    if (selectFields.length > 0) {
      const projectFields = Object.fromEntries(selectFields.map((field) => [field, 1]));
      if (populateFields.length > 0) {
        projectFields["_id"] = 1;
    }
      pipeline.push({ $project: projectFields }); // Stage 2: Project
    }

    // Populate fields similar to buildSingleAggregationPipeline
    populateFields.forEach((field) => {
      const mapping = fieldMappings[field];
      if (!mapping) {
        throw new Error(`Please enter correct Fieldname: ${field}`);
      }
      const { localField, collection, fieldsToInclude, isArray, subFields } = mapping;

      const lookupPipeline = [
        { $match: { $expr: { $in: [`$_id`, `$$localIds`] } } },
        { $addFields: { id: `$_id` } },
        {
          $project: fieldsToInclude.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
          }, { _id: 0, id: 1 }) // Ensure 'id' is included
        }
      ];

      // Handle sub-fields similarly to buildSingleAggregationPipeline
      if (subFields && subFields.length > 0) {
        subFields.forEach((subField) => {
          const { localField: subLocalField, collection: subCollection, fieldsToInclude: subFieldsToInclude, isArray: subIsArray } = subField;

          const subLookupPipeline = [
            { $match: { $expr: { $eq: [`$_id`, `$$subLocalId`] } } },
            { $addFields: { id: `$_id` } },
            {
              $project: subFieldsToInclude.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
              }, { _id: 1, id: 1 }) // Ensure 'id' is included
            }
          ];

          lookupPipeline.push(
            {
              $lookup: {
                from: subCollection,
                let: { subLocalId: `$${subLocalField}` },
                pipeline: subLookupPipeline,
                as: subLocalField,
              },
            },
            {
              $addFields: {
                [subLocalField]: {
                  $cond: {
                    if: { $eq: [{ $type: `$${subLocalField}` }, "array"] },
                    then: subIsArray ? `$${subLocalField}` : { $arrayElemAt: [`$${subLocalField}`, 0] },
                    else: `$${subLocalField}`
                  }
                }
              }
            }
          );
        });
      }

      // Lookup and add fields for primary field
      pipeline.push(
        {
          $lookup: {
            from: collection,
            let: {
              localIds: {
                $cond: {
                  if: { $eq: [{ $type: `$${localField}` }, "array"] },
                  then: `$${localField}`,
                  else: { $cond: { if: { $ne: [`$${localField}`, null] }, then: [`$${localField}`], else: [] } }
                }
              }
            },
            pipeline: lookupPipeline,
            as: localField,
          },
        }
      );

      if (isArray) {
        pipeline.push(
          {
            $addFields: {
              [localField]: {
                $cond: {
                  if: { $eq: [{ $type: `$${localField}` }, "array"] },
                  then: `$${localField}`,
                  else: [`$${localField}`]
                }
              }
            }
          }
        );
      } else {
        pipeline.push(
          {
            $addFields: {
              [localField]: {
                $cond: {
                  if: { $and: [{ $eq: [{ $type: `$${localField}` }, "array"] }, { $gt: [{ $size: `$${localField}` }, 1] }] },
                  then: `$${localField}`,
                  else: { $arrayElemAt: [`$${localField}`, 0] }
                }
              }
            }
          }
        );
      }
    });

    // Pagination, Sorting, and Limit
    pipeline.push(
      { $sort: sortOrder },    // Stage 3: Sorting
      { $skip: (page - 1) * limit }, // Stage 4: Pagination (Skip)
      { $limit: limit }    // Stage 5: Limit
    );

    const assets = await aggregation(Model, pipeline);
    return assets;    
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
}


async function buildSingleAggregationPipeline(
  Model,
  id,
  query = {},
  fieldMappings = {},
  populateFields = [],
  selectFields = []
) {
  try {
    const pipeline = [{ $match: { _id: id, ...query } }];

    if (selectFields.length > 0) {
      pipeline.push({
        $project: Object.fromEntries(selectFields.map((field) => [field, 1])),
      });
    }

    populateFields.forEach((field) => {
      const mapping = fieldMappings[field];
      if (!mapping) {
        throw new Error(`Please enter correct Fieldname: ${field}`);
      }
      const { localField, collection, fieldsToInclude, isArray, subFields } = mapping;

      const lookupPipeline = [
        { $match: { $expr: { $in: [`$_id`, `$$localIds`] } } },
        { $addFields: { id: `$_id` } },
        {
          $project: fieldsToInclude.reduce((acc, field) => {
            acc[field] = 1;
            return acc;
          }, { _id: 0, id: 1 }) // Ensure 'id' is included
        }
      ];

      // Handle sub-fields
      if (subFields && subFields.length > 0) {
        subFields.forEach((subField) => {
          const { localField: subLocalField, collection: subCollection, fieldsToInclude: subFieldsToInclude, isArray: subIsArray } = subField;

          const subLookupPipeline = [
            { $match: { $expr: { $eq: [`$_id`, `$$subLocalId`] } } },
            { $addFields: { id: `$_id` } },
            {
              $project: subFieldsToInclude.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
              }, { _id: 1, id: 1 }) // Ensure 'id' is included
            }
          ];

          lookupPipeline.push(
            {
              $lookup: {
                from: subCollection,
                let: { subLocalId: `$${subLocalField}` },
                pipeline: subLookupPipeline,
                as: subLocalField,
              },
            },
            {
              $addFields: {
                [subLocalField]: {
                  $cond: {
                    if: { $eq: [{ $type: `$${subLocalField}` }, "array"] },
                    then: subIsArray ? `$${subLocalField}` : { $arrayElemAt: [`$${subLocalField}`, 0] },
                    else: `$${subLocalField}`
                  }
                }
              }
            }
          );
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: collection,
            let: {
              localIds: {
                $cond: {
                  if: { $eq: [{ $type: `$${localField}` }, "array"] },
                  then: `$${localField}`,
                  else: { $cond: { if: { $ne: [`$${localField}`, null] }, then: [`$${localField}`], else: [] } }
                }
              }
            },
            pipeline: lookupPipeline,
            as: localField,
          },
        }
      );

      if (isArray) {
        pipeline.push(
          {
            $addFields: {
              [localField]: {
                $cond: {
                  if: { $eq: [{ $type: `$${localField}` }, "array"] },
                  then: `$${localField}`,
                  else: [`$${localField}`]
                }
              }
            }
          }
        );
      } else {
        pipeline.push(
          {
            $addFields: {
              [localField]: {
                $cond: {
                  if: { $and: [{ $eq: [{ $type: `$${localField}` }, "array"] }, { $gt: [{ $size: `$${localField}` }, 1] }] },
                  then: `$${localField}`,
                  else: { $arrayElemAt: [`$${localField}`, 0] }
                }
              }
            }
          }
        );
      }
    });

    const result = await aggregation(Model, pipeline);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error building single asset pipeline:", error);
    throw error;
  }
}


async function findOneAndPopulate(Model, query, projection, populatefields){
  return Model.findOne(query, projection).populate(populatefields);
}

async function findManyAndPopulate(Model, query, projection, populatefields){
  return Model.find(query, projection).populate(populatefields);
}





async function findManyWithPopulate(
  Model,
  query,
  limit = null,
  skip = null,
  sort = {},
  selectFields = "",
  populateFields = []
) {
  // Start building the query object
  let queryObject
  if (limit > 0) {
    queryObject = Model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      ;
  }
  else {
    queryObject = Model.find(query).sort(sort);
  }

  // Apply field selection if specified
  if (selectFields) {
    queryObject = queryObject.select(selectFields);
  }

  // Apply population if specified
  if (populateFields.length > 0) {
    populateFields.forEach((populateField) => {
      const { path, select } = populateField;

      if (Model.schema.path(path)) {
        queryObject = queryObject.populate({
          path,
          select: select || "_id generalDetails.name name", // Use provided select or an empty string
          options: {
            lean: true,
            transform: (doc) => {
              if (!doc) return null; // Return null if doc is null
              // Rename _id to id within the populated item
              const { _id, ...rest } = doc;
              return { id: _id, ...rest };
            }
          }
        });
      }
    });
  }

  // Execute the query and get results
  const results = await queryObject.lean();
  return results;

  //To be handeled in module manager
  // Transform the results to replace _id with id
  return results.map(result => {
    const { _id, ...rest } = result;
    return { ...rest, id: _id };
  });
}

async function aggregation(Model, aggregationPipeline) {
  return Model.aggregate(aggregationPipeline);
}

async function updateOne(Model, query, updateObject) {
  // Update a single document using updateOne
  return Model.updateOne(query, updateObject);
}

async function updateMany(Model, query, updateObject) {
  // Update multiple documents using updateMany
  return Model.updateMany(query, updateObject);
}

async function updateOneEntireDocument(Model, query, updateObject) {
  // Update a single document using updateOne
  return Model.updateOne(query, updateObject);
}

async function updateManyEntireDocument(Model, query, updateObject) {
  // Update multiple documents using updateMany
  return Model.updateMany(query, updateObject);
}

async function deleteOne(Model, query) {
  // Delete a single document using deleteOne
  return Model.deleteOne(query);
}

async function deleteMany(Model, query) {
  // Delete multiple documents using deleteMany
  return Model.deleteMany(query);
}

async function findOneAndUpdate(Model, query, updateObject, options = {}) {
  // Find a document and update it using findOneAndUpdate
  return Model.findOneAndUpdate(query, { $set: updateObject }, options);
}

async function bulkWrite(Model, bulkUpdateOperations) {
  return await Model.bulkWrite(bulkUpdateOperations);
}

async function count(Model, query) {
  return Model.countDocuments(query);
}

async function findOneLastEntry(Model, query) {
  return Model.findOne(query).sort({ _id: -1 }).exec()
}

async function findAll(Model, query, projection) {
  return Model.find(query, projection)
}

async function findDistinct(Model, query) {
  return Model.distinct(query)
}


module.exports = {
  updateOneEntireDocument,
  updateManyEntireDocument,
  updateOne,
  aggregation,
  buildSingleAggregationPipeline,
  fetchAllAndPopulate,
  updateMany,
  findOneAndUpdate,
  deleteOne,
  deleteMany,
  findOne,
  findMany,
  findOneWithPopulate,
  findManyWithPopulate,
  insertOne,
  insertMany,
  bulkWrite,
  count,
  findOneLastEntry,
  findAll,
  findDistinct,
  findOneAndPopulate,
  findManyAndPopulate,
};
