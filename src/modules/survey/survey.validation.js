const { check } = require('express-validator');

const surveyDataValidation = [
    check('surveyName').not().isEmpty(),
    check('resourceLocation').not().isEmpty(),
];

module.exports = surveyDataValidation;