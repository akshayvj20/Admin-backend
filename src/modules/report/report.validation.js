const { check } = require('express-validator');

const reportDataValidation = [
    check('reportName').not().isEmpty(),
    check('resourceLocation').not().isEmpty(),
];

module.exports = reportDataValidation;