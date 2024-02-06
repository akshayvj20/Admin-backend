const planModel = require("./plan.model");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");

class PlanService{
    static async createPlanService(payload){
        try{

            const data = await planModel.findOne({name:payload.body.name});
            
            if (data != null) {
                throw Forbidden("plan with this name exists");
            }

            const plan = await planModel.create({
                ...payload.body
            });
            if(!plan){
                throw InternalServerError("Unable to create Plan");
            }
            return {
                status: true,
                data: plan,
                message: "Plan Created Successfully",
                error: null
            };
        }
        catch(error){
            return {
                status: false,
                data: null,
                message: error.message,
                error
            }
        }
    }
    
    static async getAllPlan() {
        try {

            const plan = await planModel.find({});
            if (!plan) {
                throw Unauthorized("Plan does not exist");
            }

            return {
                status: true,
                data: plan,
                message: "Get all plan successfully",
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
    }
}

module.exports = PlanService;