const {Router} = require("express");
const widgetService = require("./widget.service");
const overviewService = require("./overview/overview.service");
const grievanceService = require("./grievance/grievance.service");
const taskManagement = require("./taskManagement/taskManagement.service");
const { verifyToken } = require('../../utils/utils.accessToken');

const router = Router();

router.get("/getOverview/:id",verifyToken, overviewService.overviewData);
// router.get("/getOverview/:id", widgetService.getOverview);

router.post("/createOverview", widgetService.createOverview);
router.post("/overviewQuery", overviewService.overviewData);


// Grievance Data ------------ 
router.get("/getGrievanceData/:id", widgetService.getGrievanceData);
router.post("/createGrievanceData", widgetService.createGrievanceData);
router.post("/getTotalNewCreatedInLastSevenDays", verifyToken, grievanceService.getTotalNewCreatedInLastSevenDays);

// Task ------------ 
router.get("/getTaskData/:id", widgetService.getTaskData);
router.post("/createTaskData", widgetService.createTaskData);
router.post("/taskcompletionRateForLastSevenDays", taskManagement.taskcompletionRateForLastSevenDays);


// Team Performance  ------------ 
router.get("/getteamPerformanceData/:id", widgetService.getTeamPerformanceData);
router.post("/createteamPerformanceData", widgetService.createTeamPerformanceData);

module.exports = router;
