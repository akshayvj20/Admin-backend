const {
    createConstituency,
    getAllConstituency,
    deleteConstituencyById,
    updateConstituency,
    getConstituencyTableById,
    ConstituencySearch,
    ConstituencyGetById,
    getConstituencysummaryById,
    constituencyCreateWithType,
    getConstituencyByType,
    getVillageTableById,
    getConstituencyFileUploadedSummary,
    deleteUploadedForm20DataByConstituencyId,
    deleteUploadedVillageDataByConstituencyId,
    deleteUploadedElectoralRollsDataByConstituencyId,
    deleteUploadedPSvillageMappingDataByConstituencyId,
    downloadUploadedFileByConstituencyId
} = require("./constituency.service");
const Responses = require("../../utils/utils.response");

class constituencyController {
    //create constituency controller
    static async constituencyCreate(req, res) {
        try {
            const result = await createConstituency(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async getConstituency(req, res) {
        try {
            const result = await getAllConstituency(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async deleteConstituency(req, res) {
        try {
            const result = await deleteConstituencyById(req.params.id);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }
    static async constituencyUpdate(req, res) {
        try {
            const result = await updateConstituency(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }
    //search constituency with keyword
    static async searchConstituencyWithKeyword(req, res) {
        try {
            const result = await ConstituencySearch(req);
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

    static async getConstituencyById(req, res) {
        try {

            const result = await ConstituencyGetById(req.params.id);
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

    static async getConstituencyByType(req, res) {
        try {
            const result = await getConstituencyByType(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async getConstituencysummaryById(req, res) {
        try {

            const result = await getConstituencysummaryById(req);
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

    // getConstituencyTableById
    static async getConstituencyTableById(req, res) {
        try {

            const result = await getConstituencyTableById(req);
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

    // getVillageTableById
    static async getVillageTableById(req, res) {
        try {

            const result = await getVillageTableById(req);
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

    // getConstituencyFileUploadedSummary
    static async getConstituencyFileUploadedSummary(req, res) {
        try {

            const result = await getConstituencyFileUploadedSummary(req.params.id);
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

    static async deleteUploadedForm20DataByConstituencyId(req, res) {
        try {
            const result = await deleteUploadedForm20DataByConstituencyId(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async deleteUploadedVillageDataByConstituencyId(req, res) {
        try {
            const result = await deleteUploadedVillageDataByConstituencyId(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }


    // deleteUploadedElectoralRollsDataByConstituencyId
    static async deleteUploadedElectoralRollsDataByConstituencyId(req, res) {
        try {
            const result = await deleteUploadedElectoralRollsDataByConstituencyId(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async deleteUploadedPSvillageMappingDataByConstituencyId(req, res) {
        try {
            const result = await deleteUploadedPSvillageMappingDataByConstituencyId(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    static async downloadUploadedFileByConstituencyId(req, res) {
        try {
            const result = await downloadUploadedFileByConstituencyId(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 401).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }
}
module.exports = constituencyController;