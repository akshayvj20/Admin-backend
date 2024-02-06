const {Router} = require("express");
const UserDetailsController = require('../modules/userDetails/userDetails.controller')
const { verifyToken } = require('../utils/utils.accessToken');
const router = Router();

//get grievance list by Assigned user id
router.get("/GrievanceByAssignToUser/:id",verifyToken,UserDetailsController.getGrievanceByAssignedToUser);

/*type: get
Route: Get Tasks list By Assigned To User Id 
*/
router.get("/getTasksByAssignedToUserId/:id",verifyToken,UserDetailsController.getTasksByAssignedToUserId);

module.exports = router;