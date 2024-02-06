const { check } = require('express-validator');

const taskDataValidation = 
    [
        check('status').not().isEmpty()
            .withMessage('Status required.'),
        check('title').not().isEmpty()
            .withMessage('Title required.'),
        check('description').not().isEmpty()
            .withMessage('Description is required.'),
        check('priority').not().isEmpty()
            .withMessage('Priority is required.'),
        check('taskStatus').not().isEmpty()
            .withMessage('Task Status required.')
    ];

module.exports = taskDataValidation;