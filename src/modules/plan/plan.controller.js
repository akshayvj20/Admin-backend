const PlanService = require("./plan.service");
const Responses = require("../../utils/utils.response");

class PlanController{
    static async createPlan(req,res){
        try{

            const result = await PlanService.createPlanService(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch(error){
            res.status(400).json(Responses.errorResponse(error))
        }
    }
    static async getPlan(req,res){
        try{

            const result = await PlanService.getAllPlan();
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch(error){
            res.status(400).json(Responses.errorResponse(error))
        }
    }
}
module.exports = PlanController;