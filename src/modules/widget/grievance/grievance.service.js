// taskManagement
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const getTotalNewCreated = require("../helpers/getTotalNewCreatedInLastSevenDays");
const GrievanceModel = require("../../grievance/grievance.model");
const Responses = require("../../../utils/utils.response");

class GrievanceService {

    static async getTotalNewCreatedInLastSevenDays(req, res) {
        try {
    
            let getNewCreatedGrievance = await getTotalNewCreated.getTotalNewCreatedInLastSevenDays(GrievanceModel, {clientId: req.authData.user.organisationId});

            res.status(201).json({
                status: true,
                data: getNewCreatedGrievance,
                message: "get successfull",
                error: null
            })

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
};

module.exports = GrievanceService;
