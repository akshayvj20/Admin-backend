const {Router} = require("express");
const TaskController = require("../modules/task/task.controller");
const { verifyToken } = require('../utils/utils.accessToken');
const { taskImagesUpload } = require("../utils/utils.uploadFile");
const router = Router();
const taskDataValidation = require("../modules/task/task.validation")
const manageAccessRole = require("../utils/utils.manage.access.Role");
const verifyClientUserRole = manageAccessRole.verifyClientUserRole({type: "client", role: ["client", "chief_of_staff"]});

/*
type: post
Route: upload Task images
taskImagesUpload: Middleware used to upload a file
*/
router.post('/uploadTaskImages',verifyToken, taskImagesUpload, TaskController.uploadTaskImages);

/*
type: post
Route: Create Task API
*/
router.post("/createTask",verifyToken, taskDataValidation, TaskController.createTask);

/*type: get
Route: Get All Task API 
*/
router.get("/getAllTasks",verifyToken, verifyClientUserRole, TaskController.getAllTasks);

//Search Task By Keyword
router.get("/searchTaskByKeyword", verifyToken, TaskController.searchTaskByKeyword);

/*type: DELeTE
Route: Delete Task API 
*/
router.delete("/:id",verifyToken,TaskController.deleteTask);

/*type: get
Route: Get Priorities Of Task 
*/
router.get("/getPrioritiesOfTask",verifyToken,TaskController.getPrioritiesOfTask);

/*type: get
Route: Get Tasks status Summary 
*/
router.get("/getTasksStatusSummary",verifyToken,TaskController.getTasksStatusSummary);

//get all Tasks By Status
router.get("/getAllTasksByStatus", verifyToken, TaskController.getAllTasksByStatus)

/*type: get
Route: Get Tasks By Assigned To User Id 
*/
router.get("/getTasksByAssignedToUserId/:id",verifyToken,TaskController.getTasksByAssignedToUserId);

/*type: get
Route: Get Tasks status Summary by user id
*/
router.get("/getTasksStatusSummaryByUserId/:id",verifyToken,TaskController.getTasksStatusSummaryByUserId);


/*type: GET
Route: Get Task By Id API
*/
router.get("/getTask/:id",verifyToken,TaskController.getTaskById);

/*type: PUT
Route: Update Task API
*/
router.put("/updateTask/:id",verifyToken,TaskController.updateTask);

//update Task
router.put("/updateTaskStatus/:id", verifyToken, TaskController.updateTaskStatus);

module.exports = router;