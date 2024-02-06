const { check } = require('express-validator');

const grievanceDataValidation =
    [
        check('visitorType').not().isEmpty()
            .withMessage('visitorType required.'),
        check('firstName').not().isEmpty()
            .withMessage('firstName is required.'),
        check('lastName').not().isEmpty()
            .withMessage('lastName required.'),
        check('gender').not().isEmpty()
            .withMessage('gender required.')
    ];

module.exports = grievanceDataValidation;