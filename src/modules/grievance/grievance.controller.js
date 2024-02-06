const GrievanceService = require("./grievance.service");
const Responses = require("../../utils/utils.response");
const { v4: uuid } = require('uuid');
const gerPriURL = require("../../utils/utils.presignedURL")
const { Upload } = require("@aws-sdk/lib-storage");
const AwsClient = require("../../config/awsconfig")
const path = require('path');
const AWS3 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Unauthorized } = require("http-errors");
const { validationResult } = require('express-validator');

class GrievanceController {
    static async createGrievance(req, res) {
        try {

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            const result = await GrievanceService.grievanceCreate(req);
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
            res.status(400).json(Responses.errorResponse(error));
        }


    }
    static async deleteGrievance(req, res) {
        try {
            const result = await GrievanceService.grievanceDelete(req.params.id);
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

    //get grievance by id
    static async getGrievanceById(req, res) {
        try {
            const result = await GrievanceService.getOneGrievance(req, res);
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
    }

    //get grievances by assignedToUserId
    static async getGrievanceByAssignedToUser(req, res) {
        try {
            const result = await GrievanceService.getGrievanceByAssignedToUser(req, res);
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
    }

    //get all grievance in paginated format
    static async grievanceGetPaginate(req, res) {
        try {
            let result = res.paginatedResults.data.results
           
            let getResult = await result.map(obj => {
                let newResults = {...obj._doc}
                if (obj.uploadImages.length !== 0) {

                    newResults.uploadImages = true;
                    return newResults
                } else {
                    newResults.uploadImages = false;
                    return newResults
                }
            });

            res.paginatedResults.data.results = getResult
            res.status(201).json(res.paginatedResults);
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async updateGrievance(req, res) {
        try {

            const result = await GrievanceService.grievanceUpdateService(req);
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

    //getGrievanceSummary
    static async getGrievanceSummary(req, res) {
        try {
            const result = await GrievanceService.getGrievanceSummary(req, res);
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
    }

    //getGrievanceSummaryByUserId
    static async getGrievanceSummaryByUserId(req, res) {
        try {
            const result = await GrievanceService.getGrievanceSummaryByUserId(req, res);
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
    }

    // uploadGrievanceImages
    static async uploadGrievanceImages(req, res) {
        try {

            if (req.files == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }

            var ResponseData = [];
            const file = req.files;
            for (const item of file) {

                let filename = `staging/clients/${req.authData.user._id}/grievance/${path.parse(item.originalname).name + uuid()}.${item.originalname.split('.').pop()}`;
                let startIndex = (filename.indexOf('\\') >= 0 ? filename.lastIndexOf('\\') : filename.lastIndexOf('/'));
                let getFileName = filename.substring(startIndex);
                if (getFileName.indexOf('\\') === 0 || getFileName.indexOf('/') === 0) {
                    getFileName = getFileName.substring(1);
                }
                let params = { Key: filename, Bucket: "polstrat-backend", Body: item.buffer };

                const command = new AWS3.GetObjectCommand(params);
                const fileURL = await await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 });

                const parallelUploads3 = new Upload({
                    client: AwsClient.s3Instance,
                    params: params,
                });

                const response = await parallelUploads3.done();

                if (response.$metadata.httpStatusCode === 200) {

                    ResponseData.push({ guid: uuid(), name: getFileName, key: response.Key, publicUrl: fileURL })
                } else {
                    throw Unauthorized("File uploading failed");
                }
            };

            res.status(201).json(Responses.successResponse("File uploaded successfully", ResponseData));

        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // getFilterGrievances
    static async getFilterGrievances(req, res) {
        try {

            const result = await GrievanceService.getFilterGrievances(req, req.query);
            const {
                status, error, message, data, currentPage, totalPages
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // updateGrievanceStatus
    static async updateGrievanceStatus(req, res) {
        try {

            const result = await GrievanceService.updateGrievanceStatus(req);
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

    // getGrievanceStatusSummary
    static async getGrievanceStatusSummary(req, res) {
        try {
            const result = await GrievanceService.getGrievanceStatusSummary(req, res);
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
    }

    // updateGrievanceById
    static async updateGrievanceById(req, res) {
        try {

            const result = await GrievanceService.updateGrievanceById(req);
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

    // getAllGrievanceByUser
    static async getAllGrievanceByUser(req, res) {
        try {

            const result = await GrievanceService.getAllGrievanceByUser(req, req.query);

            const { status, data, currentPage, totalPages, message, grievanceCount, error, previousPage, nextPage } = result;
            if (status) {
                return res.json(Responses.successResponse({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "grievanceCount": grievanceCount, "previousPage": previousPage, "nextPage": nextPage }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // searchGrievanceByKeyword
     static async searchGrievanceByKeyword(req, res) {
        try {

            const result = await GrievanceService.searchGrievanceByKeyword(req, req.query);
            const { status, data, currentPage, totalPages, message, totalGrievance, error, previousPage, nextPage } = result;
            if (status) {
                res.status(201).json(Responses.successResponse({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "totalGrievance": totalGrievance, "previousPage": previousPage, "nextPage": nextPage }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // getAllGrievanceByStatus
    static async getAllGrievanceByStatus(req, res) {
        try {

            const result = await GrievanceService.getAllGrievanceByStatus(req, req.query);

            const { status, data, currentPage, totalPages, message, grievanceCount, error, previousPage, nextPage } = result;
            if (status) {
                return res.json(Responses.successResponse({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "grievanceCount": grievanceCount, "previousPage": previousPage, "nextPage": nextPage }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async updateAllGrievanceStatus(req, res) {
        try {
            const result = await GrievanceService.updateAllGrievanceStatus(req);
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
module.exports = GrievanceController;