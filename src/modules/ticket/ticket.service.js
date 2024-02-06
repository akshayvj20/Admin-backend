
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const Tickets = require("../ticket/ticket.model");
const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

class TicketServices {

    // Create Ticket
    static async createTicket(payload) {
        try {
            const { issueName, companyName, loggedBy, email, phone, date, category, comment, ticketStatus } = payload.body;


            // save Ticket into the DB
            const Ticket = await Tickets.create({
                issueName,
                companyName,
                "clientId": payload.authData.user.organisationId,
                loggedBy,
                email,
                phone,
                date,
                category,
                comment,
                ticketStatus,
            });
            if (!Ticket) {
                throw InternalServerError("Unable to save Ticket's data");
            }
            return {
                status: true,
                data: Ticket,
                message: "Ticket create successfull",
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

    //Get Ticket By Id
    static async getTicketById(payload) {
        try {

            const Ticket = await Tickets.findOne({ _id: payload }, { __v: 0 });
            if (!Ticket) {
                throw Unauthorized("Ticket does not exist");
            }

            return {
                status: true,
                data: Ticket,
                message: "Get Ticket successfully",
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

    static async deleteTicketById(payload) {
        try {

            const id = payload;
            const ticket = await Tickets.deleteOne({ _id: id });

            if (ticket.deletedCount === 0) {
                throw Unauthorized("Ticket does not exist");
            }

            return {
                status: true,
                data: {
                    ticket
                },
                message: "Ticket Delete successfully",
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

    //filter by query string
    static async getFilteredTicket(payload) {
        const no_of_docs_each_page = parseInt(payload.query.size) || 10; // 10 docs in single page
        const current_page_number = parseInt(payload.query.page) || 1; // 1st page
        let sort = payload.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let TicketCount;
        let totalPages;

        try {
            let keyword = payload.query.keyword;
            let field = payload.query.field
            let Ticket;

            //filtering by specific field
            if (field === 'category') {
                Ticket = await Tickets.aggregate([
                    { $match: { clientId: ObjectId(payload.authData.user.organisationId), category: keyword } },
                    { $sort: sort },
                    { $skip: no_of_docs_each_page * (current_page_number - 1) },
                    { $limit: no_of_docs_each_page }
                ])
                TicketCount = await Tickets.countDocuments({ category: keyword }).exec();
                totalPages = Math.ceil(TicketCount / no_of_docs_each_page);
            }
            if (field === 'issueName') {
                Ticket = await Tickets.aggregate([
                    { $match: { clientId: ObjectId(payload.authData.user.organisationId), issueName: keyword } },
                    { $sort: sort },
                    { $skip: no_of_docs_each_page * (current_page_number - 1) },
                    { $limit: no_of_docs_each_page }
                ])

                TicketCount = await Tickets.countDocuments({ issueName: keyword }).exec();

                totalPages = Math.ceil(TicketCount / no_of_docs_each_page)
            }
            if (field === 'ticketStatus') {
                if (keyword === "assigned") {
                    Ticket = await Tickets.aggregate([
                        { $match: { clientId: ObjectId(payload.authData.user.organisationId), assignedTo: { $ne: null } } },
                        { $sort: sort },
                        { $skip: no_of_docs_each_page * (current_page_number - 1) },
                        { $limit: no_of_docs_each_page }
                    ])

                    TicketCount = await Tickets.countDocuments({ clientId: ObjectId(payload.authData.user.organisationId), assignedTo: { $ne: null } }).exec();
                    totalPages = Math.ceil(TicketCount / no_of_docs_each_page)
                } else if (keyword === "all") {
                    let query = {};
                    if(payload.authData.user.type === "client"){
                       query =  {clientId: ObjectId(payload.authData.user.organisationId) }
                    }

                    Ticket = await Tickets.aggregate([
                        { $match: query },
                        { $sort: sort },
                        { $skip: no_of_docs_each_page * (current_page_number - 1) },
                        { $limit: no_of_docs_each_page }
                    ])
                    TicketCount = await Tickets.countDocuments(query).exec();
                    totalPages = Math.ceil(TicketCount / no_of_docs_each_page);
                } else {
                    let query = { ticketStatus: keyword };
                    if(payload.authData.user.type === "client"){
                       query =  {clientId: ObjectId(payload.authData.user.organisationId), ticketStatus: keyword }
                    }
                    Ticket = await Tickets.aggregate([
                        { $match: query },
                        { $sort: sort },
                        { $skip: no_of_docs_each_page * (current_page_number - 1) },
                        { $limit: no_of_docs_each_page }
                    ])

                    TicketCount = await Tickets.countDocuments(query).exec();
                    totalPages = Math.ceil(TicketCount / no_of_docs_each_page);
                }
            }

            if (Ticket?.length === 0 || !Ticket) {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Ticket does not exist",
                    error: "Ticket does not exist"
                };

            }

            if (endIndex < TicketCount) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            return {
                status: true,
                data: Ticket,
                message: "Get filtered Ticket successfully",
                error: null,
                currentPage: current_page_number,
                totalPages,
                nextPage,
                previousPage,
                TicketCount
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: "Error while filtering Ticket",
                error,
                currentPage: current_page_number,
                totalPages
            };
        }
    }

    //update ticket ticketStatus
    static async updateTicketStatus(req) {
        // update ticket
        const id = req.params.id;
        const query = req.query.keyword;
        let status;

        if (query === 'close') {
            status = false;
        } else if (query === 'open') {
            status = true;
        }
        try {
            //checking if the query is correct
            if (!query || (query != 'close' && query != 'open')) {

                const updatedData = req.body;
                const options = { new: true };

                const Ticket = await Tickets.findByIdAndUpdate(
                    id, updatedData, options
                );
                if (!Ticket) {
                    throw Unauthorized("Ticket does not exist");
                }

                let { ticketStatus } = Ticket;
                return {
                    status: true,
                    data: { ticketStatus },
                    message: "Ticket updated successfully",
                    error: null
                };
                // throw Unauthorized("wrong query");
            }

            const Ticket = await Tickets.updateOne({ _id: id },
                {
                    $set: { ticketStatus: status }
                });

            if (!Ticket) {
                throw Unauthorized("Ticket does not exist");
            }

            let { ticketStatus } = Ticket;
            return {
                status: true,
                data: { ticketStatus },
                message: "Ticket updated successfully",
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

    static async TicketSearch(req) {
        const keyword = req.query.keyword;
        if (keyword === undefined || keyword === "") {
            return {
                status: false,
                data: null,
                message: "keyword is empty",
                error: "keyword is empty"
            };
        }
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        Tickets.count({}, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                results.totalPages = Math.round(result / limit);
            }
        });

        if (endIndex < await Tickets.countDocuments().exec()) {
            results.nextPage = page + 1;
        }

        if (page) {
            results.currentPage = page;
        }
        if (limit) {
            results.limit = limit;
        }

        if (startIndex > 0) {
            results.previousPage = page - 1;
        }

        try {
            results.results = await Tickets.find({
                '$or': [
                    { 'issueName': { '$regex': keyword, '$options': 'i' } },
                    { 'loggedBy': { '$regex': keyword, '$options': 'i' } },
                    { 'email': { '$regex': keyword, '$options': 'i' } },
                    { 'assignedToUserName': { '$regex': keyword, '$options': 'i' } },
                    { 'assignedTo': { '$regex': keyword, '$options': 'i' } }
                ]
            }, {}).limit(limit).skip(startIndex).exec()
            const noData = false;
            if (!results) {
                throw Unauthorized("Ticket does not exist");
            }
            return {
                status: 200,
                message: results.results.length === 0 ? 'not data available' : "Tickets Found successfully",
                data: results.results.length === 0 ? null : results,
                error: false,
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

    // Get Tickets Status Summary
    static async getTicketsStatusSummary(req) {
        try {
            let matchObj = {};
            if (req.authData.user.type === "client") {
                matchObj = {
                    clientId: ObjectId(req.authData.user.organisationId)
                }
            }
            const getAllTicket = await Tickets.aggregate(
                [
                    { $match: matchObj },
                    {
                        $group: {
                            _id: "$ticketStatus",
                            count: {
                                $sum: 1
                            },
                            new: {
                                $sum: 1
                            }
                        }
                    }
                ]
            );

            if (!getAllTicket) {
                return {
                    status: false,
                    data: null,
                    message: "Tickets Status Summary not found",
                    error: "Tickets Status Summary not found"
                };
            }

            let responseObj = {
                totalActiveTickets: 0,
                assignedTickets: 0,
                unassignedTickets: 0,
                resolvedTickets: 0
            };

            for (let ticket of getAllTicket) {
                if (ticket._id === "open" || ticket._id === "pending") {
                    responseObj["totalActiveTickets"] += ticket.count
                }
                if (ticket._id === "pending") {
                    responseObj["assignedTickets"] += ticket.count
                }
                if (ticket._id === "open") {
                    responseObj["unassignedTickets"] += ticket.count
                }
                if (ticket._id === "resolved") {
                    responseObj["resolvedTickets"] += ticket.count
                }
            }
            return {
                status: true,
                data: responseObj,
                message: "Got Tickets Status Summary successfully",
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

    //updateTicketById
    static async updateTicketById(req) {
        // update ticket
        const id = req.params.id;

        try {

            const updatedData = req.body;
            const options = { new: true };

            const Ticket = await Tickets.findByIdAndUpdate(
                id, updatedData, options
            );
            if (!Ticket) {
                throw Unauthorized("Ticket does not exist");
            }

            return {
                status: true,
                data: Ticket,
                message: "Ticket updated successfully",
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

module.exports = TicketServices;
