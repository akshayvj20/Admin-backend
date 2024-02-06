const Responses = require("../../utils/utils.response");
const cadreService = require("../cadre/cadre.service");

class CadresController {

    static async getCadresTask(req, res) {

        try {
            const result = await cadreService.getCadresTask(req, res);
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

    static async getAllCadres(req, res) {

        try {
            const result = await cadreService.getAllcadre(req);
            const { status, data, currentPage, totalPages, message, error } = result;
            if (status) {
                return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages });
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getTasks(req, res) {

        try {
            const result = await cadreService.getTasks(req, res);
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

    // getSingleCarderSummaryAPIById
    static async getSingleCarderSummaryAPIById(req, res) {

        try {
            const result = await cadreService.getSingleCarderSummaryAPIById(req);
            const { status, data, currentPage, totalPages, message, error } = result;
            if (status) {
                return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages });
            } else {
                res.status(error.status || 404).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }


    // getCountOfTotalTasksAssignedToCadre
    static async getCountOfTotalTasksAssignedToCadre(req, res) {

        try {
            const result = await cadreService.getCountOfTotalTasksAssignedToCadre(req, res);
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

    static async cadresLogin(req, res) {
        try {
            const result = await cadreService.cadresLogin(req);
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
            res.status(401).json(Responses.errorResponse(error))
        }
    }
}

module.exports = CadresController;
