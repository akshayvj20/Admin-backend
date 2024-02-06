const { Router } = require("express");
const GrievanceController = require("../modules/grievance/grievance.controller");
const Pagination = require("../utils/utils.pagination");
const { verifyToken } = require('../utils/utils.accessToken');
const grievanceModel = require("../modules/grievance/grievance.model")
const { multipleUpload } = require("../utils/utils.uploadFile");
const router = Router();
const returnObj = {} //return everything
const grievanceDataValidation = require("../modules/grievance/grievance.validation")
const manageAccessRole = require("../utils/utils.manage.access.Role");
const verifyClientUserRole = manageAccessRole.verifyClientUserRole({ type: "client", role: ["client", "chief_of_staff"] });
const verifyGetGrievanceByUserId = manageAccessRole.verifyGetGrievanceByUserId({ type: "client", role: ['client', 'chief_of_staff'], query: { role: ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator'], query_type: "single", model: "task", getuserByid: "_id" } });
const verifyUserRole = manageAccessRole.verifyUserRole({ type: "client", role: ['client', 'chief_of_staff'], query: { role: ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator'], query_type: "single", DMmodel: grievanceModel, getuserByid: "_id" } });
const manageAccessBasedRoleAndQuery = require('../middleware/access.manage');
const clientUserModel = require("../modules/client/clientUser.model");
const ObjectId = require('mongoose').Types.ObjectId;
const options = { new: true };
const PreVerify = require('../utils/preVerify_user_client')

/*
type: post
Route: upload Grievance images
fileUpload: Middleware used to upload a file
*/

router.post('/uploadGrievanceImages', verifyToken, multipleUpload, GrievanceController.uploadGrievanceImages);

// create grievance api
router.post("/createGrievance", verifyToken, grievanceDataValidation, GrievanceController.createGrievance);

/*type: get
Route: Filter Grievance API 
*/
router.post("/filterGrievance", verifyToken, GrievanceController.getFilterGrievances);

//Grievance Summary API
router.get("/getGrievanceSummary", verifyToken, GrievanceController.getGrievanceSummary);

//Search Grievance By Keyword
router.get("/searchGrievanceByKeyword", verifyToken, GrievanceController.searchGrievanceByKeyword);

//Grievance Summary By User Id API
router.get("/getGrievanceSummary/:id", verifyToken, GrievanceController.getGrievanceSummaryByUserId);

/*type: get
Route: Get Grievance status Summary 
*/
router.get("/getGrievanceStatusSummary", verifyToken, GrievanceController.getGrievanceStatusSummary);

// delete grievance api
router.delete("/:id", verifyToken, GrievanceController.deleteGrievance);

/*get grievance by id
// checkQuery secound middelware
// router.get("/getGrievance/:id",verifyToken, verifyGetGrievanceByUserId, checkQuery, GrievanceController.getGrievanceById);
// router.get("/getGrievance/:id",verifyToken, verifyGetGrievanceByUserId, GrievanceController.getGrievanceById);
// verifyUserRole
*/
router.get("/getGrievance/:id", verifyToken, manageAccessBasedRoleAndQuery.verifyClientUserRole({ type: ["client"], role: ["client", "chief_of_staff"], query: { role: ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator'] } },
    (req, res, next) => {

        let query = [];
        // define default for all Client Admin user accessible this API 
        // Assign as array if Aggrigation Query Otherwise as a Object 
        query['default'] = {
            "_id": req.params.id,
            "clientId": ObjectId(req.authData.user.organisationId),
        };

        // Query for Client Role user 
        query['clientUser'] = {
            "_id": req.params.id,
            "clientId": ObjectId(req.authData.user.organisationId),
            "assignedToUserId": ObjectId(req.authData.user._id)
        }
        // Query For chief of staf
        query['chief_of_staff'] = query['client'];
        return query;
    }), GrievanceController.getGrievanceById);

//get grievance by Assigned user id
router.get("/GrievanceByAssignToUser/:id", verifyToken, GrievanceController.getGrievanceByAssignedToUser);

//get all Grievances By Status
router.get("/getAllGrievanceByStatus", verifyToken, GrievanceController.getAllGrievanceByStatus)

//get all grievances with pagination By User
router.get("/getAllGrievanceByUser", verifyToken, GrievanceController.getAllGrievanceByUser)

//get all grievances with pagination
router.get("/", verifyToken, verifyClientUserRole, Pagination.paginatedResults(grievanceModel, returnObj), GrievanceController.grievanceGetPaginate)

// Update All "pendingApproval" grienvance status
router.put("/updateAllGrievanceStatus", verifyToken, GrievanceController.updateAllGrievanceStatus);

//update grienvance
router.put("/updateGrievanceStatus/:id", verifyToken, GrievanceController.updateGrievanceStatus);

//update grienvance
router.put("/updateGrievance/:id", verifyToken, GrievanceController.updateGrievance);

// updateGrievanceById
router.put("/updateGrievanceById/:id", verifyToken, manageAccessBasedRoleAndQuery.verifyClientUserRole({ type: ["client"], role: ["client", "chief_of_staff"] },
    async (req, res, next) => {

        let query = [];
        // define default for all Client Admin user accessible this API 
        // Assign as array if Aggrigation Query Otherwise as a Object 

        query['client'] = {
            _id: req.params.id,
            clientId: req.authData.user.organisationId,
        };

        // Query For chief of staf
        query['chief_of_staff'] = query['client'];
        return query;
    }),
    manageAccessBasedRoleAndQuery.verifyClientUserQueryRole({ clientUserRole: ["client", "chief_of_staff"], clientStatus: ["assigned", "complete"], query: { userRole: ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator'], clientUserStatus: ['inProgress', 'pendingApproval'] } },
        async (req, res, next) => {

            // let queries = {};
            let query = {};
            // define default for all Client Admin user accessible this API 
            // Assign as array if Aggrigation Query Otherwise as a Object 
            if (req.body.status === "assigned") {
                let clientUser = await PreVerify.verifyClientUser(req.body.assignedToUserId, req.authData.user.organisationId);

                if(!clientUser){
                    return false;
                }
                query['client'] = {
                    query: {
                        _id: req.params.id,
                        clientId: req.authData.user.organisationId,
                    },
                    update: {
                        "status": req.body.status,
                        "assignedToUserId": clientUser._id,
                        "assignedToUserName": clientUser.firstName + " " + clientUser.lastName,
                        "assignedToUserRole": clientUser.role,
                        "postCompletionImages": req.body.postCompletionImages,
                        "instructions": req.body.instructions,
                        "showImages": req.body.showImages
                    },
                    options
                }
            } else {

                query['client'] = {
                    query: {
                        _id: req.params.id,
                        clientId: req.authData.user.organisationId,
                    },
                    update: req.body,
                    options
                }
            }

            query['constituency_manager'] = {
                query: {
                    _id: req.params.id,
                    clientId: req.authData.user.organisationId,
                    assignedToUserId: req.authData.user._id
                },
                update: req.body,
                options
            };

            // Query For chief of staf
            query['chief_of_staff'] = query['client'];
            query['cadre'] = query['constituency_manager'];
            query['office_manager'] = query['constituency_manager'];
            query['data_entry_operator'] = query['constituency_manager'];

            return query;

        }),
    GrievanceController.updateGrievanceById);

module.exports = router;