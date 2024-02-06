
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const Survey = require("./survey.model");
const sendEmail = require("../../utils/utils.sendEmail");//check this, if it is working ?
const mailTemplate = require("../../utils/utils.surveyEmail");//check this, if it is working ?
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const RequestedSurvey = require("./requestedSurvey.model");

class SurveyServices {

    // getAllSurvey
    static async getAllSurvey(payload) {
        try {
            const survey = await Survey.find({ uploadedBy: payload }, { __v: 0 });
            if (!survey) {
                throw Unauthorized("Survey does not exist");
            }

            return {
                status: true,
                data: survey,
                message: "Get survey successful",
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

    // Create survey
    static async createSurvey(payload) {
        try {
            const { surveyName, uploadedBy, uploaderName, resourceLocation, subscribers, surveyDescription, tags } = payload.body;

            // save survey into the DB
            const survey = await Survey.create({
                surveyName,
                uploadedBy,
                uploaderName,
                subscribers,
                resourceLocation,
                surveyDescription,
                tags
            });
            if (!survey) {
                throw InternalServerError("Unable to save survey's data");
            }
            delete survey.resourceLocation.publicUrl
            return {
                status: true,
                data: survey,
                message: "Survey create successfull",
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

    // Update Survey
    static async surveyUpdate(req) {
        try {

            // update survey
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };

            // return req.status(201).send(req.body);

            const survey = await Survey.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!survey) {
                throw Unauthorized("survey does not exist");
            }

            return {
                status: true,
                data: survey,
                message: "survey update successfully",
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

    // Get Survey By Id
    static async getSurveyById(payload) {
        try {

            const survey = await Survey.findOne({ _id: payload }, { __v: 0 });
            if (!survey) {
                throw Unauthorized("survey does not exist");
            }

            for (let image of survey.resourceLocation) {

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

            return {
                status: true,
                data: survey,
                message: "Get survey successful",
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

    static async surveyDelete(payload) {
        try {

            const id = payload;
            let getSurveyLink = await Survey.findOne({ _id: id }, { __v: 0 });
            const survey = await Survey.deleteOne({ _id: id });

            if (survey.deletedCount === 0) {
                throw Unauthorized("survey does not exist");
            }

            // if (getsurveyLink) {
            //     let surveyLink = getsurveyLink.surveyLink
            //     surveyLink = surveyLink.replace(process.env.CLIENT_URL, '');
            // }
            return {
                status: true,
                data: {
                    survey
                },
                message: "survey Delete successfully",
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

    // Share survey
    static async shareSurvey(payload) {
        try {

            const survey = await Survey.findOne({ _id: payload.id }, { __v: 0 });
            if (!survey) {
                throw Unauthorized("survey does not exist");
            }

            let sent = await sendEmail(payload.email, "survey ", { data: mailTemplate(survey) }, survey.surveyLink);
            console.log('email Send', sent)
            return {
                status: true,
                data: survey,
                message: "Get all surveys successfully",
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

    static async getSearchAndFilterSurvey(req) {
        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
        let totalSurveyCount;
        try {

            const keyword = req.query.keyword;
            if (keyword === "") {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Pls add keyword or search string to search survey",
                    error: "Pls add keyword or search string to search survey"
                };
            }

            const query = {
                '$or': [
                    { 'surveyName': { $regex: keyword, $options: 'i' } },
                    { 'uploaderName': { $regex: keyword, $options: 'i' } },
                    { 'surveyDescription': { $regex: keyword, $options: 'i' } },
                    { 'surveyStatus': { $regex: keyword, $options: 'i' } }
                ]
            }

            //find user with firstname, lastname and email with pagination
            const foundGSurvey = await Survey.find(query, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalSurveyCount = await Survey.countDocuments(query).exec();
            totalPages = Math.ceil(totalSurveyCount / no_of_docs_each_page);

            if (foundGSurvey.length != 0) {
                return {
                    status: true,
                    data: foundGSurvey,
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Survey Not found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Survey Not found",
                    error: "Survey Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error searching Surveys",
                error
            };
        }
    }

    static async getFilterSurveys(req, field) {
        try {
            const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
            const current_page_number = parseInt(req.query.page) || 1; // 1st page
            let keyword = req.query.keyword;
            let totalSurveyCount;
            let totalPages;

            let queryObj = {};

            if (field !== '' && keyword !== '') {
                queryObj[field] = keyword;
            }

            const getSurveys = await Survey.find(queryObj).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);


            totalSurveyCount = await Survey.countDocuments(queryObj).exec();
            totalPages = Math.ceil(totalSurveyCount / no_of_docs_each_page);

            if (getSurveys.length != 0) {
                return {
                    status: true,
                    data: getSurveys,
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Get filtered Surveys successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Survey Not found",
                    error: "Survey Not found"
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

    // getAllClientSurvey
    static async getAllClientSurvey(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let totalPages;
        let previousPage;
        let nextPage;
        let surveyCount;

        try {

            const foundGSurvey = await Survey.find({  "subscribers": {
                    $elemMatch: { "_id": req.authData.user.organisationId }
                }
            }, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            surveyCount = await Survey.countDocuments({
                "subscribers": {
                    $elemMatch: { "_id": req.authData.user.organisationId }
                }
            }, { "__v": 0 });

            totalPages = Math.ceil(surveyCount / no_of_docs_each_page);

            if (endIndex < surveyCount) {
                nextPage = current_page_number + 1;
            }

            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            if (foundGSurvey.length != 0) {
                return {
                    status: true,
                    data: foundGSurvey,
                    currentPage: current_page_number,
                    nextPage,
                    previousPage,
                    totalPages,
                    surveyCount,
                    message: "Get Survey successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Survey Not found",
                    error: "Survey Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Survey",
                error
            };
        }
    }

    // getAllClientSurveyByClientId
    static async getAllClientSurveyByClientId(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        let sort = req.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const endIndex = current_page_number * no_of_docs_each_page;
        let totalPages;
        let previousPage;
        let nextPage;

        try {

            const foundSurvey = await Survey.find({
                "subscribers": {
                    $elemMatch: { "_id": req.params.id }
                }
            }, { "__v": 0 }
            ).sort(sort)
                .skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);


            let totaldocuments = await Survey.countDocuments({
                "subscribers": {
                    $elemMatch: { "_id": req.params.id }
                }
            }, { "__v": 0 });

            totalPages = Math.ceil(totaldocuments / no_of_docs_each_page);

            if (endIndex < totaldocuments) {
                nextPage = current_page_number + 1;
            }

            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            if (foundSurvey.length != 0) {
                return {
                    status: true,
                    data: foundSurvey,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totaldocuments,
                    message: "Get Survey successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Survey Not found",
                    error: "Survey Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Survey",
                error
            };
        }
    }

    static async getAllRequestedSurveyFromClient(payload) {

        const no_of_docs_each_page = parseInt(payload.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(payload.query.page) || 1; // 1st page
        let sort = payload.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let surveyCount;
        let totalPages;

        try {

            let getRequestedSurvey = await RequestedSurvey.aggregate([
                { $match: { status: "open" } },
                { $sort: sort },
                { $skip: no_of_docs_each_page * (current_page_number - 1) },
                { $limit: no_of_docs_each_page }
            ]);
            surveyCount = await RequestedSurvey.countDocuments({ status: "open" }).exec();
            totalPages = Math.ceil(surveyCount / no_of_docs_each_page);


            if (getRequestedSurvey?.length === 0 || !getRequestedSurvey) {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Requested Survey not found",
                    error: "Requested Survey not found"
                };
            }

            if (endIndex < surveyCount) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getRequestedSurvey.length != 0) {
                return {
                    status: true,
                    data: getRequestedSurvey,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    surveyCount,
                    message: "Get Requested Survey successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Requested Survey Not found",
                    error: "Requested Survey Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Requested Survey",
                error
            };
        }
    }

    // requestSurvey
    static async requestSurvey(payload) {
        try {
            const { surveyName, clientId, clientName, description, status, quickCall, phone, requestedDate } = payload.body;

            // save survey into the DB
            const survey = await RequestedSurvey.create({
                surveyName,
                clientId,
                clientName,
                status,
                description,
                quickCall,
                phone,
                requestedDate
            });
            if (!survey) {
                throw InternalServerError("Unable to save survey's data");
            }

            return {
                status: true,
                data: survey,
                message: "Survey requested successfull",
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

    // searchRequestedSurvey
    static async searchRequestedSurvey(req) {
        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
        let totalSurveyCount;
        let query = {};
        try {

            const keyword = req.query.keyword;
            if (keyword === "") {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Pls add keyword or search string to search report",
                    error: "Pls add keyword or search string to search report"
                };
            }

            query = {
                '$or': [
                    { 'surveyName': { '$regex': keyword, '$options': 'i' } },
                    { 'clientName': { '$regex': keyword, '$options': 'i' } },
                    { 'quickCall': { '$regex': keyword, '$options': 'i' } },
                    { 'description': { '$regex': keyword, '$options': 'i' } },
                    { 'phone': { '$regex': keyword, '$options': 'i' } },
                    { 'status': { '$regex': keyword, '$options': 'i' } },
                ],
                status: "open"
            }

            const foundGRequestedSurvey = await RequestedSurvey.find(query, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalSurveyCount = await RequestedSurvey.countDocuments(query).exec();

            totalPages = Math.ceil(totalSurveyCount / no_of_docs_each_page);

            if (foundGRequestedSurvey.length != 0) {
                return {
                    status: true,
                    data: foundGRequestedSurvey,
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Get Requested Survey successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    totalSurveyCount,
                    message: "Survey Not found",
                    error: "Survey Not found"
                };
            }
        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error searching Surveys",
                error
            };
        }
    }

    static async closeSurveyRequest(payload) {
        try {

            const id = payload;
            const report = await RequestedSurvey.deleteOne({ _id: id });

            if (report.deletedCount === 0) {
                throw Unauthorized("Survey does not exist");
            }

            return {
                status: true,
                data: {
                    report
                },
                message: "Survey request closed successfully",
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

    // shareSurveyWithClient
    static async shareSurveyWithClient(req) {
        try {

            const idsToUpdate = req.body.surveyIds;
            const subscribers = req.body.subscribers

            const survey = await Survey.updateMany(
                { _id: { $in: idsToUpdate } }, 
                { $set: { subscribers: subscribers } },
            );

            return {
                status: true,
                data: survey,
                message: "Survey shared successfully",
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

module.exports = SurveyServices;
