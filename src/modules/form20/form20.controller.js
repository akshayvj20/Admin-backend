const Form20Service = require('./form20.service');
const Responses = require("../../utils/utils.response");
const { v4: uuid } = require('uuid');
const { Upload } = require("@aws-sdk/lib-storage");
const AwsClient = require("../../config/awsconfig")
const path = require('path');
const AWS3 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class Form20Controller {

    //upload csv data into mongoDB
    static async uploadCsvDataToDb(req, res) {
        try {
            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }
            let filename = `staging/constituency/${req.body.constituencyId}/${req.body.year}/form20/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

            let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            let getFileName = filename.substring(startIndex);
            if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                getFileName = getFileName.substring(1);
            }
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };

            const command = new AWS3.GetObjectCommand(params);
            const fileURL = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            const parallelUploads3 = new Upload({
                client: AwsClient.s3Instance,
                params: params,
            });

            const response = await parallelUploads3.done();

            if (response.$metadata.httpStatusCode !== 200) {
                throw Unauthorized("File uploading failed");
            }
            req.body.filePath = { name: getFileName, key: response.Key, publicUrl: fileURL };
            const result = await Form20Service.uploadCsvDataToDb(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    //upload csv data into mongoDB
    static async uploadVillageDataToDb(req, res) {
        try {
            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }
            let filename = `staging/constituency/${req.body.constituencyId}/${req.body.year}/village/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

            let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            let getFileName = filename.substring(startIndex);
            if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                getFileName = getFileName.substring(1);
            }
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };

            const command = new AWS3.GetObjectCommand(params);
            const fileURL = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            const parallelUploads3 = new Upload({
                client: AwsClient.s3Instance,
                params: params,
            });

            const response = await parallelUploads3.done();

            if (response.$metadata.httpStatusCode !== 200) {
                throw Unauthorized("File uploading failed");
            }
            req.body.filePath = { name: getFileName, key: response.Key, publicUrl: fileURL };
            const result = await Form20Service.uploadVillageDataToDb(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    //get uploaded csv data from mongoDB
    static async getForm20Data(req, res) {
        try {
            const result = await Form20Service.getForm20Data(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    // uploadElectoralRollsData
    static async uploadElectoralRollsData(req, res) {
        try {
            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }
            let filename = `staging/constituency/${req.body.constituencyId}/${req.body.year}/ElectoralRolls/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

            let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            let getFileName = filename.substring(startIndex);
            if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                getFileName = getFileName.substring(1);
            }
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };

            const command = new AWS3.GetObjectCommand(params);
            const fileURL = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            const parallelUploads3 = new Upload({
                client: AwsClient.s3Instance,
                params: params,
            });

            const response = await parallelUploads3.done();

            if (response.$metadata.httpStatusCode !== 200) {
                throw Unauthorized("File uploading failed");
            }
            req.body.filePath = { name: getFileName, key: response.Key, publicUrl: fileURL };
            const result = await Form20Service.uploadElectoralRollsData(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    // uploadPSVillageMappingData
    static async uploadPSVillageMappingData(req, res) {
        try {
            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }
            let filename = `staging/constituency/${req.body.constituencyId}/${req.body.year}/PSVillageMapping/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

            let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            let getFileName = filename.substring(startIndex);
            if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                getFileName = getFileName.substring(1);
            }
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };

            const command = new AWS3.GetObjectCommand(params);
            const fileURL = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            const parallelUploads3 = new Upload({
                client: AwsClient.s3Instance,
                params: params,
            });

            const response = await parallelUploads3.done();

            if (response.$metadata.httpStatusCode !== 200) {
                throw Unauthorized("File uploading failed");
            }
            req.body.filePath = { name: getFileName, key: response.Key, publicUrl: fileURL };
            const result = await Form20Service.uploadPSVillageMappingData(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    // uploadPartyColoursData
    static async uploadPartyColoursData(req, res) {
        try {
            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }
            let filename = `staging/constituency/${req.body.constituencyId}/${req.body.year}/PartyColours/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

            let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
            let getFileName = filename.substring(startIndex);
            if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                getFileName = getFileName.substring(1);
            }
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };

            const command = new AWS3.GetObjectCommand(params);
            const fileURL = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            const parallelUploads3 = new Upload({
                client: AwsClient.s3Instance,
                params: params,
            });

            const response = await parallelUploads3.done();

            if (response.$metadata.httpStatusCode !== 200) {
                throw Unauthorized("File uploading failed");
            }
            req.body.filePath = { name: getFileName, key: response.Key, publicUrl: fileURL };
            const result = await Form20Service.uploadPartyColoursData(req, res);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };
};

module.exports = Form20Controller;