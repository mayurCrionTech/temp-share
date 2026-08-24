const express = require("express");
const taskLibraryRouter = express.Router();
const {taskLibraryMiddleware, businessUnitMiddleware} = require('../../middlewares/index')
const taskLibraryController = require('../../controllers/maintenanceManagement/taskLibrary_controller');

taskLibraryRouter.post('/', 
    [
        businessUnitMiddleware.verifyBusinessUnit,
        taskLibraryMiddleware.validateCreateTaskLibraryRequest,
    ], 
        taskLibraryController.createTaskLibrary
    )
    taskLibraryRouter.get('/count', [businessUnitMiddleware.verifyBusinessUnit,],
        taskLibraryController.fetchCount
    )
    
    
    taskLibraryRouter.get('/', [businessUnitMiddleware.verifyBusinessUnit,],
        taskLibraryController.fetchTaskLibraries
    )
    
    taskLibraryRouter.get('/:task',
    [
        businessUnitMiddleware.verifyBusinessUnit,
        taskLibraryMiddleware.validateTaskLibrary,
    ],
    taskLibraryController.fetchTaskLibrary
);

taskLibraryRouter.delete('/',
    [
        taskLibraryMiddleware.validateDeleteTaskLibrariesRequest
    ],
    taskLibraryController.bulkDeleteTaskLibraries
);

taskLibraryRouter.put('/:task',
    [
        // taskLibraryMiddleware.validateTaskLibrary,
        taskLibraryMiddleware.validateUpdateTaskLibraryRequest,
        taskLibraryMiddleware.validateTaskLibraryTask
    ],
    taskLibraryController.updateTaskLibrary
)








module.exports = {taskLibraryRouter}