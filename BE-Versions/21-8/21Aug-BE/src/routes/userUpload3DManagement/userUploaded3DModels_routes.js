const userUploaded3DModelController =require('../../controllers/userUploaded3DManagement/userUploaded3DModels_controller');
const express = require("express");
const userUploaded3DModelRouter = express.Router();

userUploaded3DModelRouter.post('/'
,userUploaded3DModelController.addUserUploaded3Dmodel );

userUploaded3DModelRouter.patch('/delete',  userUploaded3DModelController.deleteUserUploaded3DModel)

userUploaded3DModelRouter.get('/',userUploaded3DModelController.getAllUserUploaded3DModels)

userUploaded3DModelRouter.get('/:userUploaded3DId',userUploaded3DModelController.getUserUploaded3DById)

userUploaded3DModelRouter.put('/:userUploaded3DId', userUploaded3DModelController.editUserUploaded3DModel) ;


exports.userUploaded3DModelRouter = userUploaded3DModelRouter;