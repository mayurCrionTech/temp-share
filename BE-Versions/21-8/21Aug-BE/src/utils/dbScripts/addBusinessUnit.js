const mongoose = require('mongoose');


async function updateBusinessUnitForCollection(collectionName, localField) {
  try {
    const db = mongoose.connection;

    const result = await db.collection(collectionName).aggregate([
      {
        $match: {
          $or: [
            { businessUnit: { $exists: false } },
            { businessUnit: null }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: localField,
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $set: {
          businessUnit: {
            $ifNull: [
              '$businessUnit',
              { $first: '$userDetails.businessUnit' }
            ]
          }
        }
      },
      {
        $unset: 'userDetails'
      },
      {
        $merge: {
          into: collectionName,
          whenMatched: 'merge'
        }
      }
    ]).toArray(); // Forces execution
    console.log(`Updated businessUnit in '${collectionName}' collection successfully.`);
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
  }
}

async function addBusinessUnitForCollectionUsingAssetId(collectionName){
    try{
    const db = mongoose.connection;

        const result = await db.collection(collectionName).aggregate([
          {
            $match: {
              $or: [
                { businessUnit: { $exists: false } },
                { businessUnit: null }
              ]
            }
          },
          {
            $lookup: {
              from: "assets",
              localField: "asset",
              foreignField: "_id",
              as: "assetDetails"
            }
          },
          {
            $set: {
              businessUnit: {
                $ifNull: [
                  "$businessUnit",
                  { $first: "$assetDetails.generalDetails.businessUnit" }
                ]
              }
            }
          },
          {
            $unset: "assetDetails"
          },
          {
            $merge: {
              into: collectionName,
              whenMatched: "merge",
              whenNotMatched: "discard"
            }
          }
        ]).toArray(); // Forces execution
    console.log(`Updated businessUnit in '${collectionName}' collection successfully.`);
    }catch(error){
    console.error(`Error adding ${collectionName}:`, error);
    }
}


async function updateBusinessUnits() {
  // List of user-based updates
  const userBasedCollections = [
    { collection: 'activities', field: 'updateDoneBy' },
    { collection: 'assetParameters', field: 'createdBy' },
    { collection: 'spareAndInventories', field: 'createdBy' },
    { collection: 'notifications', field: 'sender' },
    { collection: 'userPermissions', field: 'createdBy' }
  ];

  for (const { collection, field } of userBasedCollections) {
    await updateBusinessUnitForCollection(collection, field);
  }
  // Asset-based update
  await addBusinessUnitForCollectionUsingAssetId('assetHistories');
}


module.exports = {
    updateBusinessUnits
}