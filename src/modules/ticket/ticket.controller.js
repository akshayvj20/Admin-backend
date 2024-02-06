const { validationResult } = require('express-validator');
const Responses = require("../../utils/utils.response");
const TicketService = require("../ticket/ticket.service");
const Tickets = require("../ticket/ticket.model");

class TicketController {

    static async ticketCreate(req, res) {
        try {

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            const result = await TicketService.createTicket(req);
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
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getTicketById(req, res) {
        try {
            
            const result = await TicketService.getTicketById(req.params.id);
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

    //fetch multiple users with pagination
    static async getAllTickets(req,res){
        try {
            res.status(201).json(res.paginatedResults);
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    //search user with keyword
    static async searchTicketWithKeyword(req,res){ 
        try {
            const result = await TicketService.TicketSearch(req);
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

    static async getFilteredTicket(req, res) {
        try {
            
            const result = await TicketService.getFilteredTicket(req);
            const { status, data, currentPage, totalPages, message, TicketCount, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "TicketCount": TicketCount, "previousPage": previousPage, "nextPage": nextPage });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async updateTicketStatus(req, res) {
        try {

            if(!req.query.keyword){
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json(Responses.errorResponse(errors))
                }
            }
            
            const result = await TicketService.updateTicketStatus(req);
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

    static async deleteTicketById(req, res) {
        try {
            
            const result = await TicketService.deleteTicketById(req.params.id);
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

    // getTicketsStatusSummary
    static async getTicketsStatusSummary(req, res) {
        try {
            const result = await TicketService.getTicketsStatusSummary(req, res);
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

        static async updateTicketById(req, res) {
        try {
            
            const result = await TicketService.updateTicketById(req);
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

module.exports = TicketController;
