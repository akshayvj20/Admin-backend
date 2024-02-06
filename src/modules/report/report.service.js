
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const Reports = require("../report/report.model");
const RequestedReport = require("../report/requestedReport.model");
const Reportissues = require("../report/reportissue.model");
const sendEmail = require("../../utils/utils.sendEmail");
const mailTemplate = require("../../utils/utils.reportEmail");
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class ReportServices {

    // getAllReport
    static async getAllReport(payload) {

        const no_of_docs_each_page = parseInt(payload.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(payload.query.page) || 1; // 1st page
        let sort = payload.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let reportCount;
        let totalPages;

        try {

            let getReports = await Reports.aggregate([
                {
                    $match: {
                        reportStatus: { $in: ["activated", "deactivated"] }
                    }
                },
                { $sort: sort },
                { $skip: no_of_docs_each_page * (current_page_number - 1) },
                { $limit: no_of_docs_each_page }
            ]);
            reportCount = await Reports.countDocuments({ reportStatus: { $in: ["activated", "deactivated"] } }).exec();
            totalPages = Math.ceil(reportCount / no_of_docs_each_page);


            if (getReports?.length === 0 || !getReports) {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Report does not exist",
                    error: "Report does not exist"
                };

            }

            if (endIndex < reportCount) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }

            return {
                status: true,
                data: getReports,
                message: "Get report successfully",
                error: null,
                currentPage: current_page_number,
                totalPages,
                nextPage,
                previousPage,
                reportCount
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: "Error while getting report",
                error,
                currentPage: current_page_number,
                totalPages
            };
        }
    }

    // Create report
    static async createReport(payload) {
        try {
            const { reportName, uploadedBy, uploaderName, resourceLocation, subscribers, reportDescription, tags, type } = payload.body;

            // save report into the DB
            const report = await Reports.create({
                reportName,
                uploadedBy,
                uploaderName,
                subscribers,
                resourceLocation,
                reportDescription,
                tags,
                type
            });
            if (!report) {
                throw InternalServerError("Unable to save report's data");
            }
            delete report.resourceLocation.publicUrl
            return {
                status: true,
                data: report,
                message: "Report create successfull",
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

    // Update Report
    static async reportUpdate(req) {
        try {

            // update report
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };

            // return req.status(201).send(req.body);

            const report = await Reports.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!report) {
                throw Unauthorized("Report does not exist");
            }

            return {
                status: true,
                data: report,
                message: "Report update successfully",
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

    // Get Report By Id
    static async getReportById(payload) {
        try {

            const report = await Reports.findOne({ _id: payload }, { __v: 0 });
            if (!report) {
                throw Unauthorized("Report does not exist");
            }

            for (let image of report.resourceLocation) {

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
                data: report,
                message: "Get report successful",
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

    static async reportDelete(payload) {
        try {

            const id = payload;
            let getReportLink = await Reports.findOne({ _id: id }, { __v: 0 });
            const report = await Reports.deleteOne({ _id: id });

            if (report.deletedCount === 0) {
                throw Unauthorized("Report does not exist");
            }

            // if (getReportLink) {
            //     let reportLink = getReportLink.reportLink
            //     reportLink = reportLink.replace(process.env.CLIENT_URL, '');
            // }
            return {
                status: true,
                data: {
                    report
                },
                message: "Report Delete successfully",
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

    // Share report
    static async shareReport(payload) {
        try {

            const report = await Reports.findOne({ _id: payload.id }, { __v: 0 });
            if (!report) {
                throw Unauthorized("Report does not exist");
            }

            let sent = await sendEmail(payload.email, "Report ", { data: mailTemplate(report) }, report.reportLink);
            console.log('Send', sent)
            return {
                status: true,
                data: report,
                message: "Get all reports successfully",
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

    static async getSearchAndFilterReports(req) {
        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
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

            const query = {
                '$or': [
                    { 'reportName': { $regex: keyword, $options: 'i' } },
                    { 'uploaderName': { $regex: keyword, $options: 'i' } },
                    { 'reportDescription': { $regex: keyword, $options: 'i' } },
                    { 'reportStatus': { $regex: keyword, $options: 'i' } }
                ]
            }

            //find user with firstname, lastname and email with pagination
            const foundGReport = await Reports.find(query, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            const totalReportCount = await Reports.countDocuments(query).exec();
            totalPages = Math.ceil(totalReportCount / no_of_docs_each_page);

            if (foundGReport.length != 0) {
                return {
                    status: true,
                    data: foundGReport,
                    currentPage: current_page_number,
                    totalPages,
                    totalReportCount,
                    message: "Report Not found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    totalReportCount,
                    message: "Report Not found",
                    error: "Report Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error searching Reports",
                error
            };
        }
    }

    // getFilterReports
    static async getFilterReports(req, field) {
        try {
            const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
            const current_page_number = parseInt(req.query.page) || 1; // 1st page
            let keyword = req.query.keyword;
            let totalReportCount;
            let totalPages;

            let queryObj = {};

            if (field !== '' && keyword !== '') {
                queryObj[field] = keyword;
            }

            const getReports = await Reports.find(queryObj).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalReportCount = await Reports.countDocuments(queryObj);
            totalPages = Math.ceil(totalReportCount / no_of_docs_each_page);

            if (getReports.length != 0) {
                return {
                    status: true,
                    data: getReports,
                    currentPage: current_page_number,
                    totalPages,
                    totalReportCount,
                    message: "Get filtered Reports successfully",
                    error: null
                };
            }else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    totalReportCount,
                    message: "Report Not found",
                    error: "Report Not found"
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

    // getAllClientReport
    static async getAllClientReport(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let totalPages;
        let previousPage;
        let nextPage;
        let reportCount;

        try {

            const foundGReport = await Reports.find({
                "subscribers": {
                    $elemMatch: { "_id": req.authData.user.organisationId }
                }
            }, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            reportCount = await Reports.countDocuments({  "subscribers": {
                $elemMatch: { "_id": req.authData.user.organisationId }
            } }, { "__v": 0 });

            totalPages = Math.ceil(reportCount / no_of_docs_each_page);

            if (endIndex < reportCount) {
                nextPage = current_page_number + 1;
            }

            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (foundGReport.length != 0) {
                return {
                    status: true,
                    data: foundGReport,
                    currentPage: current_page_number,
                    nextPage,
                    previousPage,
                    totalPages,
                    reportCount,
                    message: "Get Report successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Report Not found",
                    error: "Report Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Reports",
                error
            };
        }
    }

    // reportAnIssue
    static async reportAnIssue(payload) {
        try {
            const { phone, reportedToUserId, reportedToName, reportedToUserRole, categoryId, categoryName, subCategoryId, subCategoryName, description } = payload.body;
            let organisationId = payload.authData.user.organisationId;
            const reportissue = await Reportissues.create({
                organisationId,
                phone,
                reportedToUserId,
                reportedToName,
                reportedToUserRole,
                categoryId,
                categoryName,
                subCategoryId,
                subCategoryName,
                description
            });
            if (!reportissue) {
                throw InternalServerError("Unable to save report issue");
            }

            return {
                status: true,
                data: reportissue,
                message: "Report issue successfull",
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

    // getAllClientReportByClientId
    static async getAllClientReportByClientId(req) {

        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        const startIndex = (current_page_number - 1) * no_of_docs_each_page;
        const endIndex = current_page_number * no_of_docs_each_page;
        let totalPages;
        let previousPage;
        let nextPage;

        try {

            const foundGReport = await Reports.find({
                "subscribers": {
                    $elemMatch: { "_id": req.params.id }
                }
            }, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);


            let totaldocuments = await Reports.countDocuments({
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

            if (foundGReport.length != 0) {
                return {
                    status: true,
                    data: foundGReport,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    totaldocuments,
                    message: "Get Report successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Report Not found",
                    error: "Report Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Reports",
                error
            };
        }
    }

    static async getAllRequestedReportFromClient(payload) {

        const no_of_docs_each_page = parseInt(payload.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(payload.query.page) || 1; // 1st page
        let sort = payload.query.sort == "DES" ? { createdAt: -1 } : { createdAt: 1 };
        const startIndex = (current_page_number - 1) * no_of_docs_each_page
        const endIndex = current_page_number * no_of_docs_each_page
        let nextPage;
        let previousPage;
        let reportCount;
        let totalPages;

        try {

            let getRequestedReport = await RequestedReport.aggregate([
                { $match: { status: "open" } },
                { $sort: sort },
                { $skip: no_of_docs_each_page * (current_page_number - 1) },
                { $limit: no_of_docs_each_page }
            ]);
            reportCount = await RequestedReport.countDocuments({ status: "open" }).exec();
            totalPages = Math.ceil(reportCount / no_of_docs_each_page);


            if (getRequestedReport?.length === 0 || !getRequestedReport) {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    message: "Requested Report not found",
                    error: "Requested Report not found"
                };

            }

            if (endIndex < reportCount) {
                nextPage = current_page_number + 1;
            }
            if (startIndex > 0) {
                previousPage = current_page_number - 1;
            }
            if (getRequestedReport.length != 0) {
                return {
                    status: true,
                    data: getRequestedReport,
                    currentPage: current_page_number,
                    totalPages,
                    nextPage,
                    previousPage,
                    reportCount,
                    message: "Get Requested Report successfully ",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: 0,
                    totalPages: 0,
                    message: "Requested Report Not found",
                    error: "Requested Report Not found"
                };
            }

        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error while getting Requested Report",
                error
            };
        }
    }

    // requestReport
    static async requestReport(payload) {
        try {
            const { reportName, clientId, clientName, description, status, quickCall, phone, requestedDate } = payload.body;

            // save report into the DB
            const report = await RequestedReport.create({
                reportName,
                clientId,
                clientName,
                status,
                description,
                quickCall,
                phone,
                requestedDate
            });
            if (!report) {
                throw InternalServerError("Unable to save report's data");
            }

            return {
                status: true,
                data: report,
                message: "Report requested successfull",
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

    // shareReportWithClient
    static async shareReportWithClient(req) {
        try {

            const idsToUpdate = req.body.reportIds;
            const subscribers = req.body.subscribers

            const report = await Reports.updateMany(
                { _id: { $in: idsToUpdate } }, 
                { $set: { subscribers: subscribers } },
            );

            return {
                status: true,
                data: report,
                message: "Report shared successfully",
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

    static async searchRequestedReport(req) {
        const no_of_docs_each_page = parseInt(req.query.limit) || 10; // 10 docs in single page
        const current_page_number = parseInt(req.query.page) || 1; // 1st page
        let totalPages;
        let totalReportCount;
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
                    { 'reportName': { '$regex': keyword, '$options': 'i' } },
                    { 'clientName': { '$regex': keyword, '$options': 'i' } },
                    { 'quickCall': { '$regex': keyword, '$options': 'i' } },
                    { 'description': { '$regex': keyword, '$options': 'i' } },
                    { 'phone': { '$regex': keyword, '$options': 'i' } }, // status
                    { 'status': { '$regex': keyword, '$options': 'i' } },
                ],
                status: "open"
            }

            const foundGRequestedReport = await RequestedReport.find(query, { "__v": 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            totalReportCount = await RequestedReport.countDocuments(query).exec();

            totalPages = Math.ceil(totalReportCount / no_of_docs_each_page);

            if (foundGRequestedReport.length != 0) {
                return {
                    status: true,
                    data: foundGRequestedReport,
                    currentPage: current_page_number,
                    totalPages,
                    totalReportCount,
                    message: "Get Requested Report successfully",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage: current_page_number,
                    totalPages,
                    totalReportCount,
                    message: "Report Not found",
                    error: "Report Not found"
                };
            }
        }
        catch (error) {
            return {
                status: false,
                data: [],
                currentPage: current_page_number,
                totalPages,
                message: "Error searching Reports",
                error
            };
        }
    }

     // closeReportRequest
    static async closeReportRequest(payload) {
        try {

            const id = payload;
            const report = await RequestedReport.deleteOne({ _id: id });

            if (report.deletedCount === 0) {
                throw Unauthorized("Report does not exist");
            }

            return {
                status: true,
                data: {
                    report
                },
                message: "Report request closed successfully",
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

module.exports = ReportServices;
