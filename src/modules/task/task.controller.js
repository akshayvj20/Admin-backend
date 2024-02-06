const TaskService = require("./task.service");
const Responses = require("../../utils/utils.response");
const { v4: uuid } = require('uuid');
const gerPriURL = require("../../utils/utils.presignedURL")
const { Upload } = require("@aws-sdk/lib-storage");
const AwsClient = require("../../config/awsconfig")
const path = require('path');
const AWS3 = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class TaskController {
    static async createTask(req, res) {
        try {
            const result = await TaskService.taskCreate(req);
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

    static async deleteTask(req, res) {
        try {
            const result = await TaskService.taskDelete(req.params.id);
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

    //get task by id
    static async getTaskById(req, res) {
        try {
            const result = await TaskService.getOneTask(req, res);
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

    static async updateTask(req, res) {
        try {

            const result = await TaskService.taskUpdateService(req);
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

    // uploadTaskImages
    static async uploadTaskImages(req, res) {
        try {

            if (req.files == undefined) {
                return res.status(400).json(Responses.successResponse({ message: "Please upload a file!" }));
            }

            var ResponseData = [];
            const file = req.files;
            for (const item of file) {

                let filename = `staging/clients/${req.authData.user._id}/task/${path.parse(item.originalname).name + uuid()}.${item.originalname.split('.').pop()}`;
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

    // getAllTasks
    static async getAllTasks(req, res) {
        try {

            const result = await TaskService.getAllTasks(req);
            const { status, data, currentPage, totalPages, message, taskCount, error, previousPage, nextPage } = result;

            if (status) {
                return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "taskCount": taskCount, "previousPage": previousPage, "nextPage": nextPage });
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    //getTaskSummary
    static async getPrioritiesOfTask(req, res) {
        try {
            const result = await TaskService.getPrioritiesOfTask(req, res);
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

    // getTasksStatusSummary
    static async getTasksStatusSummary(req, res) {
        try {
            const result = await TaskService.getTasksStatusSummary(req, res);
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

    // getTasksByAssignedToUserId
    static async getTasksByAssignedToUserId(req, res) {
        try {
            const result = await TaskService.getTasksByAssignedToUserId(req, res);
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

    //getTasksStatusSummaryByUserId
    static async getTasksStatusSummaryByUserId(req, res) {
        try {
            const result = await TaskService.getTasksStatusSummaryByUserId(req, res);
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

    static async getAllTasksByStatus(req, res) {
        try {

            const result = await TaskService.getAllTasksByStatus(req, req.query);

            const { status, data, currentPage, totalPages, message, totalTask, taskCount, error, previousPage, nextPage } = result;
            if (status) {
                return res.json(Responses.successResponse({ "error": error, "status": status, "totalTask": totalTask, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "taskCount": taskCount, "previousPage": previousPage, "nextPage": nextPage }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // searchTaskByKeyword
    static async searchTaskByKeyword(req, res) {
        try {

            const result = await TaskService.searchTaskByKeyword(req);
            const { status, data, currentPage, totalPages, message, totalTask, error, previousPage, nextPage } = result;
            if (status) {
                res.status(201).json(Responses.successResponse({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "totalTask": totalTask, "previousPage": previousPage, "nextPage": nextPage }));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async updateTaskStatus(req, res) {
        try {

            const result = await TaskService.updateTaskStatus(req);
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
module.exports = TaskController;