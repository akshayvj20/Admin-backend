const grievanceModel = require("./grievance.model");
const Clients = require("../client/client.model");
const UniqueId = require("../../utils/utils.uniqueId");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const clientUserModel = require("../client/clientUser.model");
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl, getSignedUrlPromise } = require("@aws-sdk/s3-request-presigner");
const TaskModel = require("../task/task.model");
const ObjectId = require('mongoose').Types.ObjectId;
const ClientOffice = require('../client/clientOffice.model');

class GrievanceService {

    static async grievanceCreate(payload) {
        try {
            const _id = UniqueId.create_UUID('G');

            //clientId, constituencyId, officeId, createdbyCadreId, createdByCadreName, assignedToCadreId
            //categoryId subcategoryId should be auto fetch
            payload.body._id = _id;

            const clientUser = await clientUserModel.findOne({ _id: payload.authData.user._id });
            if (!clientUser) {
                return {
                    status: false,
                    data: null,
                    message: "User does not exists",
                    error: {
                        message: "User does not exists"
                    }
                };
            }

            payload.body['createdByUserId'] = clientUser._id;
            payload.body['createdByUserName'] = clientUser.firstName + " " + clientUser.lastName;
            payload.body['createdByUserRole'] = clientUser.role;
            payload.body['clientId'] = payload.authData.user.organisationId;
            payload.body['officeId'] = clientUser.officeId;
            const grievance = await grievanceModel.create({
                ...payload.body
            });

            if (!grievance) {
                throw InternalServerError("Unable to save grievance's data");
            }
            // For removeing publicUrl
            for (let image of grievance.uploadImages) {
                delete image.publicUrl
            }
            return {
                status: true,
                data: grievance,
                message: "grievance data saved Successfully",
                error: null
            };


        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            }
        }

    }

    static async grievanceDelete(payload) {
        try {

            const id = payload;
            const grievance = await grievanceModel.deleteOne({ _id: id });

            if (grievance.deletedCount === 0) {
                throw Unauthorized("grievance does not exist");
            }

            return {
                status: true,
                data: {
                    grievance
                },
                message: "grievance Delete successfully",
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

    //get grievance by id
    static async getOneGrievance(req) {
        try {
            const id = req.params.id;
            let query = req.query;


            const grievance = await grievanceModel.aggregate([
                {
                    $match: { "clientId": ObjectId(query.clientId), "_id": query._id }
                },
                {
                    $lookup: {
                        from: 'clientoffices',
                        localField: 'officeId',
                        foreignField: '_id',
                        as: 'officeData'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        grievanceTitle: 1,
                        clientId: 1,
                        constituencyId: 1,
                        officeId: 1,
                        status: 1,
                        createdByUserId: 1,
                        createdByUserName: 1,
                        createdByUserRole: 1,
                        visitorType: 1,
                        numberOfPeople: 1,
                        firstName: 1,
                        lastName: 1,
                        gender: 1,
                        email: 1,
                        phone: 1,
                        categoryId: 1,
                        categoryName: 1,
                        subCategoryId: 1,
                        subCategoryName: 1,
                        description: 1,
                        priority: 1,
                        uploadImages: 1,
                        postCompletionImages: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        assignedToUserId: 1,
                        assignedToUserName: 1,
                        officeName: "$officeData.officeName",
                        showImages: 1,
                        instructions: 1,
                        assignedToUserRole: 1,
                        dueDate: 1,
                        location:1,
                        promptQuestions: 1,
                        profilePicture: 1
                    }
                },
            ]);
            if (!grievance) {
                return {
                    status: false,
                    data: null,
                    message: "No grievances found",
                    error: "No grievance found"
                };
            }

            if (grievance[0].uploadImages) {

                for (let image of grievance[0].uploadImages) {

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: image.key
                    };

                    const command = new GetObjectCommand(params);
                    let accessKeyId = process.env.ACCESS_KEY;
                    let secretAccessKey = process.env.ACCESS_SECRET;
                    const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                    let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });

                    image.publicUrl = getUrl
                }
            }

            return {
                status: true,
                data: grievance[0],
                message: "Got the grievance successfully",
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

    //get grievances by assignedToUserId
    static async getGrievanceByAssignedToUser(req) {
        try {
            const id = req.params.id;
            const grievances = await
                grievanceModel.find({ "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) });

            //if greivance is null or array is empty throw error
            if (!grievances || grievances?.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "No grievances found for this user",
                    error: "No grievance found for this user"
                };
            }

            for (let grievance of grievances) {
                for (let image of grievance.uploadImages) {

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: image.key
                    };

                    const command = new GetObjectCommand(params);
                    let accessKeyId = process.env.ACCESS_KEY;
                    let secretAccessKey = process.env.ACCESS_SECRET;
                    const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                    let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });
                    image.publicUrl = getUrl
                }
            }
            return {
                status: true,
                data: grievances,
                message: "Got the grievance successfully",
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

    // Update Grievance
    static async grievanceUpdateService(payload) {
        try {
            const id = payload.params.id;

            const options = { new: true };
            const filter = { _id: id, clientId: payload.authData.user.organisationId };

            const result = await grievanceModel.findOne(filter);


            if (!result) {
                throw Forbidden("grievance with this id does not exist");
            }

            if (result.uploadImages) {

                for (let image of result.uploadImages) {

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: image.key
                    };

                    const command = new GetObjectCommand(params);
                    let accessKeyId = process.env.ACCESS_KEY;
                    let secretAccessKey = process.env.ACCESS_SECRET;
                    const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                    let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });

                    image.publicUrl = getUrl
                }
            }
            if (payload.body.cadreId != null) {
                const cadreData = await clientUserModel.findOne({ _id: payload.body.cadreId });
                if (!cadreData) {
                    throw Forbidden("cadre with this id does not exist");
                }
                const fullname = cadreData.firstName + " " + cadreData.lastName;
                const data = await grievanceModel.findByIdAndUpdate(
                    id, { assignedToCadreId: payload.body.cadreId, assignedToCadreName: fullname }, options
                );
                if (!data) {
                    throw Unauthorized("Couldn't assign cadre to the grievance");
                }
                return {
                    status: true,
                    data: data,
                    message: "grievance assigned successfully to the cadre",
                    error: null
                };
            }
            else {

                const clientUser = await clientUserModel.findOne({ _id: payload.authData.user._id, organisationId: payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "User does not exists",
                        error: {
                            message: "User does not exists"
                        }
                    };
                }

                payload.body['createdByUserId'] = clientUser._id;
                payload.body['createdByUserName'] = clientUser.firstName + " " + clientUser.lastName;
                payload.body['createdByUserRole'] = clientUser.role;
                payload.body['clientId'] = payload.authData.user.organisationId;
                payload.body['officeId'] = clientUser.officeId;
                payload.body['profilePicture'] = payload.authData.user.profileImageLink;

                const updatedData = payload.body;
                const data = await grievanceModel.findByIdAndUpdate(
                    filter, updatedData, options
                );

                if (!data) {
                    throw Unauthorized("Couldn't update grievance");
                }

                if (updatedData.status === "assigned") {

                    const _id = UniqueId.create_UUID('T');

                    const getClientOffice = await ClientOffice.findOne({ _id: clientUser.officeId }, { __v: 0 });
                    if (!getClientOffice) {
                        throw Unauthorized("getClientOffice does not exist");
                    }


                    let createTask = {
                        _id: _id,
                        clientId: result.clientId,
                        status: updatedData.status,
                        createdByUserId: result.createdByUserId,
                        createdByUserName: result.createdByUserName,
                        createdByUserRole: result.createdByUserRole,
                        assignedToUserId: updatedData.assignedToUserId,
                        assignedToUserName: updatedData.assignedToUserName,
                        assignedToUserRole: updatedData.assignedToUserRole,
                        title: result.grievanceTitle,
                        description: result.description,
                        location: result.location,
                        priority: result.priority,
                        uploadImages: updatedData.showImages === true ? result.uploadImages : null,
                        categoryId: result.categoryId,
                        categoryName: result.categoryName,
                        subCategoryId: result.subCategoryId,
                        subCategoryName: result.subCategoryName,
                        showImages: updatedData.showImages,
                        postCompletionImages: result.postCompletionImages,
                        grievanceId: result._id,
                        officeId: result.officeId,
                        officeName: getClientOffice.officeName,
                        dueDate: updatedData.dueDate,
                        profilePicture: updatedData.profilePicture,
                        promptQuestions: updatedData.promptQuestions
                    }
                    const task = await TaskModel.create(createTask);

                    if (!task) {
                        throw InternalServerError("Unable to save task's data");
                    }
                }

                return {
                    status: true,
                    data: data,
                    message: "grievance updated successfully",
                    error: null
                };
            }
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getGrievanceSummary
    static async getGrievanceSummary(req) {
        try {
            const grievance = await grievanceModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(req.authData.user.organisationId) } },
                    {
                        $group: {
                            _id: "$priority",
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
            if (!grievance) {
                return {
                    status: false,
                    data: null,
                    message: "No grievances found",
                    error: "No grievance found"
                };
            }

            return {
                status: true,
                data: grievance,
                message: "Got grievance summary successfully",
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

    // getGrievanceSummaryByUserId
    static async getGrievanceSummaryByUserId(req) {
        try {
            const id = req.params.id;
            const grievance = await grievanceModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) } },
                    {
                        $group: {
                            _id: "$priority",
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
            //if greivance is null or array is empty throw error
            if (!grievance || grievance?.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "No grievances summary found for this user",
                    error: "No grievance summary found for this user"
                };
            }

            return {
                status: true,
                data: grievance,
                message: "Got grievance summary successfully",
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


    // getFilterGrievances
    static async getFilterGrievances(req, field) {
        try {
            const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
            const current_page_number = parseInt(req.query.page) || 1; // 1st page
            let keyword = req.query.keyword;

            const queryObj = {
                "clientId": ObjectId(req.authData.user.organisationId),
                "categoryName": { $in: req.body.categoryName },
                "priority": { $in: req.body.priority },
                "grievanceStatus": { $in: req.body.grievanceStatus },
                "status": { $in: req.body.status }
            }

            const getGrievance = await grievanceModel.find(queryObj).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            if (getGrievance?.length === 0 || !getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }
            if (!getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }

            let totaldocuments = await grievanceModel.countDocuments(queryObj);

            let totalPages = Math.ceil(totaldocuments / no_of_docs_each_page);
            return {
                status: true,
                data: getGrievance,
                currentPage: current_page_number,
                totalPages,
                message: "Get filtered Grievance successfully",
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

    // updateGrievanceStatus
    static async updateGrievanceStatus(payload) {

        try {

            const id = payload.params.id;
            const options = { new: true };
            let query = { _id: id };
            let data = {};

            const result = await grievanceModel.findOne(query);

            if (!result) {
                throw Forbidden("Grievance with this id does not exist");
            }

            if (payload.query.status == "assigned") {

                if (!payload.query.userId) {
                    throw Forbidden("Assigned user id is require");
                }

                const getClientUser = await clientUserModel.findOne({ organisationId: payload.authData.user.organisationId, role: { $in: ["chief_of_staff", "client"] } });
                if (!getClientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Only client and chief_of_staff can assign grievance",
                        error: {
                            message: "Only client and chief_of_staff can assign grievance"
                        }
                    };
                }

                const clientUser = await clientUserModel.findOne({ _id: payload.query.userId, clientId: payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Assigned user does not exists",
                        error: {
                            message: "Assigned user does not exists"
                        }
                    };
                }

                data = await grievanceModel.findByIdAndUpdate(
                    id,
                    {
                        "status": "assigned",
                        "assignedToUserId": clientUser._id,
                        "assignedToUserName": clientUser.firstName + " " + clientUser.lastName,
                        "assignedByUserRole": clientUser.role
                    },
                    options
                );

                if (!data) {
                    throw Unauthorized("Couldn't update grievance");
                }
            }

            if (payload.query.status === "inProgress") {

                const clientUser = await grievanceModel.findOne({ _id: id, "assignedToUserId": payload.authData.user._id, "clientId": payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Grievance not assigned to this user",
                        error: {
                            message: "Grievance not assigned to this user"
                        }
                    };
                }

                if (clientUser.status == "assigned") {

                    data = await grievanceModel.findByIdAndUpdate(
                        id,
                        {
                            "status": "inProgress",
                        },
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update grievance");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update grievance because status is ${clientUser.status}`,
                        error: null
                    };
                }

            }

            if (payload.query.status == "pendingApproval") {
                const clientUser = await grievanceModel.findOne({ _id: id, "assignedToUserId": payload.authData.user._id, "clientId": payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Grievance not assigned to this user",
                        error: {
                            message: "Grievance not assigned to this user"
                        }
                    };
                }

                if (clientUser.status == "inProgress") {

                    data = await grievanceModel.findByIdAndUpdate(
                        id,
                        {
                            "status": "pendingApproval",
                        },
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update grievance");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update grievance because status is ${clientUser.status}`,
                        error: null
                    };
                }
            }

            if (payload.query.status == "complete") {

                if ((payload.authData.user.role != "client") && (payload.authData.user.role != "chief_of_staff")) {
                    return {
                        status: false,
                        data: null,
                        message: "Only client and chief_of_staff can update thi status",
                        error: {
                            message: "Only client and chief_of_staff can update thi status"
                        }
                    };
                }

                const getGrievance = await grievanceModel.findOne({ _id: id, clientId: payload.authData.user.organisationId });
                if (!getGrievance) {
                    return {
                        status: false,
                        data: null,
                        message: "Grievance not fount with this client id",
                        error: {
                            message: "Grievance not fount with this client id"
                        }
                    };
                }

                if (getGrievance.status == "pendingApproval") {

                    data = await grievanceModel.findByIdAndUpdate(
                        id,
                        {
                            "status": "complete",
                        },
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update grievance");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update grievance because status is ${getGrievance.status}`,
                        error: null
                    };
                }
            }

            return {
                status: true,
                data: data,
                message: "grievance status updated successfully",
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

    // getGrievanceStatusSummary
    static async getGrievanceStatusSummary(req) {
        try {
            const grievance = await grievanceModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(req.authData.user.organisationId) } },
                    {
                        $group: {
                            _id: "$status",
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
            if (!grievance) {
                return {
                    status: false,
                    data: null,
                    message: "Grievance Status Summary not found",
                    error: "Grievance Status Summary not found"
                };
            }

            return {
                status: true,
                data: grievance,
                message: "Got Grievance Status Summary successfully",
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

    // Update Grievance By Id
    static async updateGrievanceById(payload) {

        try {

            const id = payload.params.id;
            const options = { new: true };
            let query = {};
            let data = {};

            data = await grievanceModel.findByIdAndUpdate(
                payload.query.query,
                payload.query.update,
                options
            );

            if (!data) {
                throw Unauthorized("Couldn't update grievance");
            }

            return {
                status: true,
                data: data,
                message: "grievance status updated successfully",
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

    static async getAllGrievanceByUser(req, field) {
        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let grievanceCount;
        let totalPages;
        try {

            let queryObj = {};
            if (req.authData.user.role == "admin" || req.authData.user.role === "client" || req.authData.user.role === "chief_of_staff") {
                queryObj = { "clientId": ObjectId(req.authData.user.organisationId) }
            } else {

                queryObj = {
                    "createdByUserId": { $in: req.authData.user._id }
                }
            }

            const getGrievance = await grievanceModel.find(queryObj).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            grievanceCount = await grievanceModel.countDocuments(queryObj).exec();

            if (getGrievance?.length === 0 || !getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }
            if (!getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }

            let totaldocuments = await grievanceModel.countDocuments(queryObj);

            totalPages = Math.ceil(totaldocuments / no_of_docs_each_page);

            if (endIndex < grievanceCount) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            return {
                status: true,
                data: getGrievance,
                currentPage: current_page_number,
                totalPages,
                nextPage,
                previousPage,
                grievanceCount,
                message: "Get Grievance successfully",
                error: null
            };
        } catch (error) {
            return {
                currentPage: 0,
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // searchGrievanceByKeyword
    static async searchGrievanceByKeyword(req, field) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let keyword = req.query.keyword;
        let nextPage;
        let previousPage;
        let totalGrievance;
        let totalPages;
        let getGrievance;

        try {

            if (keyword === "") {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    message: "Pls add keyword or search string to search Grievance user",
                    error: "Pls add keyword or search string to search Grievance user"
                };
            }
            let query = {
                '$or': [
                    { '_id': { '$regex': keyword, '$options': 'i' } },
                    { 'grievanceTitle': { '$regex': keyword, '$options': 'i' } },
                    { 'createdByUserName': { '$regex': keyword, '$options': 'i' } },
                    { 'categoryName': { '$regex': keyword, '$options': 'i' } },
                    { 'subCategoryName': { '$regex': keyword, '$options': 'i' } },
                    { 'assignedToUserName': { '$regex': keyword, '$options': 'i' } },
                    { 'status': { '$regex': keyword, '$options': 'i' } },
                ],
                "clientId": ObjectId(req.authData.user.organisationId)
            }

            getGrievance = await grievanceModel.find(query).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalGrievance = await grievanceModel.countDocuments(query);
            totalPages = Math.ceil(totalGrievance / no_of_docs_each_page);

            if (getGrievance?.length === 0 || !getGrievance) {
                return {
                    status: true,
                    data: getGrievance,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalGrievance,
                    message: "Grievances not found",
                    error: null
                };
            }
            if (!getGrievance) {
                return {
                    status: true,
                    data: getGrievance,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalGrievance,
                    message: "Grievances not found",
                    error: null
                };
            }

            for (let grievance of getGrievance) {
                for (let image of grievance.uploadImages) {

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: image.key
                    };

                    const command = new GetObjectCommand(params);
                    let accessKeyId = process.env.ACCESS_KEY;
                    let secretAccessKey = process.env.ACCESS_SECRET;
                    const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                    let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });
                    image.publicUrl = getUrl
                }
            }

            totalPages = Math.ceil(totalGrievance / no_of_docs_each_page);
            if (endIndex < totalGrievance) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getGrievance.length != 0) {
                return {
                    status: true,
                    data: getGrievance,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalGrievance,
                    message: "Grievances found successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Grievance Not found",
                    error: "Grievance Not found"
                };
            }
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getAllGrievanceByStatus
    static async getAllGrievanceByStatus(req, field) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;

        let nextPage;
        let previousPage;
        let totalGrievance;
        let totalPages;
        let getGrievance;

        try {

            let query = {
                "status": "pendingApproval",
                "clientId": ObjectId(req.authData.user.organisationId)
            }

            getGrievance = await grievanceModel.find(query).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalGrievance = await grievanceModel.countDocuments(query);
            totalPages = Math.ceil(totalGrievance / no_of_docs_each_page);

            if (getGrievance?.length === 0 || !getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }
            if (!getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }

            for (let grievance of getGrievance) {
                for (let image of grievance.uploadImages) {

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: image.key
                    };

                    const command = new GetObjectCommand(params);
                    let accessKeyId = process.env.ACCESS_KEY;
                    let secretAccessKey = process.env.ACCESS_SECRET;
                    const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                    let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });
                    image.publicUrl = getUrl
                }
            }

            totalPages = Math.ceil(totalGrievance / no_of_docs_each_page);
            if (endIndex < totalGrievance) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getGrievance.length != 0) {
                return {
                    status: true,
                    data: getGrievance,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalGrievance,
                    message: "Grievances found successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Grievance Not found",
                    error: "Grievance Not found"
                };
            }
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async updateAllGrievanceStatus(payload) {
        try {

            const options = { new: true };
            let filter = {
                "status": "pendingApproval",
                "clientId": ObjectId(payload.authData.user.organisationId)
            };
            let data = {};

            data = await grievanceModel.updateMany(
                filter,
                {
                    "status": "complete",
                },
                options
            );

            if (!data) {
                throw Unauthorized("Couldn't update grievance");
            }

            return {
                status: true,
                data: data,
                message: "Grievance status updated successfully",
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
module.exports = GrievanceService;