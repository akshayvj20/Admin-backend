const Responses = require("../../../utils/utils.response");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const getCompletionRate = require("../../../utils/utils.getCompletionRate");
const grievanceModel = require('../../grievance/grievance.model');
const ClientUser = require("../../client/clientUser.model");
const taskModel = require('../../task/task.model');
const ObjectId = require('mongoose').Types.ObjectId;
const overviewModel = require('./model');
const reportModel = require('../../report/report.model');
const surveyModel = require('../../survey/survey.model');


class OverviewFunctions {

    //create function for GMS data for 7 days and and previous day both
    // grievance compl. rate(%) calculate for pre day for 7 days: (gmsCreated / gmsCompleted) * 100; every day

    static async newGmsEntries(id) {
        //new GMS entries created in 7 days; return: count and grievances added in 7 days
        // $gte: Matches if values are greater or equal to the given value.
        try {
            const grievance = await grievanceModel.find(
                { "clientId": id, "createdAt": { "$gte": new Date(new Date() - 7 * 60 * 60 * 24 * 1000) } }
            );
            const gmsCount = await grievanceModel.countDocuments(
                { "clientId": id, "createdAt": { "$gte": new Date(new Date() - 7 * 60 * 60 * 24 * 1000) } }
            );
            return gmsCount;
            // return {
            //     status: true,
            //     data: { gmsCount },
            //     error: null
            // };
        } catch (error) {
            console.log('error: ', error);
            return error;
        }
    };

    static async newGmsEntriesPrevDay(id) {
        //new GMS entries created in only prev days; return: count and grievances added in only prev days
        // $gte: Matches if values are greater or equal to the given value.
        // $lte: Matches if values are less than or equal to the given value.
        try {
           
            // const grievance = await grievanceModel.find(
            //     { "clientId": id, "createdAt": { "$lte": new Date(new Date() - 1 * 60 * 60 * 24 * 1000), "$gte": new Date(new Date() - 2 * 60 * 60 * 24 * 1000) } }
            // );
            const gmsCount = await grievanceModel.countDocuments(
                { "clientId": ObjectId(id), "createdAt": { "$lte": new Date(new Date() - 1 * 60 * 60 * 24 * 1000), "$gte": new Date(new Date() - 2 * 60 * 60 * 24 * 1000) } }
            );
            return gmsCount;
            // return {
            //     status: true,
            //     data: { gmsCount },
            //     error: null
            // };
        } catch (error) {
            console.log('error: ', error);
            return error;
        }
    };

    static async totalGmsInProgress(id) {
        //total number of grievances that are in InProgress status for all dates
        //return: grievance list and count

        try {
            // const grievance = await grievanceModel.find({ "clientId": id, "status": "inProgress" });

            const gmsCount = await grievanceModel.countDocuments({ "clientId": ObjectId(id), "status": "inProgress" });

            return gmsCount
            // return {
            //     status: true,
            //     data: { gmsCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    }

    static async totalGmsOpenState(id) {
        //total number of grievances that are in open status or unassigned  for all dates
        //return: grievance list and count

        try {
            // const grievance = await grievanceModel.find({ "clientId": id, "status": "unassigned" });

            const gmsCount = await grievanceModel.countDocuments({ "clientId": ObjectId(id), "status": "unassigned" });

            return gmsCount;
            // return {
            //     status: true,
            //     data: { gmsCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    };

    static async totalGmsOpenDueDate(id) {
        //total number of grievances that are in any status except for "complete", all dates
        // and where due date is < current date
        //return: grievance list and count
        //Note: use $ne for single notequalto and use $nin to exclude multiple values eg. [a,b,c,d]

        try {
            const grievance = await grievanceModel.find({
                "clientId": id,
                "status": { $ne: "complete" },
                "dueDate": { "$lte": new Date(new Date() - 1 * 60 * 60 * 24 * 1000) }
            });

            const gmsCount = await grievanceModel.countDocuments({
                "clientId": id,
                "status": { $ne: "complete" },
                "dueDate": { "$lte": new Date(new Date() - 1 * 60 * 60 * 24 * 1000) }
            });

            return gmsCount;
            // return {
            //     status: true,
            //     data: { gmsCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    };

    static async gmscompletionRateForLastSevenDays(id, res) {
        try {

            let getCompletedGms = await getCompletionRate.getCompletionRateForLastSevenDays(grievanceModel, id);
            let getAddedGms = await getCompletionRate.getAddedRateForLastSevenDays(grievanceModel, id);

            const basisGms = {};
            const basisObj = [];
            let i = 0;


            for (let key in getCompletedGms) {
                if (getCompletedGms.hasOwnProperty(key)) {
                    basisGms[getCompletedGms[key]['date']] = getCompletedGms[key]['count'];
                }
            }

            for (let key in getAddedGms) {
                i++;
                if (basisGms.hasOwnProperty(getAddedGms[key]['date'])) {

                    if (basisGms.hasOwnProperty(getAddedGms[key]['date'])) {

                        basisGms[getAddedGms[key]['date']] = basisGms[getAddedGms[key]['date']] / getAddedGms[key]['count'] * 100;
                    } else {
                        basisGms[getAddedGms[key]['date']] = basisGms[getAddedGms[key]];
                    }
                    //extracting Object 'keys' and 'values' and converting it into this format: { x: '14/06/2023', y: 20 }.
                    basisObj.push({ x: Object.keys(basisGms)[i - 1], y: Object.values(basisGms)[i - 1] });
                }
            }

            return {
                status: true,
                data: { getCompletedGms, getAddedGms, basisObj },
                message: "get successfull",
                error: null
            }

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

    static async totalActiveReportAssgn(id) {
        //total number of active reports assigned to the current client
        // return: total reports and count
        try {
            // const reports = await reportModel.find({ "subscribers": {
            //     $elemMatch: { "_id": id }
            // } });

            const reportCount = await reportModel.countDocuments({ "subscribers": {
                $elemMatch: { "_id": id }
            } });

            return reportCount;
            // return {
            //     status: true,
            //     data: { reportCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    };

    // totalActiveSurveyAssgn
    static async totalActiveSurveyAssgn(id) {
        //total number of active Survey assigned to the current client
        // return: total Survey and count
        try {
            // const reports = await reportModel.find({ "subscribers": {
            //     $elemMatch: { "_id": id }
            // } });

            const surveyCount = await surveyModel.countDocuments({ "subscribers": {
                $elemMatch: { "_id": id }
            } });

            return surveyCount;
            // return {
            //     status: true,
            //     data: { reportCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    };

    static async totalTask(id) {
        //total number of task that are in InProgress, Assigned, PendingApproval status for all dates
        //return: task list and count

        try {
            const task = await taskModel.find({ "clientId": id, "status": ["inProgress", "pendingApproval", "assigned"] });

            const taskCount = await taskModel.countDocuments({ "clientId": id, "status": ["inProgress", "pendingApproval", "assigned"] });

            return taskCount;
            // return {
            //     status: true,
            //     data: { taskCount },
            //     error: null,
            // };
        } catch (error) {
            console.log(error);
        }
    };

    static async taskcompletionRateForLastSevenDays(id, res) {
        try {

            let getCompletedTask = await getCompletionRate.getCompletionRateForLastSevenDays(taskModel, id);
            let getAddedTask = await getCompletionRate.getAddedRateForLastSevenDays(taskModel, id);

            const basisTask = {};
            const basisObj = [];
            let i = 0;

            for (let key in getCompletedTask) {
                if (getCompletedTask.hasOwnProperty(key)) {
                    basisTask[getCompletedTask[key]['date']] = getCompletedTask[key]['count'];
                }
            }

            for (let key in getAddedTask) {
                i++;
                if (basisTask.hasOwnProperty(getAddedTask[key]['date'])) {

                    if (basisTask.hasOwnProperty(getAddedTask[key]['date'])) {

                        basisTask[getAddedTask[key]['date']] = basisTask[getAddedTask[key]['date']] / getAddedTask[key]['count'] * 100;
                    } else {
                        basisTask[getAddedTask[key]['date']] = basisTask[getAddedTask[key]];
                    }
                    //extracting Object 'keys' and 'values' and converting it into this format: { x: '14/06/2023', y: 20 }.
                    basisObj.push({ x: Object.keys(basisTask)[i - 1], y: Object.values(basisTask)[i - 1] });
                }
            }

            return {
                status: true,
                data: { getCompletedTask, getAddedTask, basisObj },
                message: "get successfull",
                error: null
            }

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    };

};


class OverviewService {

    static async overviewData(req, res) {
        try {

            const newGmsEntriesPrevDay = await OverviewFunctions.newGmsEntriesPrevDay(req.params.id);
            const totalGmsInProgress = await OverviewFunctions.totalGmsInProgress(req.params.id);
            const totalGmsOpenState = await OverviewFunctions.totalGmsOpenState(req.params.id);
            const totalGmsOpenDueDate = await OverviewFunctions.totalGmsOpenDueDate(req.params.id);
            const gmsRateFor7Days = await OverviewFunctions.gmscompletionRateForLastSevenDays(req.params.id);
            const totalActiveReportAssgn = await OverviewFunctions.totalActiveReportAssgn(req.params.id);
            const totalActiveSurveyAssgn = await OverviewFunctions.totalActiveSurveyAssgn(req.params.id);
            const totalTask = await OverviewFunctions.totalTask(req.params.id);
            const taskRateFor7Days = await OverviewFunctions.taskcompletionRateForLastSevenDays(req.params.id);

            req.body["clientId"] = req.params.id;
            req.body["newGMSEntries"] = newGmsEntriesPrevDay;
            req.body["totalActiveTask"] = totalTask;
            req.body["totalSurveyReports"] = totalActiveReportAssgn + totalActiveSurveyAssgn;
            req.body["GMSTMSCompletionRate"] = { gms: gmsRateFor7Days?.data, tms: taskRateFor7Days?.data };
            req.body["grievanceIsInOpenState"] = totalGmsOpenState;
            req.body["grievanceIsInProgress"] = totalGmsInProgress;
            req.body["grievanceIsDelayed"] = totalGmsOpenDueDate;

            // overviewModel
            let overviewData;
            const getOverviewData = await overviewModel.findOne({"clientId": ObjectId(req.params.id)}, { "__v": 0 })
            if(getOverviewData){
                overviewData = await overviewModel.findByIdAndUpdate(
                    {"_id": getOverviewData._id}, { ...req.body }, { new: true }
                );
    
            }else{

                overviewData = await overviewModel.create({ ...req.body });
            }

            let clientUser = await ClientUser.findOne({ email: req.authData.user.email }, { firstName: 1, lastName: 1, email: 1, status: 1, phone: 1, role: 1, password: 1, _id: 1, subscription: 1, constituencyId: 1, organisationId: 1, officeId: 1, profileImageLink: 1 });

            res.status(201).json({
                status: true,
                data: { overviewData, clientUser },
                message: "overview widget created successfully",
                error: null
            })

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    };
};

module.exports = OverviewService;