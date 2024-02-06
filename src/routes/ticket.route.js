const { Router } = require('express');
const TicketController = require('../modules/ticket/ticket.controller');
const ticketDataValidation = require('../modules/ticket/ticket.validation');
const Pagination = require("../utils/utils.pagination");
const Tickets = require("../modules/ticket/ticket.model");
const { verifyToken } = require('../utils/utils.accessToken');
const router = Router();
const returnObj = {};

const manageAccessRole = require("../utils/utils.manage.access.Role");
const verifyClientUserRole = manageAccessRole.verifyClientUserRole({type: "client", role: ["client", "chief_of_staff"]});

//**Important Note:- Do not change the order of the  get methods eg. 'info', 'filter' etc.; It'll cause error in get()*/

/*
type: post
Route: Create Ticket 
*/
router.post('/', verifyToken,ticketDataValidation, TicketController.ticketCreate);

/*
type: get
Route: Get all tickets
*/
router.get('/info', verifyToken, Pagination.paginatedResults(Tickets, returnObj),TicketController.getAllTickets);

/*
type: get
Route: Get Filtered Ticket By category
*/
router.get('/filter',verifyToken,TicketController.getFilteredTicket);

/*
type: get
Route: search ticket with keyword
*/
router.get("/search",verifyToken, TicketController.searchTicketWithKeyword);

/*type: get
Route: Get Ticket status Summary 
*/
router.get("/getTicketStatusSummary",verifyToken,TicketController.getTicketsStatusSummary);

/*
type: get
Route: Get Ticket By Id
*/
router.get('/:id',verifyToken,TicketController.getTicketById);

/*
type: put
Route: update Ticket By Id
*/
router.put('/updateTicketById/:id',verifyToken,ticketDataValidation, TicketController.updateTicketById);


/*
type: put
Route: update Ticket status By Id
*/
router.put('/:id',verifyToken,ticketDataValidation, TicketController.updateTicketStatus);

/*
type: delete
parameter: id (ticketid)
Route: Detele ticket By Id
*/
router.delete('/:id',verifyToken, TicketController.deleteTicketById);



module.exports = router;