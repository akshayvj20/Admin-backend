const ConstituencyData = require("../constituencyData/constituencyData.model")
const Constituency = require("../constituency/constituency.model");

class constituencyDataService{
    static async createConstituency(req){
        try{
            const constituencyId = req.body.constituencyId;
            console.log("constituency id: ",constituencyId);
            // Constituency.findById(constituencyId,function (err, docs) {
            //     if (err){
            //         return {
            //             status: false,
            //             data: null,
            //             message: err.message,
            //             error: err
            //         };
            //     }
            // });

            const result = await ConstituencyData.create(req.body);
            if (!result) {
                throw InternalServerError("Unable to create constituencyDataPoints");
            }
            return {
                status: true,
                data: result,
                message: "constituency data created successfully",
                error: null
            };
        }
        catch(error){
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async updateConstituencyDataPoints(req) {
        try {
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };

            const result = await ConstituencyData.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!result) {
                throw Unauthorized("Couldn't Update Constituency Data Points");
            }

            return {
                status: true,
                data: result,
                message: "Constituency Data Points updated successfully",
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

    static async ConstituencyDataPointsGetById(payload) {
        try {

            const result = await ConstituencyData.findOne({ _id: payload }, { __v: 0 });
            if (!result) {
                throw Unauthorized("Constituency data does not exist");
            }

            return {
                status: true,
                data: result,
                message: "Get Constituency data successfull",
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

module.exports = constituencyDataService;