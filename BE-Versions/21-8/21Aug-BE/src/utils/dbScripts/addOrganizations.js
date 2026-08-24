const mongoose = require('mongoose');

async function createOrganizationsFromBusinessUnits() {
  try {
    const db = mongoose.connection;
    
    // Get admin user ID
    const adminUser = await db.collection('users').findOne({ email: 'admin@criontech.com' });
    if (!adminUser) {
      throw new Error('Admin user with email admin@criontech.com not found');
    }
    const adminUserId = adminUser._id;
    
    // Get all unique business units from the businessUnits collection
    const businessUnits = await db.collection('businessUnits').find({ 
      isDeleted: { $ne: true },
      name: { $exists: true, $ne: null, $ne: '' }
    }).toArray();
    
    if (businessUnits.length === 0) {
      console.log('No business units found to create organizations from');
      return;
    }
    
    const organizationsToCreate = [];
    const businessUnitOrganizationMap = new Map();
    
    // Prepare organizations data based on business units
    for (const businessUnit of businessUnits) {
      const organizationData = {
        name: `${businessUnit.name} Organization`,
        allowedDomains: [],
        isDomainRestricted: false,
        isEnabled: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUserId,
        updatedBy: adminUserId
      };
      
      organizationsToCreate.push(organizationData);
    }
    
    // Insert organizations in bulk
    const insertResult = await db.collection('organizations').insertMany(organizationsToCreate);
    console.log(`Created ${insertResult.insertedCount} organizations successfully`);
    
    // Create mapping between business unit and organization IDs
    let index = 0;
    for (const businessUnit of businessUnits) {
      const organizationId = insertResult.insertedIds[index];
      businessUnitOrganizationMap.set(businessUnit._id.toString(), organizationId);
      index++;
    }
    
    // Update business units with organization references
    const bulkOperations = [];
    for (const [businessUnitId, organizationId] of businessUnitOrganizationMap) {
      bulkOperations.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(businessUnitId) },
          update: {
            $set: {
              organization: organizationId,
              updatedAt: new Date(),
              updatedBy: adminUserId
            }
          }
        }
      });
    }
    
    if (bulkOperations.length > 0) {
      const updateResult = await db.collection('businessUnits').bulkWrite(bulkOperations);
      console.log(`Updated ${updateResult.modifiedCount} business units with organization references`);
    }
    
    console.log('Organization creation and business unit update completed successfully');
    return {
      organizationsCreated: insertResult.insertedCount,
      businessUnitsUpdated: bulkOperations.length,
      organizationMap: Array.from(businessUnitOrganizationMap.entries())
    };
    
  } catch (error) {
    console.error('Error creating organizations from business units:', error);
    throw error;
  }
}

async function updateBusinessUnitsWithOrganizations() {
  try {
    const db = mongoose.connection;
    
    // Get admin user ID
    const adminUser = await db.collection('users').findOne({ email: 'admin@criontech.com' });
    if (!adminUser) {
      throw new Error('Admin user with email admin@criontech.com not found');
    }
    const adminUserId = adminUser._id;
    
    // Find business units that don't have organization reference
    const businessUnitsWithoutOrg = await db.collection('businessUnits').find({
      organization: { $exists: false },
      isDeleted: { $ne: true }
    }).toArray();
    
    if (businessUnitsWithoutOrg.length === 0) {
      console.log('All business units already have organization references');
      return;
    }
    
    // For each business unit without organization, create or find matching organization
    const bulkOperations = [];
    
    for (const businessUnit of businessUnitsWithoutOrg) {
      // Try to find existing organization with similar name
      const orgName = `${businessUnit.name} Organization`;
      let existingOrg = await db.collection('organizations').findOne({
        name: orgName,
        isDeleted: { $ne: true }
      });
      
      let organizationId;
      
      if (!existingOrg) {
        // Create new organization
        const newOrg = await db.collection('organizations').insertOne({
          name: orgName,
          allowedDomains: [],
          isDomainRestricted: false,
          isEnabled: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: adminUserId,
          updatedBy: adminUserId
        });
        organizationId = newOrg.insertedId;
        console.log(`Created new organization: ${orgName}`);
      } else {
        organizationId = existingOrg._id;
        console.log(`Using existing organization: ${orgName}`);
      }
      
      // Add update operation for business unit
      bulkOperations.push({
        updateOne: {
          filter: { _id: businessUnit._id },
          update: {
            $set: {
              organization: organizationId,
              updatedAt: new Date(),
              updatedBy: adminUserId
            }
          }
        }
      });
    }
    
    // Execute bulk update
    if (bulkOperations.length > 0) {
      const updateResult = await db.collection('businessUnits').bulkWrite(bulkOperations);
      console.log(`Updated ${updateResult.modifiedCount} business units with organization references`);
    }
    
    console.log('Business unit organization update completed successfully');
    
  } catch (error) {
    console.error('Error updating business units with organizations:', error);
    throw error;
  }
}

async function runOrganizationMigration() {
  try {
    console.log('Starting organization migration...');
    
    // First create organizations from existing business units
    await createOrganizationsFromBusinessUnits();
    
    // Then update any remaining business units without organization references
    await updateBusinessUnitsWithOrganizations();
    
    console.log('Organization migration completed successfully');
    
  } catch (error) {
    console.error('Organization migration failed:', error);
    throw error;
  }
}

// Alternative function to run only the update part if organizations already exist
async function updateExistingBusinessUnits() {
  try {
    console.log('Updating existing business units with organization references...');
    await updateBusinessUnitsWithOrganizations();
  } catch (error) {
    console.error('Error updating existing business units:', error);
    throw error;
  }
}

module.exports = {
  runOrganizationMigration,
  createOrganizationsFromBusinessUnits,
  updateBusinessUnitsWithOrganizations,
  updateExistingBusinessUnits
};