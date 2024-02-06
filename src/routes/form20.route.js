const {Router} = require("express");
var express = require('express')
const Form20Controller = require('../modules/form20/form20.controller');
const { verifyToken } = require('../utils/utils.accessToken');
const router = Router();
var path = require('path');
var multer = require('multer');
var bodyParser = require('body-parser');

const app = express();

app.use(express.static(path.resolve(__dirname,'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     },
// });

// var uploads = multer({ storage: storage })

/*type: post
Route: post csv data into mongo db
*/
router.post("/addCsvData",verifyToken,upload.single('csvFile'),Form20Controller.uploadCsvDataToDb);

/*type: post
Route: post csv data into mongo db
*/
router.post("/uploadVillageDataToDb",verifyToken,upload.single('csvFile'),Form20Controller.uploadVillageDataToDb);

/*type: post
Route: Upload PS Village Mapping data into mongo db
*/
router.post("/uploadPSVillageMappingData",verifyToken,upload.single('csvFile'),Form20Controller.uploadPSVillageMappingData);

/*type: post
Route: Upload Electoral Rolls Data
*/
router.post("/uploadElectoralRollsData",verifyToken,upload.single('csvFile'),Form20Controller.uploadElectoralRollsData);

/*type: post
Route: Upload Electoral Rolls Data
*/
router.post("/uploadElectoralRollsData",verifyToken,upload.single('csvFile'),Form20Controller.uploadElectoralRollsData); 

/*type: post
Route: Upload Party Colours
*/
router.post("/uploadPartyColoursData",verifyToken,upload.single('csvFile'),Form20Controller.uploadPartyColoursData); 



//get form20 data
router.get("/",verifyToken,Form20Controller.getForm20Data);

module.exports = router;