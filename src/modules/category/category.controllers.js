const { validationResult } = require('express-validator');
const EncryptDecrypt = require('../../utils/utils.encryptDecrypt');
const Responses = require("../../utils/utils.response");
const categoryService = require("../category/category.service");

class CategoryController {
    
    static async categoryCreate(req, res) {
        try {
            // Validate incoming input
            // ** input data validation process, if needed then it'll be used
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json(Responses.errorResponse(errors))
            // }
            let fullname = req.authData.user.firstName + " "+req.authData.user.lastName;
            req.body.createdBy = fullname;
            const result = await categoryService.createcategory(req.body);
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

    static async categorysGet(req, res) {
        try {
            const result = await categoryService.getAllcategory(req);
            const { status, data, currentPage, totalPages, message, totalCategories, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "totalCategories": totalCategories, "previousPage": previousPage, "nextPage": nextPage });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    //fetch category by Id
    static async categorysGetById(req, res) {
        // console.log(req.params,'req frm controllr');
        try {
            const result = await categoryService.getOnecategory(req,res);
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

    static async categoryUpdate(req, res) {
        try {

            // Validate incoming input
            // ** input data validation process, if needed then it'll be used
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json(Responses.errorResponse(errors))
            // }

            const result = await categoryService.categoryUpdate(req);
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

    static async categoryDelete(req, res) {
        try {
            const result = await categoryService.categoryDelete(req.params.id);
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

    // searchCategoryWithKeyword
    static async searchCategoryWithKeyword(req,res){ 
        try {
            const result = await categoryService.searchCategoryWithKeyword(req);
            const { status, data, currentPage, totalPages, message, totalCategories, error, previousPage, nextPage } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "currentpage": currentPage, "totalpages": totalPages, "totalCategories": totalCategories, "previousPage": previousPage, "nextPage": nextPage });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
}

module.exports = CategoryController;
