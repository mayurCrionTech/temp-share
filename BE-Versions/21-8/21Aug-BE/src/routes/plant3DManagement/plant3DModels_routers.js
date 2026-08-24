const express = require("express");
const plant3DModelController = require('../../controllers/plant3dManagement/plant3DModels_controller');
const plant3DRouter = express.Router();

plant3DRouter.post('/', plant3DModelController.createPlant3DModel );

plant3DRouter.get('/:plant3DId',plant3DModelController.getPlant3DById)

plant3DRouter.patch('/delete', plant3DModelController.deletePlant3DModels)

plant3DRouter.put('/edit',plant3DModelController.editPlant3DModel)

plant3DRouter.get('/',plant3DModelController.getAllPlant3DModels);


exports.plant3DRouter = plant3DRouter;