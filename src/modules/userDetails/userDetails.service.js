const taskModel = require("../task/task.model");
const grievanceModel = require("../grievance/grievance.model");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const clientUserModel = require("../client/clientUser.model");
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl, getSignedUrlPromise } = require("@aws-sdk/s3-request-presigner");
const ObjectId = require('mongoose').Types.ObjectId;

class UserDetailsService {

    //get grievances list by assignedToUserId
    static async getGrievanceByAssignedToUser(req) {
        try {
            const id = req.params.id;
            const grievances = await
                grievanceModel.find({ "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) },
                {grievanceTitle:1,categoryName:1,subCategoryName:1,status:1,priority:1});

            //if greivance is null or array is empty throw error
            if (!grievances || grievances?.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "No grievances found for this user",
                    error: "No grievance found for this user"
                };
            }
            return {
                status: true,
                data: grievances,
                message: "Got the grievance successfully",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    };

    // getTasksByAssignedToUserId
    static async getTasksByAssignedToUserId(req) {
        try {
            const id = req.params.id;
            const tasks = await taskModel.find({ "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) },
            {title:1,status:1,priority:1});
            if (!tasks || tasks?.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "No tasks found found for this user",
                    error: "No task found found for this user"
                };
            }
            return {
                status: true,
                data: tasks,
                message: "Got the task successfully",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    };
};

module.exports = UserDetailsService;