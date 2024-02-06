
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const ClientUser = require("../client/clientUser.model");
const grievanceModel = require("../grievance/grievance.model");
const taskModel = require("../task/task.model");
const ObjectId = require('mongoose').Types.ObjectId;
const AccessToken = require("../../utils/utils.accessToken");
const Constituency = require("../constituency/constituency.model");
const ClientOffice = require('../client/clientOffice.model');
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class cadreService {

    // getCadresTask
    static async getCadresTask(req) {
        try {
            let organisationId = req.authData.user.organisationId;
            const getTaskstatus = await taskModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(organisationId) } },
                    {
                        $group: {
                            _id: "$status",
                            count: {
                                $sum: 1
                            },
                        }
                    }
                ]
            );

            if (!getTaskstatus) {
                return {
                    status: false,
                    data: null,
                    message: "No task found",
                    error: "No task found"
                };
            }

            return {
                status: true,
                data: getTaskstatus,
                message: "Got task status successfully",
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

    //Get All Cadres
    static async getAllcadre(req) {
        const no_of_docs_each_page = parseInt(req.query.size) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
        try {

            let query = { 'role': 'cadre', 'organisationId': ObjectId(req.authData.user.organisationId) }

            const foundGCadre = await ClientUser.find(query, { "__v": 0 }).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);;

            totalPages = Math.ceil(foundGCadre.length / no_of_docs_each_page);
            if (foundGCadre.length != 0) {
                return {
                    status: true,
                    data: foundGCadre,
                    currentPage: current_page_number,
                    totalPages,
                    message: "Cadre found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Cadre Not found",
                    error: "Cadre Not found"
                };
            }
        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error getting Cadre",
                error
            };
        }
    }

    // getTasks
    static async getTasks(req) {
        try {
            let organisationId = req.authData.user.organisationId;
            const getTaskstatus = await taskModel.aggregate(
                [
                    { $match: { "clientId": ObjectId(organisationId) } },
                    {
                        $group: {
                            _id: "$taskStatus",
                            count: {
                                $sum: 1
                            },
                        }
                    }
                ]
            );

            if (!getTaskstatus) {
                return {
                    status: false,
                    data: null,
                    message: "No task found",
                    error: "No task found"
                };
            }

            return {
                status: true,
                data: getTaskstatus,
                message: "Got task status successfully",
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

    // getSingleCarderSummaryAPIById
    static async getSingleCarderSummaryAPIById(req) {
        const no_of_docs_each_page = parseInt(req.query.size) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
        try {

            const getCadre = await ClientUser.findOne({ "_id": ObjectId(req.params.id), "organisationId": ObjectId(req.authData.user.organisationId), "role": "cadre" }, { "__v": 0 })
            if (!getCadre) {
                throw Unauthorized("Cadre User does not exist");
            }


            let query = { "clientId": ObjectId(req.authData.user.organisationId), 'assignedToUserId': ObjectId(req.params.id) }            
            const foundGCadreTasks = await taskModel.find(query, { "__v": 0 }).sort({ createdAt: -1 }).skip(no_of_docs_each_page * (current_page_number - 1))
            .limit(no_of_docs_each_page);

            for (let task of foundGCadreTasks) {
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
            }



            const getCountCadreTasks = await taskModel.countDocuments(query, { "__v": 0 });

            // countDocuments
            totalPages = Math.ceil(getCountCadreTasks / no_of_docs_each_page);
            if (foundGCadreTasks.length != 0) {
                return {
                    status: true,
                    data: foundGCadreTasks,
                    currentPage: current_page_number,
                    totalPages,
                    message: "Cadre found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Cadre Not found",
                    error: "Cadre Not found"
                };
            }
        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error getting Cadre",
                error
            };
        }
    }

    // Get Count Of Total Tasks Assigned To A Cadre
    static async getCountOfTotalTasksAssignedToCadre(req) {
        try {

            const getCadre = await ClientUser.findOne({ "_id": ObjectId(req.params.id), "organisationId": ObjectId(req.authData.user.organisationId), "role": "cadre" }, { "__v": 0 })
            if (!getCadre) {
                throw Unauthorized("Cadre User does not exist");
            }

            let query = { "clientId": ObjectId(req.authData.user.organisationId), 'assignedToUserId': ObjectId(req.params.id) }
            const getTaskstatus = await taskModel.aggregate(
                [
                    { $match: query },
                    {
                        $group: {
                            _id: "$status",
                            count: {
                                $sum: 1
                            },
                        }
                    }
                ]
            );

            if (!getTaskstatus) {
                return {
                    status: false,
                    data: null,
                    message: "No task found",
                    error: "No task found"
                };
            }

            let today = new Date();
            const getDealyCount =  await taskModel.aggregate([
                {
                  $match: {
                    dueDate: { $lt: today }
                  }
                },
                {
                  $group: {
                    _id: "delayTaskCount",
                    count: { $sum: 1 }
                  }
                }
              ]);

              getTaskstatus.push(getDealyCount[0]);

            return {
                status: true,
                data: getTaskstatus,
                message: "Got task status successfully",
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

    static async cadresLogin(req) {
        try {
            const phone = req.body.phone;

            // check if cadre exist
            const clientUser = await ClientUser.findOne({ phone }, { firstName: 1, lastName: 1, status: 1, email: 1, phone: 1, role: 1, password: 1, _id: 1, subscription: 1, constituencyId: 1, organisationId: 1, officeId: 1, profileImageLink: 1 });

            if (!clientUser) {
                throw Unauthorized("cadre does not exist");
            }

            if(clientUser.status == "suspended" ||  clientUser.status == "inactive"){
                throw Unauthorized("This account is suspended.");
            }

            clientUser.password = undefined;
            let _clientUser = clientUser._doc;
            _clientUser.type = "client";
            const token = AccessToken.generateAccessToken(clientUser);

            const getConstituency = await Constituency.findOne({ _id: clientUser.constituencyId }, { __v: 0 });
            if (!getConstituency) {
                throw Unauthorized("Constituency does not exist");
            }

            const getClientOffice = await ClientOffice.findOne({ _id: clientUser.officeId }, { __v: 0 });
            if (!getClientOffice) {
                throw Unauthorized("getClientOffice does not exist");
            }

            if (clientUser.role === "cadre") {
                const getReportingClient = await ClientUser.findOne({ 'organisationId': clientUser.organisationId }, { __v: 0 });
                if (!getReportingClient) {
                    throw Unauthorized("Reporting Client does not exist");
                }
                _clientUser.reportingTo = getReportingClient.firstName + " " + getReportingClient.lastName;
            }

            _clientUser.constituencyName = getConstituency.name;
            _clientUser.officeLocation = getClientOffice.officeLocation;
            _clientUser.officeName = getClientOffice.officeName;
       
            if (clientUser.profileImageLink && Object.keys(clientUser.profileImageLink).length !== 0) {

                const params = {
                    Bucket: process.env.BUCKET,
                    Key: clientUser.profileImageLink.key
                };

                const command = new GetObjectCommand(params);
                let accessKeyId = process.env.ACCESS_KEY;
                let secretAccessKey = process.env.ACCESS_SECRET;
                const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });

                _clientUser.profileImageLink = getUrl;
            }

            if (_clientUser.role === "cadre") {
                _clientUser.cadreToken = AccessToken.generateAccessToken(_clientUser)
            }   
            return {
                status: true,
                data: {
                    clientUser,
                    token
                },
                message: "Login successfully",
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

module.exports = cadreService;
