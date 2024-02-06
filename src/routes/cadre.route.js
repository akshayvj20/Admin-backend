const {Router} = require("express");
const CadreController = require("../modules/cadre/cadre.controller");
const { verifyToken } = require('../utils/utils.accessToken');

const manageAccessRole = require("../utils/utils.manage.access.Role");
const verifyClientUserRole = manageAccessRole.verifyClientUserRole({type: "client", role: ["client", "chief_of_staff"]});

const router = Router();

/*
type: POST
Route: Cadre Login
Des: Cadre Login
*/
router.post("/cadresLogin", CadreController.cadresLogin);

/*
type: GET
Route: Get Cadre Task
Des: API should show how many tasks are assigned to cadre and how many are not assigned to cadre
*/
router.get("/getCadresTask",verifyToken, CadreController.getCadresTask);

/*
type: GET
Route: Get All Cadre
Des: API should display list of all cadre in an organization
*/

router.get("/getAllCadres",verifyToken, verifyClientUserRole, CadreController.getAllCadres);

/*
type: GET
Route: Get Tasks
Des: show tasks that are in progress, completed or pending for a particular organization
*/
router.get("/getTasks",verifyToken, CadreController.getTasks);

/*
type: GET     
Route: Get Single Carder Summary API By Id
Des: Single Cadre Summary API should display list of tasks assigned to a cadre, Tasks of Cadre in progress, Tasks not completed by Cadre, Tasks that are completed by Cadre
*/
router.get("/getSingleCarderSummaryById/:id",verifyToken, CadreController.getSingleCarderSummaryAPIById);

/*
type: GET     
Route: Get Count Of Total Tasks Assigned To A Cadre
Des:  The API should display count all tasks assigned to a client.
*/
router.get("/getCountOfTotalTasksAssignedToACadre/:id",verifyToken, CadreController.getCountOfTotalTasksAssignedToCadre);

module.exports = router;
