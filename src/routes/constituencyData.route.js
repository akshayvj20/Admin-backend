const {Router} = require('express');
const {verifyToken} = require('../utils/utils.accessToken');
const constituencyDataController = require('../modules/constituencyData/constituencyData.controller');

const router = Router();

/*
type: post
Route: Create constituency data points
*/
router.post('/createConstituencyDataPoints',verifyToken,constituencyDataController.constituencyDataCreate);

/*
type: put
Route: update constituency data points by id
*/
router.put('/updateConstituencyDataPoints/:id',verifyToken,constituencyDataController.constituencyDataPointsUpdate);


/*
type: get
Route: get constituency data points by id
*/
router.get("/getConstituencyDataPointsById/:id",verifyToken, constituencyDataController.getConstituencyDataPointsById);

module.exports = router;