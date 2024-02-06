const { createConstituency,updateConstituencyDataPoints,ConstituencyDataPointsGetById} = require("../constituencyData/constituencyData.service");
const Responses = require("../../utils/utils.response");

class constituencyDataController {
    //create constituency controller
    static async constituencyDataCreate(req,res){
        try{
            const result = await  createConstituency(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch(error){
            res.status(400).json(Responses.errorResponse(error));
        }
    }
    static async constituencyDataPointsUpdate(req,res){
        try{
            const result = await updateConstituencyDataPoints(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch(error){
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async getConstituencyDataPointsById(req, res) {
        try {
            
            const result = await ConstituencyDataPointsGetById(req.params.id);
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
module.exports = constituencyDataController;