
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const Category = require("../category/category.model");
const ObjectId = require('mongoose').Types.ObjectId;

class CategoryServices {

    // Create category
    static async createcategory(payload) {
        try {
            let data = [];

            //make category and then also make subcategory
            if (payload.categoryName != null && payload.subCategories != null && payload.subCategories.length > 0) {
                const { categoryName, createdBy } = payload;
                const checkcategory = await Category.findOne({ name: categoryName });
                if (checkcategory != null) {
                    throw Forbidden("category with this name exists 1");
                }
                // save category into the DB
                const categorydata = {
                    name: categoryName,
                    description: payload.categoryDescription,
                    createdBy: createdBy
                };
                const category = await Category.create(categorydata);
                if (!category) {
                    throw InternalServerError("Unable to save category 1");
                }
                data.push(category);
                const id = category._id.toString();
                for (let i = 0; i < payload.subCategories.length; i++) {

                    const { subCategoryName } = payload.subCategories[i];
                    const checksubCategoryName = await Category.findOne({ name: subCategoryName });
                    if (checksubCategoryName && checksubCategoryName.parentId == id) {
                        throw Forbidden("SubCategory with this name for this category already exists 1");
                    }
                    // save category into the DB
                    const subCategorydata = {
                        name: subCategoryName,
                        parentId: id,
                        description: payload.subCategories[i].subCategoryDescription,
                        createdBy: createdBy,
                        parentCategoriesName: category.name,
                    }
                    const subCategory = await Category.create(subCategorydata);
                    if (!subCategory) {
                        throw InternalServerError("Unable to save subcategory 1");
                    }
                    data.push(subCategory);
                }
            }
            //make only category
            else if (payload.categoryName != null && payload.subCategories == null) {
                const { categoryName } = payload;
                const checkcategory = await Category.findOne({ name: categoryName });
                if (checkcategory) {
                    throw Forbidden("category with this name exists 2");
                }
                // save category into the DB
                const category = await Category.create({
                    name: categoryName,
                    description: payload.categoryDescription,
                    createdBy: payload.createdBy
                });
                if (!category) {
                    throw InternalServerError("Unable to save category 2");
                }
                data.push(category);
                //return category details
            }
            //make subcategory only
            else if (payload.subCategories != null && payload.subCategories.length > 0 && payload.parentId != null) {
                const { parentId, createdBy } = payload;
                for (let i = 0; i < payload.subCategories.length; i++) {
                    const { subCategoryName, subCategoryDescription } = payload.subCategories[i];
                    const checkcategory = await Category.findOne({ _id: parentId });
                    if (!checkcategory) {
                        throw Forbidden("category with this name does not exists 3");
                    }
                    const checksubCategoryName = await Category.findOne({ name: subCategoryName });
                    if (checksubCategoryName && checksubCategoryName.parentId == parentId) {
                        throw Forbidden("SubCategory with this name for this category already exists 1");
                    }
                    // save category into the DB
                    const subCategory = await Category.create({
                        name: subCategoryName,
                        description: subCategoryDescription,
                        parentId: parentId,
                        parentCategoriesName: checkcategory.name,
                        createdBy: createdBy
                    });
                    if (!subCategory) {
                        throw InternalServerError("Unable to save subCategory 3");
                    }
                    data.push(subCategory);
                }
                //return category details
            }

            return {
                status: true,
                data: data,
                message: "category created successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    //Get All Category
    static async getAllcategory(req) {
        const no_of_docs_each_page = parseInt(req.query.size) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let foundCategories;
        let totalCategories;

        try {
            if (req.params.type === "sub") {

                if (req.query.parentId) {
                    foundCategories = await Category.aggregate([
                        {
                            $match: { "parentId": ObjectId(req.query.parentId) }
                        },
                        // {
                        //     $lookup: {
                        //         from: 'categories',
                        //         localField: 'parentId',
                        //         foreignField: '_id',
                        //         as: 'parentCategories'
                        //     }
                        // },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                description: 1,
                                createdBy: 1,
                                parentId: 1,
                                parentCategoriesName: 1,
                                createdAt: 1,
                                // parentCategoriesName: '$parentCategories.name'
                            }
                        },

                        { $sort: sort },
                        { $skip: no_of_docs_each_page * (current_page_number - 1) },
                        { $limit: no_of_docs_each_page },
                    ]);
                    totalCategories = await Category.countDocuments({ "parentId": ObjectId(req.query.parentId) }).exec();

                } else {

                    foundCategories = await Category.aggregate([
                        {
                            $match: {
                                parentId: { $exists: true }
                            }
                        },
                        // {
                        //     $lookup: {
                        //         from: 'categories',
                        //         localField: 'parentId',
                        //         foreignField: '_id',
                        //         as: 'parentCategories'
                        //     }
                        // },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                description: 1,
                                createdBy: 1,
                                parentId: 1,
                                createdAt: 1,
                                parentCategoriesName: 1,
                                // parentCategoriesName: '$parentCategories.name'
                            }
                        },

                        { $sort: sort },
                        { $skip: no_of_docs_each_page * (current_page_number - 1) },
                        { $limit: no_of_docs_each_page },
                    ]);
                    totalCategories = await Category.countDocuments({
                        "parentId": { $exists: true }
                    },).exec();
                }
            } else {

                foundCategories = await Category.aggregate([
                    // {
                    //     $lookup: {
                    //         from: 'categories',
                    //         localField: '_id',
                    //         foreignField: 'parentId',
                    //         as: 'subcategories'
                    //     }
                    // },
                    {
                        $match: {
                            parentId: { $exists: false }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            description: 1,
                            createdBy: 1,
                            createdAt: 1
                        }
                    },

                    { $sort: sort },
                    { $skip: no_of_docs_each_page * (current_page_number - 1) },
                    { $limit: no_of_docs_each_page },
                ]);

                totalCategories = await Category.countDocuments({ parentId: { $exists: false } }).exec();

            }
            var totalPages = Math.ceil(totalCategories / no_of_docs_each_page);
            if (endIndex < totalCategories) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (foundCategories.length != 0) {
                return {
                    status: true,
                    data: foundCategories,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalCategories,
                    message: "Categories found",
                    error: null
                };
            } else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Categories Not found",
                    error: "Categories Not found"
                };
            }

        } catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error searching Categories",
                error
            };
        }
    }

    //get one category
    static async getOnecategory(req) {
        try {
            const id = req.params.id;
            const category = await Category.findById({ _id: id });
            if (!category) {
                throw Unauthorized("category does not exist");
            }

            return {
                status: true,
                data: category,
                message: "Get one Category successfully",
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

    // Update category
    static async categoryUpdate(req) {
        try {

            // update category
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };

            const category = await Category.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!category) {
                throw Unauthorized("category does not exist");
            }

            // let { categoryName, department, type, description } = category;
            return {
                status: true,
                data: category,
                message: "category update successfully",
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

    static async categoryDelete(payload) {
        try {

            const id = payload;
            const category = await Category.deleteOne({ _id: id });

            if (category.deletedCount === 0) {
                throw Unauthorized("category does not exist");
            }

            return {
                status: true,
                data: {
                    category
                },
                message: "category Delete successfully",
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

    // searchCategoryWithKeyword
    static async searchCategoryWithKeyword(req) {
        const no_of_docs_each_page = parseInt(req.query.size) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let totalCategories;
        let totalPages;

        let getCategory;

        try {
            const keyword = req.query.keyword;
            if (keyword === undefined || keyword === "") {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "keyword is empty",
                    error
                };
            }

            if (req.params.type === "sub") {

                getCategory = await Category.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: keyword, $options: 'i' } },
                                { createdBy: { $regex: keyword, $options: 'i' } },
                                { parentCategoriesName: { $regex: keyword, $options: 'i' } },
                                { description: { $regex: keyword, $options: 'i' } } //parentCategoriesName
                            ],
                            parentId: { $exists: true }
                        },
                    },
                    // {
                    //     $lookup: {
                    //         from: 'categories',
                    //         localField: 'parentId',
                    //         foreignField: '_id',
                    //         as: 'parentCategories'
                    //     }
                    // },
                    // {
                    //     $match: {
                    //         "parentCategories": { $exists: true }, // Check if the join was successful
                    //     },
                    // },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            description: 1,
                            createdBy: 1,
                            parentId: 1,
                            createdAt: 1,
                            parentCategoriesName: 1,
                            // parentCategoriesName: '$parentCategories.name'
                        }
                    },

                    { $sort: sort },
                    { $skip: no_of_docs_each_page * (current_page_number - 1) },
                    { $limit: no_of_docs_each_page },
                ]);

                totalCategories = await Category.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: keyword, $options: 'i' } },
                                { createdBy: { $regex: keyword, $options: 'i' } }
                            ],
                            parentId: { $exists: true }
                        },
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'parentId',
                            foreignField: '_id',
                            as: 'parentCategories'
                        }
                    },
                    {
                        $match: {
                            "parentCategories": { $exists: true }, // Check if the join was successful
                        },
                    }
                ]);
                totalCategories = totalCategories.length;
                totalPages = Math.ceil(totalCategories / no_of_docs_each_page);
                if (!getCategory) {
                    return {
                        status: false,
                        data: [],
                        currentPage: current_page_number,
                        totalPages,
                        totalCategories,
                        message: "Categories Not found",
                        error: "Categories Not found"
                    };
                }
            } else {

                getCategory = await Category.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: keyword, $options: 'i' } },
                                { createdBy: { $regex: keyword, $options: 'i' } },
                                { description: { $regex: keyword, $options: 'i' } }
                            ],
                            parentId: { $exists: false }
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            description: 1,
                            createdBy: 1,
                            createdAt: 1,
                        }
                    },

                    { $sort: sort },
                    { $skip: no_of_docs_each_page * (current_page_number - 1) },
                    { $limit: no_of_docs_each_page },
                ]);

                totalCategories = await Category.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: keyword, $options: 'i' } },
                                { createdBy: { $regex: keyword, $options: 'i' } },
                                { description: { $regex: keyword, $options: 'i' } }
                            ],
                            parentId: { $exists: false }
                        },
                    }
                ]);
                totalCategories = totalCategories.length;
            }

            totalPages = Math.ceil(totalCategories / no_of_docs_each_page);
            if (endIndex < totalCategories) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getCategory.length != 0) {
                return {
                    status: true,
                    data: getCategory,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalCategories,
                    message: "Categories found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Categories Not found",
                    error: "Categories Not found"
                };
            }

        } catch (error) {
            return {
                status: false,
                data: [],
                totalPages,
                currentPage: current_page_number,
                message: "Error searching Categories",
                error
            };
        }
    }
}

module.exports = CategoryServices;
