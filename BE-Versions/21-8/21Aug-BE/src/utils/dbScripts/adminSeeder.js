const User = require("../../models/mongoDB/userManagement/user_model");
const UserAuthentication = require("../../models/mongoDB/userManagement/userAuthentication_model");
const { mongoDbManager } = require("../../managers/dBManagers");
const {
  createUserAuthenticationObject,
} = require("../../controllers/userManagement/auth_controller");
const { hashPassword } = require("../password_utils");

const UserModel = User;
const UserAuthModel = UserAuthentication;

async function adminSeeder() {

  const adminData = {
    firstName: "Crion",
    lastName: "Admin",
    name: "Crion Admin",
    employeeId: "admin",
    isSuperAdmin: true,
    password: "123456",
    email: "admin@criontech.com",
    contactNumber: "9791178081",
    countryCode: "+91",
    reportsTo: null,
  };// need to congif in env?

  const hashedPassword = await hashPassword(adminData.password);

  const userAuthObj = await createUserAuthenticationObject(
    adminData.email,
    hashedPassword
  );
  userAuthObj.isSuperAdmin = true;

  const userDataForInsert = { ...adminData };

  //  Check if User and UserAuthentication already exist
  const existingUser = await mongoDbManager.findOne(UserModel, {
    email: adminData.email,
    isDeleted: { $ne: true },
  });

  const existingUserAuth = await mongoDbManager.findOne(UserAuthModel, {
    email: adminData.email,
    isDeleted: { $ne: true },
  });

  let createdUserId = null;
  let createdUserAuthId = null;

  // Create User if not exists
  if (!existingUser) {
    const createdUser = await mongoDbManager.insertOne(
      UserModel,
      userDataForInsert
    );
    createdUserId = createdUser._id;

    console.log("Admin User created");

    // Set createdBy, updatedBy, reportsTo
    await mongoDbManager.updateOne(
      UserModel,
      { _id: createdUserId },
      {
        createdBy: createdUserId,
        updatedBy: createdUserId,
        reportsTo: createdUserId,
      }
    );
    if (existingUserAuth) {
      await mongoDbManager.updateOne(
        UserAuthModel,
        { _id: existingUserAuth._id },
        {
          user: createdUserId,
        }
      );

      await mongoDbManager.updateOne(
        UserModel,
        { _id: createdUserId },
        {
          userAuthentication: existingUserAuth._id,
        }
      );
    }
  } else {
    createdUserId = existingUser._id;
   
  }

  // Create UserAuthentication if not exists
  if (!existingUserAuth) {
    userAuthObj.user = createdUserId;
    const createdUserAuth = await mongoDbManager.insertOne(
      UserAuthModel,
      userAuthObj
    );
    createdUserAuthId = createdUserAuth._id;

    console.log("Admin UserAuthentication created");

    await mongoDbManager.updateOne(
      UserModel,
      { _id: createdUserId },
      {
        userAuthentication: createdUserAuthId,
      }
    );
  } else {
    createdUserAuthId = existingUserAuth._id;
   
    // If user exists but userAuthentication field is missing, set it
    if (existingUser && !existingUser.userAuthentication) {
      await mongoDbManager.updateOne(
        UserModel,
        { _id: createdUserId },
        {
          userAuthentication: createdUserAuthId,
        }
      );
     
    }
  }

  
}

exports.adminSeeder = adminSeeder;
