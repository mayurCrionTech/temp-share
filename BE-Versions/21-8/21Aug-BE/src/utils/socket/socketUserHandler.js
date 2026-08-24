let onlineUsers = [];
const { mongoDbManager } = require("../../managers/dBManagers");
const {
  getUserIdFromToken,
} = require("../../middlewares/usermanagement/authJwt_middleware");
const Users = require("../../models/mongoDB/userManagement/user_model");
const UserType = require("../../models/mongoDB/organizationManagement/userType_model");

// Normalize IDs
function normalize(id) {
  return String(id).trim();
}

function addToOnlineuser(userId, socketId, userType) {
  onlineUsers.push({
    userId: normalize(userId),
    socketId,
    userType: normalize(userType),
  });
  console.log("onlineUsers", onlineUsers);
}

function removeFromOnlineuser(socketId) {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
}

async function getUserTypeAndNameUsingUserId(userId) {
  try {
    const user = await Users.findOne({ _id: userId });
    let objectToReturn = {};
    if (user?.userType) objectToReturn.type = user.userType.toHexString();
    if (user?.name) objectToReturn.name = user.name;
    return objectToReturn;
  } catch (error) {
    console.error(`Error fetching user type for ${userId}:`, error);
  }
}

// function addToOnlineuser(userId, socketId, userType) {
//   // client.id.find(onlineuser.socketID == clientID )
//   // if (!onlineUsers.some((user) => user.userId === userId)) {
//     onlineUsers.push({ userId, socketId, userType });
//   // }
//   console.log("onlineUsers", onlineUsers);
// }

// function removeFromOnlineuser(socketId, userId) {
//   onlineUsers = onlineUsers.filter(
//     (user) => user.socketId !== socketId || user.userId !== userId
//   );
// }

// async function getUserTypeAndNameUsingUserId(userId) {
//   try {
//     const user = await Users.findOne({ _id: userId });
//     let objectToReturn = {};
//     if (user.userType) {
//       objectToReturn.type = user.userType.toHexString();
//     }
//     if (user.name) {
//       objectToReturn.name = user.name;
//     }
//     return objectToReturn;
//   } catch (error) {
//     console.error(`Error fetching user type for ${userId}:`, error);
//   }
// }

async function fetchUserTypeByDepartment(departmentId) {
  try{
    const userTypes = await mongoDbManager.findManyWithPopulate(UserType,{department:departmentId, isDeleted: false})
    if (userTypes){
    const result = userTypes
    .filter(userType => userType.name.toLowerCase() === "manager" || userType.name.toLowerCase() === "engineer")
    .map(userType => userType._id.toHexString());
    return result;
  }
  else{
    return [];
  }
  }catch(error){
    console.error(`Error fetching user type for ${departmentId}:`, error);
  }
}

async function fetchAllUserTypeByDepartment(departmentId) {
  try{
    const userTypes = await mongoDbManager.findManyWithPopulate(UserType,{department:departmentId, isDeleted: false})
    if (userTypes){
    const result = userTypes
    .filter(userType => userType.name.toLowerCase() === "manager" || userType.name.toLowerCase() === "engineer" || userType.name.toLowerCase() === "operator")
    .map(userType => userType._id.toHexString());
    return result;
  }
  else{
    return [];
  }
  }catch(error){
    console.error(`Error fetching user type for ${departmentId}:`, error);
  }
}

async function fetchEngineerUserTypeByDepartment(departmentId) {
  try{
    const userTypes = await mongoDbManager.findManyWithPopulate(UserType,{department:departmentId, isDeleted: false})
    if (userTypes){
    const result = userTypes
    .filter(userType => userType.name.toLowerCase() === "engineer")
    .map(userType => userType._id.toHexString());
    return result;
  }
  else{
    return [];
  }
  }catch(error){
    console.error(`Error fetching user type for ${departmentId}:`, error);
  }
}

// async function insertUserId_Notification(socketServer) {
//   try{
//   socketServer.use(async (client, next) => {
//     const token = client.handshake.auth.token || client.handshake.headers.token;
//     const userId = await getUserIdFromToken(token, client);
//     console.log("userId", userId); // Assuming userId is obtained from the handshake auth data
//     if (!userId) {
//       return next(new Error("Authentication error"));
//     }
//     client.userId = userId; // Assuming userId is obtained from token
//     next();
//   });
// }
// catch(error){
//   console.log("Error", error)
//   client.emit('error', { status: 400, message: "Invalid token" || error });
// }
// }

async function insertUserId_Notification(socketServer) {
  socketServer.use(async (client, next) => {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.token;
      const userId = await getUserIdFromToken(token, client);

      if (!userId) return next(new Error("Authentication error"));

      client.userId = normalize(userId);
      next();
    } catch (err) {
      console.log("Error", err);
      client.emit("error", { status: 400, message: "Invalid token" });
    }
  });
}

// //userTypes = ["34567","45678",456789]
// function getSocketIdsByUserType(userTypes) {
//   const sockets = [];
//   for (let userType of userTypes) {
//     const result = onlineUsers
//       .filter((user) => user.userType === userType)
//       .map((user) => ({
//         userId: user.userId,
//         userType: user.userType,
//         socketId: user.socketId
//       }));
//     sockets.push(...result); // Flatten the array
//   }
//   return sockets;
// }

function getSocketIdsByUserType(userTypes) {
  const sockets = [];

  for (let userType of userTypes) {
    const result = onlineUsers
      .filter((user) => normalize(user.userType) === normalize(userType))
      .map((user) => ({
        userId: user.userId,
        userType: user.userType,
        socketId: user.socketId,
      }));

    sockets.push(...result);
  }

  return sockets;
}

// function getSocketIdsByUserId(userId) {
//   return onlineUsers
//     .filter((user) => user.userId === userId)
//     .map((user) => user.socketId);
// }

function getSocketIdsByUserId(userId) {
  const uid = normalize(userId);
  return onlineUsers.filter((u) => u.userId === uid).map((u) => u.socketId);
}

async function getUserTypeAndNameUsingUserId(userId) {
  try {
    const user = await Users.findOne({ _id: userId });
    let objectToReturn = {};
    if (user?.userType) objectToReturn.type = user.userType.toHexString();
    if (user?.name) objectToReturn.name = user.name;
    return objectToReturn;
  } catch (error) {
    console.error(`Error fetching user type for ${userId}:`, error);
  }
}

module.exports = {
  addToOnlineuser,
  removeFromOnlineuser,
  getUserTypeAndNameUsingUserId,
  insertUserId_Notification,
  getSocketIdsByUserType,
  getSocketIdsByUserId,
  fetchUserTypeByDepartment,
  fetchAllUserTypeByDepartment,
  fetchEngineerUserTypeByDepartment,
};
