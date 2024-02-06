const multer = require("multer")
const path = require("path");
const fs = require("fs");
const DateFormatter = require("../utils/utils.dateFormatter");
let filePath = "uploads/images/" + DateFormatter.getMonth(new Date());
const jsonStorage = multer.memoryStorage(); // Store the uploaded file in memory

fs.access(filePath, (error) => {
    // To check if the given directory 
    // already exists or not
    if (error) {
        // If current directory does not exist
        // then create it
        fs.mkdir(filePath, (error) => {
            if (error) {
                console.log(error);
            }
        });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 50 * 1000 * 1000;

const upload = multer({
    //storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional

        const filetypes = /jpg|png|doc|docx|pdf/;

        if (!file.originalname.match(/\.(jpg|png|doc|docx|pdf|doc)$/)) { 
            // upload only jpg, png, doc, docx, pdf format
            return cb(new Error("Error: File upload only supports the "
            + "following filetypes - " + filetypes))
          }

        return cb(null, true);
    }

    // reportLink is the name of file attribute
}).single("reportLink");

const imageUpload = multer({
    //storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional

        const filetypes = /jpg|png/;

        if (!file.originalname.match(/\.(jpg|png)$/)) { 
            // upload only jpg, png, doc, docx, pdf format
            return cb(new Error("Error: Image upload only supports the "
            + "following filetypes - " + filetypes))
          }

        return cb(null, true);
    }

    // reportLink is the name of file attribute
}).single("grievanceImages");




const multipleUpload = multer({ 
    fileFilter: function (req, file, cb) {
        
        const filetypes = /jpg|png|jpeg/;

        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) { 
            // upload only jpg, png, jpeg format
            return cb(new Error("Error: File upload only supports the "
            + "following filetypes - " + filetypes))
          }

        return cb(null, true);
    }
    // storage: multerS3({
    //     s3,
    //     // acl: 'public-read',
    //     bucket: "polstrat-backend",
    //     contentType: multerS3.AUTO_CONTENT_TYPE,
    //     key: (req, file, cb) => {   
    //         const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    //         cb(null, `${fileName}${path.extname(file.originalname)}`);
    //     }
    // })
 }).array('grievanceImages', 5);

 const taskImagesUpload = multer({ 
    fileFilter: function (req, file, cb) {
        
        const filetypes = /jpg|png|jpeg/;

        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) { 
            // upload only jpg, png, jpeg format
            return cb(new Error("Error: File upload only supports the "
            + "following filetypes - " + filetypes))
          }

        return cb(null, true);
    }
 }).array('taskImages', 5);

 const uploadJsonFile = multer({ storage: jsonStorage }).single('boundaries', 1);


module.exports = { upload, imageUpload, multipleUpload, taskImagesUpload, uploadJsonFile };