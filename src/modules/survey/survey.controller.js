const fs = require('fs');
const { validationResult } = require('express-validator');
const { Unauthorized } = require("http-errors");
const Responses = require("../../utils/utils.response");
const SurveyService = require("../survey/survey.service");
const Survey = require("./survey.model");
const AwsClient = require("../../config/awsconfig")
const multerS3 = require('multer-s3');
const AWS3 = require("@aws-sdk/client-s3");
const DateFormatter = require("../../utils/utils.dateFormatter");
const gerPriURL = require("../../utils/utils.presignedURL")
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require('path');
const mongoose = require('mongoose');
const Category = require("../category/category.model");
const clientusers = require("../client/client.model");
const { v4: uuid } = require('uuid');

class SurveyController {

    static async getAllSurvey(req, res) {
        try {
            res.status(201).json(res.paginatedResults);
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async surveyCreate(req, res) {
        try {

            if (req.authData.user.type != 'superadmin') {

                throw Unauthorized("Only super admin can create survey");
            }

            if (req.body.subscribers && req.body.subscribers.length !== 0) {
                const getSubscribersList = req.body.subscribers;

                for (const clientId of getSubscribersList) {
                    const getClient = await clientusers.findById({ _id: clientId?._id }, { _id: 1 });
                    if (!getClient) {
                        throw Unauthorized(`Subscriber with ${clientId} does not exist`);
                    }
                }
                req.body.subscribers = getSubscribersList
                req.body.uploaderName = req.authData.user.firstName + " " + req.authData.user.lastName;
            }

            req.body.uploadedBy = req.authData.user._id;

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            const result = await SurveyService.createSurvey(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async surveyUpdate(req, res) {
        try {
            const getSurvey = await Survey.findOne({ _id: req.params.id }, { __v: 0 });

            if (!getSurvey) {
                throw Unauthorized("Survey does not exist");
            }

            if (req.authData.user.type != 'superadmin') {
                throw Unauthorized("Only super admin can update survey");
            }

            if (req.body.subscribers && req.body.subscribers.length !== 0) {
                const getSubscribersList = req.body.subscribers;

                for (const clientId of getSubscribersList) {
                    const getClient = await clientusers.findById({ _id: clientId?._id }, { _id: 1 });
                    if (!getClient) {
                        throw Unauthorized(`Subscriber with ${clientId} does not exist`);
                    }
                }
                req.body.subscribers = getSubscribersList
            }

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            const result = await SurveyService.surveyUpdate(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async surveyById(req, res) {
        try {
            const result = await SurveyService.getSurveyById(req.params.id);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async deleteSurveyById(req, res) {
        try {

            const getSurvey = await Survey.findOne({ _id: req.params.id }, { __v: 0 });

            if (!getSurvey) {
                throw Unauthorized("Survey does not exist");
            }

            const result = await SurveyService.surveyDelete(req.params.id);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))

        }
    }

    static async shareSurvey(req, res) {
        try {

            let getUser = await Survey.findOne({ _id: req.params.id, subscribers: { $all: [req.authData.id] } }, { _id: 1 });
            if (!getUser) {
                throw Unauthorized("Only subscriber can share survey");
            }

            const result = await SurveyService.shareSurvey(req.params);
            const {
                status, error, message, data
            } = result;

            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }


    static async getSearchAndFilterSurvey(req, res) {
        try {

            const result = await SurveyService.getSearchAndFilterSurvey(req);
            const { status, data, currentPage, totalPages, totalSurveyCount, message, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "totalSurveyCount": totalSurveyCount, "currentpage": currentPage, "totalpages": totalPages });

        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    // getFilterSurveys
    static async getFilterSurvey(req, res) {
        try {

            const result = await SurveyService.getFilterSurveys(req, req.query.field);
            const { status, error, message, data, currentPage, totalPages, totalSurveyCount } = result;
               
            res.json({ "error": error, "status": status, "message": message, "data": data, "totalSurveyCount": totalSurveyCount, "currentpage": currentPage, "totalpages": totalPages });       
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getAllClientSurvey(req, res) {
        try {

            const result = await SurveyService.getAllClientSurvey(req);
            const { status, data, currentPage, totalPages, message, surveyCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "surveyCount": surveyCount, "previousPage": previousPage, "nextPage": nextPage });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async uploadSurveyFile(req, res) {
        try {

            if (req.authData.user.type != 'superadmin') {
                throw Unauthorized("Only super admin can create survey");
            }

            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }

            let filename = `staging/survey/${DateFormatter.getMonth(new Date())}/${req.authData.user._id}/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

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

            if (response.$metadata.httpStatusCode === 200) {

                res.status(201).json(Responses.successResponse("File uploaded successfully", { name: getFileName, key: response.Key, publicUrl: fileURL }));

            } else {
                throw Unauthorized("File uploading failed");
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    //getAllClientSurveyByClientId
    static async getAllClientSurveyByClientId(req, res) {
        try {

            const result = await SurveyService.getAllClientSurveyByClientId(req);
            const { status, data, currentPage, totalPages, message, totaldocuments, previousPage, nextPage, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "previousPage": previousPage, "nextPage": nextPage, "totalpages": totalPages, "totalcount": totaldocuments });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // getAllRequestedSurveyFromClient
    static async getAllRequestedSurveyFromClient(req, res) {
        try {
            const result = await SurveyService.getAllRequestedSurveyFromClient(req);
            const { status, data, currentPage, totalPages, message, surveyCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "surveyCount": surveyCount, "previousPage": previousPage, "nextPage": nextPage });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // requestSurvey
    static async requestSurvey(req, res) {
        try {
            if (req.body.quickCall) {
                req.body.phone = req.authData.user.phone
            }

            req.body.clientId = req.authData.user._id;
            req.body.clientName = req.authData.user.firstName + " " + req.authData.user.lastName;

            const result = await SurveyService.requestSurvey(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // searchRequestedSurvey
    static async searchRequestedSurvey(req, res) {
        try {

            const result = await SurveyService.searchRequestedSurvey(req);
            const { status, data, currentPage, totalPages, message, totalSurveyCount, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "totalSurveyCount": totalSurveyCount, "currentpage": currentPage, "totalpages": totalPages });
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    // closeSurveyRequest
    static async closeSurveyRequest(req, res) {
        try {
            const result = await SurveyService.closeSurveyRequest(req.params.id);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // shareSurveyWithClient
    static async shareSurveyWithClient(req, res) {
        try {

            const result = await SurveyService.shareSurveyWithClient(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
}

module.exports = SurveyController;
