const express = require("express");
const SurveyController = require('../modules/survey/survey.controller');
const surveyDataValidation = require('../modules/survey/survey.validation');
const { upload } = require("../utils/utils.uploadFile");
const SubscriptionCheck = require("../utils/utils.subscriptionCheck");
const { verifyToken } = require('../utils/utils.accessToken');
const router = express.Router();
const returnObj = { __v: 0 }
const Survey = require("../modules/survey/survey.model");
const Pagination = require("../utils/utils.pagination");



/*
type: get 
Route: Get All Survey by API
*/
router.get('/', verifyToken, Pagination.paginatedResults(Survey, returnObj), SurveyController.getAllSurvey);

/*
type: get
Route: Filter Survey API 
*/
router.get("/filterSurvey", verifyToken, SurveyController.getFilterSurvey);

/*
type: get
Route:get Filtered Survey API 
*/
router.get("/searchAndFilter", verifyToken, SurveyController.getSearchAndFilterSurvey);

/*
type: get
Route:get Filtered report API 
*/
router.get("/searchRequestedSurvey/requested",verifyToken, SurveyController.searchRequestedSurvey);

/*
type: Get
Route: Get Client Survey
*/
router.get('/client/getSurvey', verifyToken, SurveyController.getAllClientSurvey);

/*
type: post
Route: Share Survey with client
*/

router.put('/client/shareSurveyWithClient',verifyToken, SurveyController.shareSurveyWithClient);

/*
type: Get
Route: Get Client Survey By Client Id
parameter: id (Client Id)
*/
router.get('/getSurveyClientId/:id', verifyToken,SurveyController.getAllClientSurveyByClientId);


/*
type: post
Route: Upload Survey File
fileUpload: Middleware used to upload a file
SurveyDataValidation:  Middleware used to validate Survey data
*/

router.post('/uploadSurveyFile', verifyToken, upload, SurveyController.uploadSurveyFile);



/*
type: post
Route: Request Survey 
*/

router.post('/client/requestSurvey',verifyToken, SurveyController.requestSurvey);


/*
type: get
Route: Get All requested Survey from client API 
*/
router.get("/client/getAllRequestedSurveyFromClient",verifyToken, SurveyController.getAllRequestedSurveyFromClient);

/*
type: post
Route: Create Survey 
fileUpload: Middleware used to upload a file
SurveyDataValidation:  Middleware used to validate Survey data
*/

router.post('/', verifyToken, surveyDataValidation, SurveyController.surveyCreate);

/*
type: put
parameter: id (surveyid)
Route: Update survey
fileUpload: Middleware used to upload a file
surveyDataValidation:  Middleware used to validate survey data
*/
router.put('/:id', verifyToken, surveyDataValidation, SurveyController.surveyUpdate);

/*
type: get
Route: Get survey by id API
parameter: id (surveyid)
*/
router.get('/:id', verifyToken, SubscriptionCheck.checkSubscription, SurveyController.surveyById);

/*
type: detele
Route: Delete Request Survey by id API
parameter: id (reportid)
*/
router.delete('/closeSurveyRequest/:id',verifyToken, SurveyController.closeSurveyRequest);

/*
type: detele
Route: Delete Survey by id API
parameter: id (surveyid)
*/
router.delete('/:id', verifyToken, SurveyController.deleteSurveyById);

/*
type: get
Route: Share survey API 
parameter: id (surveyid)
*/
router.get('/sharesurvey/:id/:email', verifyToken, SurveyController.shareSurvey);


module.exports = router;