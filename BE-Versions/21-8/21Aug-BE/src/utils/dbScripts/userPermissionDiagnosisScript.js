const mongoose = require('mongoose');

async function identifyBrokenUserPermissions() {
  try {
    const db = mongoose.connection;
    
    console.log('Identifying broken user permissions...');
    
    // Find user permissions with broken references
    const brokenUserPermissions = await db.collection('userPermissions').aggregate([
      {
        $lookup: {
          from: 'permissions',
          localField: 'positivePermissions',
          foreignField: '_id',
          as: 'validPositive'
        }
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'negativePermissions',
          foreignField: '_id',
          as: 'validNegative'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          positiveCount: { $size: '$positivePermissions' },
          validPositiveCount: { $size: '$validPositive' },
          negativeCount: { $size: '$negativePermissions' },
          validNegativeCount: { $size: '$validNegative' },
          userName: { $first: '$userDetails.name' },
          userEmail: { $first: '$userDetails.email' }
        }
      },
      {
        $match: {
          $or: [
            { $expr: { $ne: ['$positiveCount', '$validPositiveCount'] } },
            { $expr: { $ne: ['$negativeCount', '$validNegativeCount'] } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          userName: 1,
          userEmail: 1,
          businessUnit: 1,
          positivePermissions: 1,
          negativePermissions: 1,
          validPositive: { $map: { input: '$validPositive', as: 'perm', in: '$$perm._id' } },
          validNegative: { $map: { input: '$validNegative', as: 'perm', in: '$$perm._id' } },
          positiveCount: 1,
          validPositiveCount: 1,
          negativeCount: 1,
          validNegativeCount: 1,
          brokenPositivePermissions: {
            $setDifference: ['$positivePermissions', { $map: { input: '$validPositive', as: 'perm', in: '$$perm._id' } }]
          },
          brokenNegativePermissions: {
            $setDifference: ['$negativePermissions', { $map: { input: '$validNegative', as: 'perm', in: '$$perm._id' } }]
          }
        }
      }
    ]).toArray();
    
    console.log(`Found ${brokenUserPermissions.length} user permissions with broken references:`);
    
    for (const userPerm of brokenUserPermissions) {
      console.log('\n--- Broken User Permission ---');
      console.log(`User ID: ${userPerm.user}`);
      console.log(`User Name: ${userPerm.userName || 'N/A'}`);
      console.log(`User Email: ${userPerm.userEmail || 'N/A'}`);
      console.log(`UserPermission ID: ${userPerm._id}`);
      console.log(`Business Unit: ${userPerm.businessUnit}`);
      
      if (userPerm.brokenPositivePermissions.length > 0) {
        console.log(`Broken Positive Permissions (${userPerm.brokenPositivePermissions.length}):`, 
                   userPerm.brokenPositivePermissions.map(id => id.toString()));
      }
      
      if (userPerm.brokenNegativePermissions.length > 0) {
        console.log(`Broken Negative Permissions (${userPerm.brokenNegativePermissions.length}):`, 
                   userPerm.brokenNegativePermissions.map(id => id.toString()));
      }
      
      console.log(`Valid Positive Permissions: ${userPerm.validPositiveCount}/${userPerm.positiveCount}`);
      console.log(`Valid Negative Permissions: ${userPerm.validNegativeCount}/${userPerm.negativeCount}`);
    }
    
    return brokenUserPermissions;
    
  } catch (error) {
    console.error('Error identifying broken user permissions:', error);
    throw error;
  }
}

async function fixBrokenUserPermissions(action = 'clean') {
  try {
    const db = mongoose.connection;
    
    // Get admin user ID
    const adminUser = await db.collection('users').findOne({ email: 'admin@criontech.com' });
    if (!adminUser) {
      throw new Error('Admin user with email admin@criontech.com not found');
    }
    const adminUserId = adminUser._id;
    
    console.log(`Starting to fix broken user permissions with action: ${action}`);
    
    // Get broken user permissions
    const brokenUserPermissions = await identifyBrokenUserPermissions();
    
    if (brokenUserPermissions.length === 0) {
      console.log('No broken user permissions found!');
      return { fixed: 0, removed: 0 };
    }
    
    let fixedCount = 0;
    let removedCount = 0;
    const bulkOps = [];
    
    for (const userPerm of brokenUserPermissions) {
      if (action === 'clean') {
        // Clean broken references, keep valid ones
        const cleanUpdate = {
          $set: {
            positivePermissions: userPerm.validPositive || [],
            negativePermissions: userPerm.validNegative || [],
            updatedAt: new Date(),
            updatedBy: adminUserId
          }
        };
        
        bulkOps.push({
          updateOne: {
            filter: { _id: userPerm._id },
            update: cleanUpdate
          }
        });
        fixedCount++;
        
      } else if (action === 'remove') {
        // Remove the entire user permission document
        bulkOps.push({
          deleteOne: {
            filter: { _id: userPerm._id }
          }
        });
        removedCount++;
        
      } else if (action === 'soft-delete') {
        // Soft delete the user permission
        bulkOps.push({
          updateOne: {
            filter: { _id: userPerm._id },
            update: {
              $set: {
                isDeleted: true,
                updatedAt: new Date(),
                updatedBy: adminUserId
              }
            }
          }
        });
        removedCount++;
      }
    }
    
    // Execute bulk operations
    if (bulkOps.length > 0) {
      const result = await db.collection('userPermissions').bulkWrite(bulkOps);
      console.log(`Bulk operation result:`, {
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        upsertedCount: result.upsertedCount
      });
    }
    
    console.log(`Fixed ${fixedCount} user permissions, removed ${removedCount} user permissions`);
    
    return { fixed: fixedCount, removed: removedCount };
    
  } catch (error) {
    console.error('Error fixing broken user permissions:', error);
    throw error;
  }
}

async function getBrokenPermissionDetails() {
  try {
    const db = mongoose.connection;
    
    console.log('Getting detailed information about broken permissions...');
    
    // Get all broken permission IDs from user permissions
    const brokenPermissionIds = await db.collection('userPermissions').aggregate([
      {
        $lookup: {
          from: 'permissions',
          localField: 'positivePermissions',
          foreignField: '_id',
          as: 'validPositive'
        }
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'negativePermissions',
          foreignField: '_id',
          as: 'validNegative'
        }
      },
      {
        $project: {
          brokenPositive: {
            $setDifference: ['$positivePermissions', { $map: { input: '$validPositive', as: 'perm', in: '$$perm._id' } }]
          },
          brokenNegative: {
            $setDifference: ['$negativePermissions', { $map: { input: '$validNegative', as: 'perm', in: '$$perm._id' } }]
          }
        }
      },
      {
        $project: {
          allBroken: { $concatArrays: ['$brokenPositive', '$brokenNegative'] }
        }
      },
      {
        $unwind: '$allBroken'
      },
      {
        $group: {
          _id: '$allBroken',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log(`Found ${brokenPermissionIds.length} unique broken permission IDs:`);
    
    // Check if these permissions exist in the permissions collection (even if deleted)
    for (const brokenPerm of brokenPermissionIds) {
      const permissionInDB = await db.collection('permissions').findOne({ _id: brokenPerm._id });
      
      console.log(`\nBroken Permission ID: ${brokenPerm._id}`);
      console.log(`Used in ${brokenPerm.count} user permission(s)`);
      
      if (permissionInDB) {
        console.log(`Status: EXISTS in permissions collection`);
        console.log(`Name: ${permissionInDB.name}`);
        console.log(`IsDeleted: ${permissionInDB.isDeleted}`);
        console.log(`PermissionGroup: ${permissionInDB.permissionGroup}`);
      } else {
        console.log(`Status: DOES NOT EXIST in permissions collection`);
      }
    }
    
    return brokenPermissionIds;
    
  } catch (error) {
    console.error('Error getting broken permission details:', error);
    throw error;
  }
}

async function runFullDiagnosis() {
  try {
    console.log('=== FULL DIAGNOSIS OF BROKEN USER PERMISSIONS ===\n');
    
    // Step 1: Identify broken user permissions
    const brokenUserPerms = await identifyBrokenUserPermissions();
    
    // Step 2: Get details about broken permissions
    const brokenPermDetails = await getBrokenPermissionDetails();
    
    // Step 3: Provide recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    
    if (brokenUserPerms.length === 0) {
      console.log('✅ No broken user permissions found!');
    } else {
      console.log(`\n📊 Summary:`);
      console.log(`- ${brokenUserPerms.length} user permission records have broken references`);
      console.log(`- ${brokenPermDetails.length} unique broken permission IDs found`);
      
      console.log(`\n🔧 Recommended Actions:`);
      console.log(`1. CLEAN (Recommended): Remove broken references, keep valid permissions`);
      console.log(`   Command: fixBrokenUserPermissions('clean')`);

      console.log(`2. SOFT DELETE: Mark user permissions as deleted`);
      console.log(`   Command: fixBrokenUserPermissions('soft-delete')`);

      console.log(`3. REMOVE: Completely remove user permission records`);
      console.log(`   Command: fixBrokenUserPermissions('remove')`);
      console.log(`   ⚠️  Use with caution - this permanently deletes data`);
    }
    
    return {
      brokenUserPermissions: brokenUserPerms.length,
      brokenPermissionIds: brokenPermDetails.length,
      details: {
        userPermissions: brokenUserPerms,
        permissionIds: brokenPermDetails
      }
    };
    
  } catch (error) {
    console.error('Error in full diagnosis:', error);
    throw error;
  }
}

module.exports = {
  identifyBrokenUserPermissions,
  fixBrokenUserPermissions,
  getBrokenPermissionDetails,
  runFullDiagnosis
};