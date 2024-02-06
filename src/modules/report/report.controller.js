const fs = require('fs');
const { validationResult } = require('express-validator');
const { Unauthorized } = require("http-errors");
const Responses = require("../../utils/utils.response");
const ReportService = require("../report/report.service");
const Reports = require("../report/report.model");
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

class ReportController {

    static async getAllReport(req, res) {
        try {

            const result = await ReportService.getAllReport(req);
            const { status, data, currentPage, totalPages, message, reportCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "reportCount": reportCount, "previousPage": previousPage, "nextPage": nextPage });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async reportCreate(req, res) {
        try {
            if (req.authData.user.type != 'superadmin') {
                throw Unauthorized("Only super admin can create report");
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
            req.body.uploadedBy = req.authData.user._id;
            req.body.uploaderName = req.authData.user.firstName + " " + req.authData.user.lastName;

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            const result = await ReportService.createReport(req);
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

    static async reportUpdate(req, res) {
        try {
            const getReport = await Reports.findOne({ _id: req.params.id }, { __v: 0 });

            if (!getReport) {
                throw Unauthorized("Report does not exist");
            }

            if (req.authData.user.type != 'superadmin') {
                throw Unauthorized("Only super admin can update report");
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

            const result = await ReportService.reportUpdate(req);
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

    static async reportById(req, res) {
        try {
            const result = await ReportService.getReportById(req.params.id);
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

    static async deleteReportById(req, res) {
        try {

            const getReport = await Reports.findOne({ _id: req.params.id }, { __v: 0 });

            if (!getReport) {
                throw Unauthorized("Report does not exist");
            }

            const result = await ReportService.reportDelete(req.params.id);
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

    static async shareReport(req, res) {
        try {

            // let getUser = await Reports.findOne({ _id: req.params.id, subscribers: { $all: [req.authData.id] } }, { _id: 1 });
            // if (!getUser) {
            //     throw Unauthorized("Only subscriber can share report");
            // }

            const result = await ReportService.shareReport(req.params);
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


    static async getSearchAndFilterReports(req, res) {
        try {

            const result = await ReportService.getSearchAndFilterReports(req);
            const { status, data, currentPage, totalPages, totalReportCount, message, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "totalReportCount": totalReportCount, "currentpage": currentPage, "totalpages": totalPages });

        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    // getFilterReports
    static async getFilterReports(req, res) {
        try {

            const result = await ReportService.getFilterReports(req, req.query.field);
            const { status, error, message, data, currentPage, totalPages, totalReportCount } = result;
            
            return  res.json({ "error": error, "status": status, "message": message, "data": data, "totalReportCount": totalReportCount, "currentpage": currentPage, "totalpages": totalPages });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getAllClientReport(req, res) {
        try {

            const result = await ReportService.getAllClientReport(req);
            const { status, data, currentPage, totalPages, message, reportCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "reportCount": reportCount, "previousPage": previousPage, "nextPage": nextPage });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async uploadReportFile(req, res) {
        try {

            if (req.authData.user.type != 'superadmin') {
                throw Unauthorized("Only super admin can create report");
            }

            if (req.file == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }

            let filename = `staging/report/${DateFormatter.getMonth(new Date())}/${req.authData.user._id}/${path.parse(req.file.originalname).name + uuid()}.${req.file.originalname.split('.').pop()}`;

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

    // reportAnIssue
    static async reportAnIssue(req, res) {
        try {

            const result = await ReportService.reportAnIssue(req);
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

    // getAllClientReportByClientId
    static async getAllClientReportByClientId(req, res) {
        try {

            const result = await ReportService.getAllClientReportByClientId(req);
            const { status, data, currentPage, totalPages, message, totaldocuments, previousPage, nextPage, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "previousPage": previousPage, "nextPage": nextPage, "totalpages": totalPages, "totalcount": totaldocuments });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // getAllRequestedReportFromClient
    static async getAllRequestedReportFromClient(req, res) {
        try {
            const result = await ReportService.getAllRequestedReportFromClient(req);
            const { status, data, currentPage, totalPages, message, reportCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "reportCount": reportCount, "previousPage": previousPage, "nextPage": nextPage });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // requestReport
    static async requestReport(req, res) {
        try {
            if(req.body.quickCall){
                req.body.phone = req.authData.user.phone
            }

            req.body.clientId = req.authData.user._id;
            req.body.clientName = req.authData.user.firstName + " " + req.authData.user.lastName;

            const result = await ReportService.requestReport(req);
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

    // shareReportWithClient
    static async shareReportWithClient(req, res) {
        try {

            const result = await ReportService.shareReportWithClient(req);
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

    static async searchRequestedReport(req, res) {
        try {

            const result = await ReportService.searchRequestedReport(req);
            const { status, data, currentPage, totalPages, message, totalReportCount, error } = result;

            return res.json({ "error": error, "status": status, "message": message, "data": data, "totalReportCount": totalReportCount, "currentpage": currentPage, "totalpages": totalPages });
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    // closeReportRequest
    static async closeReportRequest(req, res) {
        try {

            const result = await ReportService.closeReportRequest(req.params.id);
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
}

module.exports = ReportController;
