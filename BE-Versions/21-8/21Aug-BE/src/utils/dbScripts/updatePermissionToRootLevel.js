const mongoose = require('mongoose');

async function consolidatePermissionsAndGroups() {
  try {
    const db = mongoose.connection;
    
    // Get admin user ID
    const adminUser = await db.collection('users').findOne({ email: 'admin@criontech.com' });
    if (!adminUser) {
      throw new Error('Admin user with email admin@criontech.com not found');
    }
    const adminUserId = adminUser._id;
    
    console.log('Starting permission consolidation migration...');
    
    // Step 1: Consolidate Permission Groups (remove businessUnit, make root level)
    const consolidatedGroups = await consolidatePermissionGroups(db, adminUserId);
    
    // Step 2: Consolidate Permissions (keep unique ones, create mapping)
    const permissionMapping = await consolidatePermissions(db, adminUserId, consolidatedGroups);
    
    // Step 3: Update UserPermissions with new permission IDs
    await updateUserPermissions(db, permissionMapping);
    
    // Step 4: Update Designations with new permission IDs
    await updateDesignations(db, permissionMapping);
    
    // Step 5: Clean up duplicate permissions and groups
    await cleanupDuplicates(db, permissionMapping, consolidatedGroups);
    
    console.log('Permission consolidation migration completed successfully');
    
    return {
      consolidatedGroups: consolidatedGroups.size,
      consolidatedPermissions: permissionMapping.size,
      message: 'Migration completed successfully'
    };
    
  } catch (error) {
    console.error('Error in permission consolidation migration:', error);
    throw error;
  }
}

async function consolidatePermissionGroups(db, adminUserId) {
  console.log('Step 1: Consolidating Permission Groups...');
  
  // Get all permission groups
  const allGroups = await db.collection('permissionGroups').find({
    isDeleted: { $ne: true }
  }).toArray();
  
  // Group by name to find duplicates
  const groupsByName = new Map();
  for (const group of allGroups) {
    const name = group.name.toLowerCase().trim();
    if (!groupsByName.has(name)) {
      groupsByName.set(name, []);
    }
    groupsByName.get(name).push(group);
  }
  
  const consolidatedGroups = new Map(); // old group ID -> new group ID
  const groupsToKeep = [];
  const groupsToRemove = [];
  
  // For each group name, consolidate permissions and keep one group
  for (const [groupName, groups] of groupsByName) {
    if (groups.length === 1) {
      // Single group - just remove businessUnit reference
      const group = groups[0];
      groupsToKeep.push({
        _id: group._id,
        updates: {
          $unset: { businessUnit: "" },
          $set: {
            updatedAt: new Date(),
            updatedBy: adminUserId
          }
        }
      });
      consolidatedGroups.set(group._id.toString(), group._id);
    } else {
      // Multiple groups with same name - merge permissions
      groups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const groupToKeep = groups[0];
      const groupsToDelete = groups.slice(1);
      
      // Get all permissions from all groups with this name
      const allGroupIds = groups.map(g => g._id);
      const allPermissionsInGroups = await db.collection('permissions').find({
        permissionGroup: { $in: allGroupIds },
        isDeleted: { $ne: true }
      }).toArray();
      
      // Update permissions from groups being deleted to point to the kept group
      const permissionsToUpdate = allPermissionsInGroups.filter(
        p => p.permissionGroup.toString() !== groupToKeep._id.toString()
      );
      
      if (permissionsToUpdate.length > 0) {
        await db.collection('permissions').updateMany(
          { _id: { $in: permissionsToUpdate.map(p => p._id) } },
          {
            $set: {
              permissionGroup: groupToKeep._id,
              updatedAt: new Date(),
              updatedBy: adminUserId
            }
          }
        );
        console.log(`Moved ${permissionsToUpdate.length} permissions to consolidated group: ${groupName}`);
      }
      
      // Update the group to keep (remove businessUnit)
      groupsToKeep.push({
        _id: groupToKeep._id,
        updates: {
          $unset: { businessUnit: "" },
          $set: {
            updatedAt: new Date(),
            updatedBy: adminUserId
          }
        }
      });
      
      // Map all groups to the one we're keeping
      for (const group of groups) {
        consolidatedGroups.set(group._id.toString(), groupToKeep._id);
      }
      
      // Mark duplicates for removal
      groupsToRemove.push(...groupsToDelete.map(g => g._id));
    }
  }
  
  // Update groups to keep (remove businessUnit reference)
  if (groupsToKeep.length > 0) {
    const bulkOps = groupsToKeep.map(group => ({
      updateOne: {
        filter: { _id: group._id },
        update: group.updates
      }
    }));
    
    const result = await db.collection('permissionGroups').bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} permission groups (removed businessUnit)`);
  }
  
  console.log(`Found ${consolidatedGroups.size} permission groups, ${groupsToRemove.length} duplicates to be removed later`);
  return consolidatedGroups;
}


async function consolidatePermissions(db, adminUserId, consolidatedGroups) {
  console.log('Step 2: Consolidating Permissions...');
  
  // Get all permissions (refresh after group consolidation)
  const allPermissions = await db.collection('permissions').find({
    isDeleted: { $ne: true }
  }).toArray();
  
  // Group permissions by name AND current group (after consolidation)
  const permissionsByGroupAndName = new Map();
  for (const permission of allPermissions) {
    const name = permission.name.toLowerCase().trim();
    const groupId = permission.permissionGroup.toString(); // Use current group ID
    const key = `${name}::${groupId}`;
    
    if (!permissionsByGroupAndName.has(key)) {
      permissionsByGroupAndName.set(key, []);
    }
    permissionsByGroupAndName.get(key).push(permission);
  }
  
  const permissionMapping = new Map();
  const permissionsToKeep = [];
  const permissionsToRemove = [];
  
  // Process each unique permission name within each group
  for (const [key, permissions] of permissionsByGroupAndName) {
    if (permissions.length === 1) {
      const permission = permissions[0];
      permissionsToKeep.push({
        _id: permission._id,
        updates: {
          $unset: { businessUnit: "" },
          $set: {
            updatedAt: new Date(),
            updatedBy: adminUserId
          }
        }
      });
      permissionMapping.set(permission._id.toString(), permission._id);
    } else {
      // Keep the oldest permission, remove duplicates
      permissions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const permissionToKeep = permissions[0];
      const permissionsToDelete = permissions.slice(1);
      
      permissionsToKeep.push({
        _id: permissionToKeep._id,
        updates: {
          $unset: { businessUnit: "" },
          $set: {
            updatedAt: new Date(),
            updatedBy: adminUserId
          }
        }
      });
      
      // Map all duplicate permissions to the one we're keeping
      for (const permission of permissions) {
        permissionMapping.set(permission._id.toString(), permissionToKeep._id);
      }
      
      permissionsToRemove.push(...permissionsToDelete.map(p => p._id));
    }
  }
  
  // Update permissions to keep
  if (permissionsToKeep.length > 0) {
    const bulkOps = permissionsToKeep.map(permission => ({
      updateOne: {
        filter: { _id: permission._id },
        update: permission.updates
      }
    }));
    
    const result = await db.collection('permissions').bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} permissions (removed businessUnit)`);
  }
  
  console.log(`Found ${permissionMapping.size} unique permissions, ${permissionsToRemove.length} duplicates to be removed later`);
  return permissionMapping;
}


async function updateUserPermissions(db, permissionMapping) {
  console.log('Step 3: Updating UserPermissions...');
  
  const userPermissions = await db.collection('userPermissions').find({}).toArray();
  const bulkOps = [];
  
  for (const userPermission of userPermissions) {
    let hasUpdates = false;
    const updates = {};
    
    // Update positive permissions
    if (userPermission.positivePermissions && userPermission.positivePermissions.length > 0) {
      const updatedPositive = [];
      const uniquePositive = new Set();
      
      for (const permId of userPermission.positivePermissions) {
        const permIdStr = permId.toString();
        const newPermId = permissionMapping.get(permIdStr);
        if (newPermId && !uniquePositive.has(newPermId.toString())) {
          updatedPositive.push(newPermId);
          uniquePositive.add(newPermId.toString());
        }
      }
      
      if (updatedPositive.length !== userPermission.positivePermissions.length ||
          !updatedPositive.every((id, idx) => id.toString() === userPermission.positivePermissions[idx].toString())) {
        updates.positivePermissions = updatedPositive;
        hasUpdates = true;
      }
    }
    
    // Update negative permissions
    if (userPermission.negativePermissions && userPermission.negativePermissions.length > 0) {
      const updatedNegative = [];
      const uniqueNegative = new Set();
      
      for (const permId of userPermission.negativePermissions) {
        const permIdStr = permId.toString();
        const newPermId = permissionMapping.get(permIdStr);
        if (newPermId && !uniqueNegative.has(newPermId.toString())) {
          updatedNegative.push(newPermId);
          uniqueNegative.add(newPermId.toString());
        }
      }
      
      if (updatedNegative.length !== userPermission.negativePermissions.length ||
          !updatedNegative.every((id, idx) => id.toString() === userPermission.negativePermissions[idx].toString())) {
        updates.negativePermissions = updatedNegative;
        hasUpdates = true;
      }
    }
    
    if (hasUpdates) {
      updates.updatedAt = new Date();
      bulkOps.push({
        updateOne: {
          filter: { _id: userPermission._id },
          update: { $set: updates }
        }
      });
    }
  }
  
  if (bulkOps.length > 0) {
    const result = await db.collection('userPermissions').bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} user permissions with consolidated permission IDs`);
  } else {
    console.log('No user permissions needed updates');
  }
}

async function updateDesignations(db, permissionMapping) {
  console.log('Step 4: Updating Designations...');
  
  const designations = await db.collection('designations').find({
    permissions: { $exists: true, $ne: [] }
  }).toArray();
  
  const bulkOps = [];
  
  for (const designation of designations) {
    if (designation.permissions && designation.permissions.length > 0) {
      const updatedPermissions = [];
      const uniquePermissions = new Set();
      
      for (const permId of designation.permissions) {
        const permIdStr = permId.toString();
        const newPermId = permissionMapping.get(permIdStr);
        if (newPermId && !uniquePermissions.has(newPermId.toString())) {
          updatedPermissions.push(newPermId);
          uniquePermissions.add(newPermId.toString());
        }
      }
      
      if (updatedPermissions.length !== designation.permissions.length ||
          !updatedPermissions.every((id, idx) => id.toString() === designation.permissions[idx].toString())) {
        bulkOps.push({
          updateOne: {
            filter: { _id: designation._id },
            update: {
              $set: {
                permissions: updatedPermissions,
                updatedAt: new Date()
              }
            }
          }
        });
      }
    }
  }
  
  if (bulkOps.length > 0) {
    const result = await db.collection('designations').bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} designations with consolidated permission IDs`);
  } else {
    console.log('No designations needed updates');
  }
}

async function cleanupDuplicates(db, permissionMapping, consolidatedGroups) {
  console.log('Step 5: Cleaning up duplicate permissions and groups...');
  
  // Find permission IDs that are not the "kept" ones
  const permissionsToDelete = [];
  for (const [oldId, newId] of permissionMapping) {
    if (oldId !== newId.toString()) {
      permissionsToDelete.push(new mongoose.Types.ObjectId(oldId));
    }
  }
  
  // Find group IDs that are not the "kept" ones
  const groupsToDelete = [];
  for (const [oldId, newId] of consolidatedGroups) {
    if (oldId !== newId.toString()) {
      groupsToDelete.push(new mongoose.Types.ObjectId(oldId));
    }
  }
  
  // Mark duplicate permissions as deleted
  if (permissionsToDelete.length > 0) {
    const permissionResult = await db.collection('permissions').updateMany(
      { _id: { $in: permissionsToDelete } },
      {
        $set: {
          isDeleted: true,
          updatedAt: new Date()
        }
      }
    );
    console.log(`Marked ${permissionResult.modifiedCount} duplicate permissions as deleted`);
  }
  
  // Mark duplicate permission groups as deleted
  if (groupsToDelete.length > 0) {
    const groupResult = await db.collection('permissionGroups').updateMany(
      { _id: { $in: groupsToDelete } },
      {
        $set: {
          isDeleted: true,
          updatedAt: new Date()
        }
      }
    );
    console.log(`Marked ${groupResult.modifiedCount} duplicate permission groups as deleted`);
  }
}

// Function to validate the migration results
async function validateMigration() {
  try {
    const db = mongoose.connection;
    
    console.log('Validating migration results...');
    
    // Check permission groups
    const groupsWithBusinessUnit = await db.collection('permissionGroups').countDocuments({
      businessUnit: { $exists: true },
      isDeleted: { $ne: true }
    });
    
    // Check permissions
    const permissionsWithBusinessUnit = await db.collection('permissions').countDocuments({
      businessUnit: { $exists: true },
      isDeleted: { $ne: true }
    });
    
    // Check for broken references in userPermissions
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
        $match: {
          $or: [
            { $expr: { $ne: [{ $size: '$positivePermissions' }, { $size: '$validPositive' }] } },
            { $expr: { $ne: [{ $size: '$negativePermissions' }, { $size: '$validNegative' }] } }
          ]
        }
      }
    ]).toArray();
    
    // Check for broken references in designations
    const brokenDesignations = await db.collection('designations').aggregate([
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissions',
          foreignField: '_id',
          as: 'validPermissions'
        }
      },
      {
        $match: {
          $expr: { $ne: [{ $size: '$permissions' }, { $size: '$validPermissions' }] }
        }
      }
    ]).toArray();
    
    console.log('Migration Validation Results:');
    console.log(`- Permission groups with businessUnit: ${groupsWithBusinessUnit}`);
    console.log(`- Permissions with businessUnit: ${permissionsWithBusinessUnit}`);
    console.log(`- User permissions with broken references: ${brokenUserPermissions.length}`);
    console.log(`- Designations with broken references: ${brokenDesignations.length}`);
    
    const isValid = groupsWithBusinessUnit === 0 && 
                   permissionsWithBusinessUnit === 0 && 
                   brokenUserPermissions.length === 0 && 
                   brokenDesignations.length === 0;
    
    if (isValid) {
      console.log('✅ Migration validation passed!');
    } else {
      console.log('❌ Migration validation failed. Please review the results above.');
    }
    
    return {
      isValid,
      groupsWithBusinessUnit,
      permissionsWithBusinessUnit,
      brokenUserPermissions: brokenUserPermissions.length,
      brokenDesignations: brokenDesignations.length
    };
    
  } catch (error) {
    console.error('Error validating migration:', error);
    throw error;
  }
}

async function runPermissionMigration() {
  try {
    // Execute the consolidation
    const result = await consolidatePermissionsAndGroups();
    console.log('Migration Result:', result);
    
    // Validate the migration
    const validation = await validateMigration();
    console.log('Validation Result:', validation);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

module.exports = {
  consolidatePermissionsAndGroups,
  validateMigration,
  runPermissionMigration
};