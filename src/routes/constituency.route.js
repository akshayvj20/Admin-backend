const {Router} = require('express');
const {verifyToken} = require('../utils/utils.accessToken');
const constituencyController = require('../modules/constituency/constituency.controller');
const { uploadJsonFile } = require("../utils/utils.uploadFile");

const router = Router();

/*
type: post
Route: Create constituency 
*/
router.post('/createConstituency',verifyToken, uploadJsonFile, constituencyController.constituencyCreate);

/*
type: get
Route: Get all constituency
*/
router.get('/getAllConstituency',verifyToken,constituencyController.getConstituency);

/*
type: get
Route: Get Constituency Fil eUploaded Summary
*/
router.get("/getConstituencyFileUploadedSummary",verifyToken, constituencyController.getConstituencyFileUploadedSummary); 

/*
type: get
Route: Get all constituency By Type
*/
router.get('/getAllConstituencyByType/:type',verifyToken,constituencyController.getConstituencyByType);


/*
type: delete
Route: delete constituency by id
*/
router.delete('/deleteConstituency/:id',verifyToken,constituencyController.deleteConstituency);

/*
type: put
Route: update constituency by id
*/
router.put('/updateConstituency/:id',verifyToken,constituencyController.constituencyUpdate);

/*
type: get
Route: search constituency with keyword
*/
router.get("/search",verifyToken, constituencyController.searchConstituencyWithKeyword);

/*
type: get
Route: get constituency by id
*/
router.get("/getConstituencyById/:id",verifyToken, constituencyController.getConstituencyById);

/*
type: get
Route: get constituency summary by id
*/
router.get("/getConstituencysummaryById/:id",verifyToken, constituencyController.getConstituencysummaryById);

/*
type: get
Route: get constituency Table by id
*/
router.get("/getConstituencyTableById/:id",verifyToken, constituencyController.getConstituencyTableById); 

/*
type: get
Route: get Village Table by id
*/
router.get("/getVillageTableById/:id",verifyToken, constituencyController.getVillageTableById); 

/*
type: get
Route: Download Uploaded File by constituency id 
*/
router.get("/downloadUploadedFileByConstituencyId/:id",verifyToken, constituencyController.downloadUploadedFileByConstituencyId);


/*
type: delete
Route: delete uploaded form20 data by constituency id 
*/
router.delete("/deleteUploadedForm20DataByConstituencyId/:id",verifyToken, constituencyController.deleteUploadedForm20DataByConstituencyId); 

/*
type: delete
Route: delete uploaded Village data by constituency id 
*/
router.delete("/deleteUploadedVillageDataByConstituencyId/:id",verifyToken, constituencyController.deleteUploadedVillageDataByConstituencyId);

/*
type: delete
Route: delete uploaded Electoral Rolls data by constituency id 
*/
router.delete("/deleteUploadedElectoralRollsDataByConstituencyId/:id",verifyToken, constituencyController.deleteUploadedElectoralRollsDataByConstituencyId);

/*
type: delete
Route: delete uploaded PS village Mapping data by constituency id 
*/
router.delete("/deleteUploadedPSvillageMappingDataByConstituencyId/:id",verifyToken, constituencyController.deleteUploadedPSvillageMappingDataByConstituencyId);


module.exports = router;