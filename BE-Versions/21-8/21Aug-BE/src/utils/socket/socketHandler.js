const socket = require("socket.io");
let socketServer;

const {
  createNotification,
} = require("../../controllers/notificationManagement/notification_controller");
const {
  addToOnlineuser,
  removeFromOnlineuser,
  getUserTypeAndNameUsingUserId,
  insertUserId_Notification,
  getSocketIdsByUserId,
  getSocketIdsByUserType
} = require("./socketUserHandler");

const { setIOInstance } = require("./ioInstance");


function socketConnection(server) {
  socketServer = socket(server, {
    connectionStateRecovery: {},
    cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
  });
  setIOInstance(socketServer);
  insertUserId_Notification(socketServer);
  socketServer.on("connection", async (client) => {
    try {
      console.log(
        `A user connected with userId: ${client.userId}, socketId: ${client.id}`
      );
      client.emit("connection", "Connected");
      let userType = await getUserTypeAndNameUsingUserId(client.userId);
      addToOnlineuser(client.userId, client.id, userType.type);
//       client.join(userType);
    client.join(userType.type);
      client.on("disconnect", () => {
        removeFromOnlineuser(client.id, client.userId);
        client.removeAllListeners();
        client.disconnect(true);
        client.emit("disconnected", "Disconnected");
        console.log("user disconnected");
      });
    } catch (error) {
      client.emit("error", {
        status: 500,
        message: "Error occured during socket connection",
      });
      throw error;
    }
  });
}

// //userTypes = ["34567","45678",456789]
// async function sendViaUserType(eventName, userTypes, data) {
//   try{
//   const createdNotifications = await createNotification(userTypes, null, data);
//   if(createdNotifications){
//   const sockets = getSocketIdsByUserType(userTypes);
//   const sender = await getUserTypeAndNameUsingUserId(data.sender);

//   // Create a Map for faster lookups
//   const socketMap = new Map(sockets.map(socket => [socket.userId, socket.socketId]));

//   // Create an array of promises for parallel execution
//   const notificationPromises = createdNotifications.map(async (createdNotification) => {
//     const receiverId = createdNotification.receiver.toHexString();
//     const socketId = socketMap.get(receiverId);
//     if (socketId) {
//       data.triggeredBy = sender.name;
//       data.id = createdNotification._id;
//       emitNotification(eventName, [socketId], data);
//     }
//   });
//   // Wait for all notifications to be sent
//   await Promise.all(notificationPromises);
// }
// else{
//   console.log("Cannot Create Notification Documents")
// }
// }catch(error){
//   console.log("Error sending Notifications",error)
//   throw error
// }
// }
// async function sendViaUserID(eventName, userId, data) {
//   try{
//   const createdNotification = await createNotification(null, userId, data);
//   const sockets = getSocketIdsByUserId(userId);
//   if (sockets.length > 0) {
//     if(createdNotification){
//     const sender = await getUserTypeAndNameUsingUserId(data.sender);
//     data.triggeredBy = sender.name;
//     console.log("createdNotification",createdNotification)
//     data.id = createdNotification._id;
//     emitNotification(eventName, sockets, data);
//     }
//     else{
//       console.log("Cannot Create Notification Document")
//     }
//   }
// }catch(error){
//   console.log("Error sending Notification",error)
//   throw error
//   }
// }

// function emitNotification(eventName, sockets, data) {
//   if (sockets.length > 0) {
//     console.log("sockets", sockets);
//     socketServer.to(sockets).emit(eventName, {
//       id: data.id,
//       activity: data.activity,
//       message: data.message,
//       moduleDetails: data.moduleDetails,
//       moduleName: data.moduleName,
//       isRead: data.isRead,
//       sender: data.triggeredBy,
//       createdAt: data.createdTime,
//     });
//   }
// }

//userTypes = ["34567","45678",456789]
// Send notifications to all users of specific types
async function sendViaUserType(eventName, userTypes, data) {
  try {
    const createdNotifications = await createNotification(userTypes,null,data);
    if (!createdNotifications || createdNotifications.length === 0) {
      console.log("Cannot Create Notification Documents");
      return;
    }
    const sockets = getSocketIdsByUserType(userTypes);
    const sender = await getUserTypeAndNameUsingUserId(data.sender);

    for (let notification of createdNotifications) {
      const receiverId = notification.receiver.toHexString();

      const userSockets = sockets
        .filter((s) => s.userId === receiverId)
        .map((s) => s.socketId);

      if (userSockets.length > 0) {
        const payload = {
          ...data,
          triggeredBy: sender.name,
          id: notification._id,
          createdAt: notification.createdTime || new Date(),
        };

        userSockets.forEach((socketId) => {
          socketServer.to(socketId).emit(eventName, payload);
        });
      }
    }
  } catch (error) {
    console.log("Error sending Notifications", error);
    throw error;
  }
}

// Send notification to a specific user by userId
async function sendViaUserID(eventName, userId, data) {
  try {
    const createdNotification = await createNotification(null, userId, data);
    if (!createdNotification) {
      console.log("Cannot Create Notification Document");
      return;
    }

    const sender = await getUserTypeAndNameUsingUserId(data.sender);
    const sockets = getSocketIdsByUserId(userId); // all devices + all tabs

    if (sockets.length > 0) {
      const payload = {
        ...data,
        triggeredBy: sender.name,
        id: createdNotification._id,
        createdAt: createdNotification.createdTime || new Date(),
      };

      sockets.forEach((socketId) => {
        socketServer.to(socketId).emit(eventName, payload); // FIXED
      });
    }
  } catch (error) {
    console.log("Error sending Notification", error);
    throw error;
  }
}

const forecastDefects = require("../../models/mongoDB/forecastDefect/forecastDefect-model");
const {getDefectPoints} = require("../../managers/internalManagers/tagManagement/tag_manager")


// function watchforecastDefects() {
//   const changeStream = forecastDefects.watch();

//   changeStream.on("change", async (change) => {
//     if (change.operationType === "insert") {
//       const document = change.fullDocument;
//       const forecastDefects = await document.aggregate([
//         {
//           $project: {
//             _id: 1,
//             forecastTimestamp: 1,
//             status: 1,
//             firstDetectedAt: 1,
//             lastStatusChangeAt: 1,
//             lastUpdatedAt: 1,
//             detectedDefects: {
//               $map: {
//                 input: "$detectedDefects",
//                 as: "defect",
//                 in: {
//                   defectName: "$$defect.defectName",
//                   confidenceScore: "$$defect.confidenceScore",
//                   riskLevel: "$$defect.riskLevel",
//                   triggeredRules: {
//                     $map: {
//                       input: "$$defect.triggeredRules",
//                       as: "rule",
//                       in: {
//                         tagId: "$$rule.tagId",
//                         forecastedValue: "$$rule.forecastedValue",
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//         {
//           $sort: {
//             forecastTimestamp: 1,
//           },
//         },
//       ]).toArray();

//       socketServer.emit(
//         "forecastDefects",
//         forecastDefects
//       );
//     }
//   });

//   changeStream.on("error", (err) => {
//     console.error("Change Stream Error:", err);
//   });
// }

let lastCheckedId = null;

async function pollForecastDefects() {
  try {
    const latest = await forecastDefects.findOne(
      {},
      { _id: 1 },
      { sort: { _id: -1 } }
    );

    if (!latest || (lastCheckedId && latest._id.equals(lastCheckedId))) {
      return;
    }

    const newDefects = await forecastDefects.aggregate([
      { $match: { _id: { $gt: lastCheckedId } } },
      {
        $project: {
          _id: 1,
          forecastTimestamp: 1,
          status: 1,
          firstDetectedAt: 1,
          lastStatusChangeAt: 1,
          lastUpdatedAt: 1,
          detectedDefects: {
            $map: {
              input: "$detectedDefects",
              as: "defect",
              in: {
                defectName: "$$defect.defectName",
                confidenceScore: "$$defect.confidenceScore",
                riskLevel: "$$defect.riskLevel",
                triggeredRules: {
                  $map: {
                    input: "$$defect.triggeredRules",
                    as: "rule",
                    in: {
                      tagId: "$$rule.tagId",
                      forecastedValue: "$$rule.forecastedValue",
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    lastCheckedId = latest._id;

    if (newDefects.length > 0) {
      socketServer.emit("forecastDefects", newDefects);
    }
  } catch (err) {
    console.error("Polling Error:", err);
  }
}

function watchForecastDefects(intervalMs = 3000) {
  forecastDefects
    .findOne({}, { _id: 1 }, { sort: { _id: -1 } })
    .then((doc) => {
      if (doc) lastCheckedId = doc._id;
      setInterval(pollForecastDefects, intervalMs);
      console.log("Watching forecastDefects for changes...");
    })
    .catch((err) => console.error("Failed to start forecastDefects watcher:", err));
}


module.exports = {
  socketConnection,
  sendViaUserType,
  sendViaUserID,
  watchForecastDefects,
  // emitNotification,
  // socketServer
};
