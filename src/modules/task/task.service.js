const taskModel = require("./task.model");
const UniqueId = require("../../utils/utils.uniqueId");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const clientUserModel = require("../client/clientUser.model");
const ObjectId = require('mongoose').Types.ObjectId;
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class TaskService {

    static async taskCreate(payload) {
        try {
            const _id = UniqueId.create_UUID('T');
            payload.body._id = _id;
            const clientUserId = payload.authData.user._id;
            payload.body.clientId = clientUserId;
            const client = await clientUserModel.findOne({ _id: clientUserId });
            if (!client) {
                return {
                    status: false,
                    data: null,
                    message: "Unable to create task, Because user with this organization does not exist",
                    error: {
                        message: "Unable to create task, Because user with this organization does not exist"
                    }
                };
            }

            payload.body["clientId"] = payload.authData.user.organisationId;
            payload.body["createdByUserId"] = client._id;
            payload.body["createdByUserName"] = client.firstName + " " + client.lastName;
            payload.body["createdByUserRole"] = client.role;

            const task = await taskModel.create({
                ...payload.body
            });

            if (!task) {
                throw InternalServerError("Unable to save task's data");
            }
            if (task.uploadImages) {
                for (let image of task.uploadImages) {
                    delete image.publicUrl
                }
            }
            return {
                status: true,
                data: task,
                message: "task data saved Successfully",
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

    static async taskDelete(payload) {
        try {

            const id = payload;
            const task = await taskModel.deleteOne({ _id: id });

            if (task.deletedCount === 0) {
                throw Unauthorized("Task does not exist");
            }

            return {
                status: true,
                data: {
                    task
                },
                message: "Task Delete successfully",
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

    //get task by id
    static async getOneTask(req) {
        try {
            const id = req.params.id;
            const task = await taskModel.findById({ _id: id });
            if (!task) {
                return {
                    status: false,
                    data: null,
                    message: "No tasks found",
                    error: "No task found"
                };
            }
            if (task.uploadImages) {

                for (let image of task.uploadImages) {

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

            if (task.postCompletionImages && task.postCompletionImages.length !== 0) {

                for (let image of task.postCompletionImages) {

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
                data: task,
                message: "Got the task successfully",
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

    // Update Task
    static async taskUpdateService(payload) {
        try {
            const id = payload.params.id;
            const options = { new: true };

            // if (!payload.body.title) {
            //     throw Forbidden("Task title is required ");
            // }

            const result = await taskModel.findOne({ _id: id });
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
            if (!result) {
                throw Forbidden("Task with this id does not exist");
            }

            const updatedData = payload.body;
            const data = await taskModel.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!data) {
                throw Unauthorized("Couldn't update task");
            }
            return {
                status: true,
                data: data,
                message: "Task updated successfully",
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

    // getAllTasks
    static async getAllTasks(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let totalPages;
        let previousPage;
        let nextPage;
        let taskCount;
        try {

            let clientUserRole = ['constituency_manager', 'cadre', 'office_manager', 'data_entry_operator']
            let queryObj = {};
            if (req.authData.user.role == "admin" || req.authData.user.role === "client" || req.authData.user.role === "chief_of_staff") {
                queryObj = { "clientId": ObjectId(req.authData.user.organisationId) }
            }
            if (clientUserRole.includes(req.authData.user.role)) {

                queryObj = {
                    '$or': [
                        { 'createdByUserId': ObjectId(req.authData.user._id) },
                        { 'assignedToUserId': ObjectId(req.authData.user._id) }
                    ]
                }
            }

            const getTask = await taskModel.find(queryObj).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            for (let task of getTask) {
                if (task.uploadImages) {

                    for (let image of task.uploadImages) {

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
            }

            taskCount = await taskModel.countDocuments(queryObj);
            totalPages = Math.ceil(taskCount / no_of_docs_each_page);

            if (getTask?.length === 0 || !getTask) {
                return {
                    status: true,
                    data: getTask,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalTask,
                    message: "Tasks not found",
                    error: null
                };
            }

            if (endIndex < taskCount) {
                nextPage = current_page_number + 1;
            }

            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            return {
                status: true,
                data: getTask,
                currentPage: current_page_number,
                totalPages,
                nextPage,
                previousPage,
                taskCount,
                message: "Get Task successfully",
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

    // getPrioritiesOfTaskSummary
    static async getPrioritiesOfTask(req) {
        try {
            const task = await taskModel.aggregate(
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
            if (!task) {
                return {
                    status: false,
                    data: null,
                    message: "No tasks found",
                    error: "No task found"
                };
            }

            return {
                status: true,
                data: task,
                message: "Got Priorities Of Task successfully",
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

    // getTasksStatusSummary
    static async getTasksStatusSummary(req) {
        try {
            const task = await taskModel.aggregate(
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
            if (!task) {
                return {
                    status: false,
                    data: null,
                    message: "Tasks Status Summary not found",
                    error: "Tasks Status Summary not found"
                };
            }

            return {
                status: true,
                data: task,
                message: "Got Tasks Status Summary successfully",
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

    // getTasksByAssignedToUserId
    static async getTasksByAssignedToUserId(req) {
        try {
            const id = req.params.id;
            const tasks = await taskModel.find({ "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) });
            if (!tasks) {
                return {
                    status: false,
                    data: null,
                    message: "No tasks found",
                    error: "No task found"
                };
            }

            for (let task of tasks) {
                if(task.uploadImages){

                    for (let image of task.uploadImages) {
    
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
            }

            return {
                status: true,
                data: tasks,
                message: "Got the task successfully",
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

    // getTasksStatusSummaryByUserId
    static async getTasksStatusSummaryByUserId(req) {
        try {
            const id = req.params.id;
            const task = await taskModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(req.authData.user.organisationId), "assignedToUserId": ObjectId(id) } },
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
            if (!task) {
                return {
                    status: false,
                    data: null,
                    message: "No Task Status Summary found",
                    error: "No Task Status Summary found"
                };
            }

            return {
                status: true,
                data: task,
                message: "Got the task successfully",
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

    static async getAllTasksByStatus(req, field) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;

        let nextPage;
        let previousPage;
        let totalTask;
        let totalPages;
        let getTask;

        try {

            let query = {
                "status": "pendingApproval",
                "clientId": ObjectId(req.authData.user.organisationId)
            }

            getTask = await taskModel.find(query).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalTask = await taskModel.countDocuments(query);
            totalPages = Math.ceil(totalTask / no_of_docs_each_page);

            if (getTask?.length === 0 || !getTask) {
                throw Unauthorized("Task does not exist");
            }
            if (!getTask) {
                throw Unauthorized("Task does not exist");
            }

            for (let task of getTask) {
                if (task.uploadImages) {

                    for (let image of task.uploadImages) {

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
            }

            // totalPages = Math.ceil(totalTask / no_of_docs_each_page);
            if (endIndex < totalTask) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getTask.length != 0) {
                return {
                    status: true,
                    data: getTask,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalTask,
                    message: "Tasks found successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Task Not found",
                    error: "Task Not found"
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

    // searchTaskByKeyword
    static async searchTaskByKeyword(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let keyword = req.query.keyword;
        let nextPage;
        let previousPage;
        let totalTask;
        let totalPages;
        let getTask;

        try {

            if (keyword === "" || typeof(keyword) == "undefined") {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    message: "Pls add keyword or search string to search Task user",
                    error: "Pls add keyword or search string to search Task user"
                };
            }
            let query = {
                'clientId': ObjectId(req.authData.user.organisationId),
                '$or': [
                    { '_id': { '$regex': keyword, '$options': 'i' } },
                    { 'title': { '$regex': keyword, '$options': 'i' } },
                    { 'status': { '$regex': keyword, '$options': 'i' } },
                    { 'createdByUserName': { '$regex': keyword, '$options': 'i' } },
                    { 'assignedToUserName': { '$regex': keyword, '$options': 'i' } }
                ]
            }

            getTask = await taskModel.find(query).sort(sort).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalTask = await taskModel.countDocuments(query);
            totalPages = Math.ceil(totalTask / no_of_docs_each_page);

            if (getTask?.length === 0 || !getTask) {
                return {
                    status: true,
                    data: getTask,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalTask,
                    message: "Task not found",
                    error: null
                };
            }
            if (!getTask) {
                return {
                    status: true,
                    data: getTask,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalTask,
                    message: "Task not found",
                    error: null
                };
            }

            for (let task of getTask) {
                if (task.uploadImages) {

                    for (let image of task.uploadImages) {

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
            }

            totalPages = Math.ceil(totalTask / no_of_docs_each_page);
            if (endIndex < totalTask) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getTask.length != 0) {
                return {
                    status: true,
                    data: getTask,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totalTask,
                    message: "Tasks found successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Task Not found",
                    error: "Task Not found"
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

    static async updateTaskStatus(payload) {

        try {

            const id = payload.params.id;
            const options = { new: true };
            let query = { _id: id };
            let data = {};

            const result = await taskModel.findOne(query);

            if (!result) {
                throw Forbidden("Task with this id does not exist");
            }

            if (payload.body.status == "assigned") {

                if (!payload.query.userId) {
                    throw Forbidden("Assigned user id is require");
                }

                const getClientUser = await clientUserModel.findOne({ organisationId: payload.authData.user.organisationId, role: { $in: ["chief_of_staff", "client"] } });
                if (!getClientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Only client and chief_of_staff can assign task",
                        error: {
                            message: "Only client and chief_of_staff can assign task"
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
            }

            if (payload.body.status === "inProgress") {

                const clientUser = await taskModel.findOne({ _id: id, "assignedToUserId": payload.authData.user._id, "clientId": payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Task not assigned to this user",
                        error: {
                            message: "Task not assigned to this user"
                        }
                    };
                }

                if (clientUser.status == "assigned") {

                    data = await taskModel.findByIdAndUpdate(
                        id,
                        {
                            "status": "inProgress",
                        },
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update task");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update task because status is ${clientUser.status}`,
                        error: null
                    };
                }

            }

            if (payload.body.status == "pendingApproval") {
                const clientUser = await taskModel.findOne({ _id: id, "assignedToUserId": payload.authData.user._id, "clientId": payload.authData.user.organisationId });
                if (!clientUser) {
                    return {
                        status: false,
                        data: null,
                        message: "Task not assigned to this user",
                        error: {
                            message: "Task not assigned to this user"
                        }
                    };
                }

                if (clientUser.status == "inProgress") {

                    data = await taskModel.findByIdAndUpdate(
                        id,
                        payload.body,
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update task");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update task because status is ${clientUser.status}`,
                        error: null
                    };
                }
            }

            if (payload.body.status == "complete") {

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

                const getTask = await taskModel.findOne({ _id: id, clientId: payload.authData.user.organisationId });
                if (!getTask) {
                    return {
                        status: false,
                        data: null,
                        message: "Task not fount with this client id",
                        error: {
                            message: "Task not fount with this client id"
                        }
                    };
                }

                if (getTask.status == "pendingApproval") {

                    data = await taskModel.findByIdAndUpdate(
                        id,
                        {
                            "status": "complete",
                        },
                        options
                    );

                    if (!data) {
                        throw Unauthorized("Couldn't update task");
                    }
                } else {
                    return {
                        status: true,
                        data: data,
                        message: `Couldn't update task because status is ${getTask.status}`,
                        error: null
                    };
                }
            }

            return {
                status: true,
                data: data,
                message: "task status updated successfully",
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
module.exports = TaskService;