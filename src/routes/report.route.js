const express = require("express");
const ReportController = require('../modules/report/report.controller');
const reportDataValidation = require('../modules/report/report.validation');
const {upload} = require("../utils/utils.uploadFile");
const SubscriptionCheck = require("../utils/utils.subscriptionCheck");
const { verifyToken } = require('../utils/utils.accessToken');
const router = express.Router();
const returnObj = { __v: 0 }
const Reports = require("../modules/report/report.model");
const Pagination = require("../utils/utils.pagination");



/*
type: get 
Route: Get All Report
*/
// router.get('/', verifyToken, Pagination.paginatedResults(Reports, returnObj), ReportController.getAllReport);
router.get('/', verifyToken, ReportController.getAllReport);

/*
type: get
Route: Get All requested report from client API 
*/
router.get("/getAllRequestedReportFromClient",verifyToken, ReportController.getAllRequestedReportFromClient);

/*
type: get
Route: Filter report API 
*/
router.get("/filterReport",verifyToken, ReportController.getFilterReports);

/*
type: get
Route:get Filtered report API 
*/
router.get("/searchAndFilter",verifyToken, ReportController.getSearchAndFilterReports);


/*
type: get
Route:get Filtered report API 
*/
router.get("/searchRequestedReport/requested",verifyToken, ReportController.searchRequestedReport);

/*
type: Get
Route: Get Client Report
*/
router.get('/client/getReport', verifyToken,ReportController.getAllClientReport);

/*
type: Get
Route: Get Client Report By Client Id
*/
router.get('/client/getReportClientId/:id', verifyToken,ReportController.getAllClientReportByClientId);

/*
type: post
Route: Upload Report File
fileUpload: Middleware used to upload a file
reportDataValidation:  Middleware used to validate report data
*/

router.post('/uploadReportFile',verifyToken, upload, ReportController.uploadReportFile);

/*
type: post
Route: Request Report
*/

router.post('/requestReport',verifyToken, ReportController.requestReport);

/*
type: post
Route: Share Report with client
*/

router.put('/client/shareReportWithClient',verifyToken, ReportController.shareReportWithClient);

/*
type: post
Route: Report An Issue
*/

router.post('/reportAnIssue',verifyToken, ReportController.reportAnIssue);

/*
type: post
Route: Create Report 
fileUpload: Middleware used to upload a file
reportDataValidation:  Middleware used to validate report data
*/

router.post('/',verifyToken, reportDataValidation, ReportController.reportCreate);

/*
type: put
parameter: id (reportid)
Route: Update Report
fileUpload: Middleware used to upload a file
reportDataValidation:  Middleware used to validate report data
*/
router.put('/:id', verifyToken, reportDataValidation, ReportController.reportUpdate);

/*
type: get
Route: Get Report by id API
parameter: id (reportid)
*/
router.get('/:id', verifyToken,SubscriptionCheck.checkSubscription ,ReportController.reportById);

/*
type: detele
Route: Delete Request Report by id API
parameter: id (reportid)
*/
router.delete('/closeReportRequest/:id',verifyToken, ReportController.closeReportRequest);

/*
type: detele
Route: Delete Report by id API
parameter: id (reportid)
*/
router.delete('/:id',verifyToken, ReportController.deleteReportById);

/*
type: get
Route: Share report API 
parameter: id (reportid)
*/
router.get('/sharereport/:id/:email', verifyToken,ReportController.shareReport);

module.exports = router;