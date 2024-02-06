const { Router } = require('express');
const ClientUser = require("../modules/client/clientUser.model")
const ClientOffice = require("../modules/client/clientOffice.model")
const Client = require("../modules/client/client.model");
const Pagination = require("../utils/utils.pagination");
const { validationResult } = require('express-validator');
const ClientController = require('../modules/client/client.controllers');
const clientUserDataValidation = require("../modules/client/clientUser.validation")
const clientDataValidation = require('../modules/client/client.validation');
const { verifyToken } = require('../utils/utils.accessToken');
const ObjectId = require('mongoose').Types.ObjectId;
const router = Router();
const returnObj = { firstName: 1, lastName: 1, email: 1, _id: 1, subscription: 1, validityStart: 1, validityEnd: 1, role: 1 }
const clientReturnObj = { organisationName: 1, planType: 1, constituency: 1, validityStart: 1, validityEnd: 1 };
const manageAccessRole = require("../utils/utils.manage.access.Role");
// const verifyClientUserRole1 = manageAccessRole.verifyClientUserRole({ type: "client", role: ["client", "chief_of_staff"] });
const verifyGetUserById = manageAccessRole.verifyClientUserRole({ type: "client", isAllowToSupperAdmin: true, role: ['client', 'chief_of_staff'], query: { role: ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator'], query_type: "single", getuserByid: "_id" } });
const manageAccessBasedRoleAndQuery = require('../middleware/access.manage')
const CheckMiddleForGetPaginateClient = manageAccessBasedRoleAndQuery.verifyClientUserRole({ type: ["client", "superadmin"], role: ["client", "chief_of_staff"] },);
//**Important Note:- Do not change the order of the  get methods eg. 'info', 'filter' etc.; It'll cause error in get()*/
const fileUpload = require("../utils/utils.uploadUserProfile");
/*
type: post
Route: Create Client 
clientDataValidation:  Middleware used to validate client data
*/
router.post('/',verifyToken,async (req,res,next) =>{
    if(req.authData.user.type === "superadmin"){
        await Promise.all(
        clientDataValidation.map((rule) => rule.run(req))
        );
    }
    else if(req.authData.user.type === "admin" || req.authData.user.type === "client"){
        
        await Promise.all(
            clientUserDataValidation.map((rule) => rule.run(req))
        );
    }
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
     next();
},ClientController.clientCreate);  //add ClientData Validation

/*
type: get
Route: GET summary of one single office, by :id
*/
router.get('/getclientroles',ClientController.getclientroles);

/*
type: get
Route: GET summary of one single office, by :id
*/
router.get('/office/summary/:id',verifyToken,ClientController.officeSummary);

/*
type:post
Route: clientUser office
*/
router.post('/office',verifyToken, ClientController.clientOfficeCreate);

/*
type: get
Route: Get all ClientOffice with pagination
*/
router.get('/office/info',verifyToken, ClientController.ClientOfficeGetPaginate);

/*
type: PUT
Route: Update client office by ID
*/
router.put('/office/:id',verifyToken, ClientController.updateClientOfficeById);


/*
type: PUT
Route: Delete Client Office By Id
*/
router.delete('/office/:id',verifyToken, ClientController.deleteClientOfficeById);

/*
type: get
Route: Search all ClientOffice with keyword, with pagination
*/
router.get('/office/search',verifyToken, ClientController.searchOfficeWithKeyword);

/*
type: post
Route: ClientUser Login / LOGIN ROUTE FOR admin, manager,cadre,accountant,agent
*/
router.post('/login',ClientController.clientUserLogin);

/*
type: post
Route: Get Token For Carder / LOGIN ROUTE FOR Cadre
*/
router.post('/getTokenForCarder',ClientController.getTokenForCarder);


/*
type: get
Route: search client with keyword
*/
router.get("/search",verifyToken, ClientController.searchClientUserWithKeyword);

/*
type: get
Route: Search Client Admin By Keyword
*/
router.get("/SearchClientAdminByKeyword",verifyToken, ClientController.SearchClientAdminByKeyword);

/*
type: get
Route: Get all ClientUser with pagination
*/
router.get('/info', verifyToken, manageAccessBasedRoleAndQuery.verifyClientUserRole({ type: ["client", "superadmin"], role: ["client", "chief_of_staff"] },
    (req, res, next) => {
        let query = [];
        // Add this if pagination in APIs
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const startIndex = (page - 1) * limit

        // define default for all Super Admin user accessible this API 
        // Assign as array if Aggrigation Query Otherwise as a Object 
        query['default'] = [{
            '$lookup': {
                'from': 'clientoffices',
                'let': { 'officeId': '$officeId' },
                'pipeline': [{
                    '$match': {
                        '$expr': { '$eq': ['$_id', '$$officeId'] }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'officeName': 1
                    }
                }],
                'as': 'officeDetails'
            }
        },
        { '$sort': { 'createdAt': -1 } },
        { '$skip': startIndex },
        { '$limit': limit } ];
        
        // Query for Client Role user 
        query['client'] = [{
            "$match": {
                'organisationId': new ObjectId(req.authData.user?.organisationId)
            }
        },{
            '$lookup': {
                'from': 'clientoffices',
                'let': { 'officeId': '$officeId' },
                'pipeline': [{
                    '$match': {
                        '$expr': { '$eq': ['$_id', '$$officeId'] }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'officeName': 1
                    }
                }],
                'as': 'officeDetails'
            }
        },
        { '$sort': { 'createdAt': -1 } },
        { '$skip': startIndex },
        { '$limit': limit }
        ];

        // Query For chief of staf
        query['chief_of_staff'] = query['client'];
        return query;
    }), ClientController.clientUsersGetPaginate);


/*
type: put
parameter: id (clientid)
Route: Update client
*/
router.put('/:id', verifyToken, clientDataValidation, ClientController.clientUpdate);


/*
type: get
Route: Get all Client Admin with pagination
*/
router.get('/getAllClientAdmin',verifyToken, ClientController.getAllClientAdmin);

/*
type: get
Route: Get all deactivate Client Admin with pagination
*/
router.get('/getAllDeactivateClientAdmin',verifyToken, ClientController.getAllDeactivateClientAdmin);

/*
type: get
Route: Get all Client Admin BY Type ( GMS or TMS ) with pagination
*/
router.get('/getAllClientAdminByType/:type',verifyToken, ClientController.getAllClientAdminByType);

/*
type: get
Route: Filter Client user
*/
router.get('/filter',verifyToken, ClientController.getFilteredClientUser);

/*
type: get
Route: Get Client User by Id
*/
router.get('/clientUser/:id',verifyToken, verifyGetUserById, ClientController.clientUserGetById);

/*
type: put
parameter: id (clientid)
Route: Update Client user
userDataValidation:  middleware used to validate client data
*/
router.put('/clientUser/:id',verifyToken, ClientController.clientUserUpdate);

//get client with id
router.get('/:id',verifyToken,ClientController.getClientById);

/*
type: Delete
parameter: id (clientid)
Route: Delete Client user
*/
router.delete('/:id', verifyToken,ClientController.clientUserDelete);   

/*
type: put
parameter: id (clientid)
Route: Update Client Profile 
verifyToken:  Client Verification Middleware
*/
router.put("/info/profile/:id", verifyToken, fileUpload,ClientController.updateClientProfile);


/*
type: Get Client Profile Image
parameter: id (clientid)
verifyToken:  Client Verification Middleware
*/
router.get("/info/getProfileImage/:id", verifyToken, ClientController.getClientProfileImage);

module.exports = router;