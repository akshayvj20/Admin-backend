const UserDetailsService = require('./userDetails.service');
const Responses = require("../../utils/utils.response");

class UserDetailsController {

    //get grievances list by assignedToUserId
    static async getGrievanceByAssignedToUser(req, res) {
        try {
            const result = await UserDetailsService.getGrievanceByAssignedToUser(req, res);
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

    // getTasksByAssignedToUserId
    static async getTasksByAssignedToUserId(req, res) {
        try {
            const result = await UserDetailsService.getTasksByAssignedToUserId(req, res);
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

module.exports = UserDetailsController;