const { check } = require('express-validator');

const ticketDataValidation = [
    check('issueName').not().isEmpty(),
    check('companyName').not().isEmpty(),
    check('loggedBy').not().isEmpty(),
    check('email').isEmail().isLength({ min: 10, max: 30 }),
    check('phone', 'Mobile number should contains 10 digits') //custom error message
        .isLength({ min: 10, max: 10 }),
    check('date').not().isEmpty(),
    check('category').not().isEmpty(),
    check('category').not().isEmpty(),
    check('comment').not().isEmpty(),
    check('ticketStatus').not().isEmpty(),
];

module.exports = ticketDataValidation;