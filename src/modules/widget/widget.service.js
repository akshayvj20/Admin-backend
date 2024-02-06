const Responses = require("../../utils/utils.response");
const OverviewModel = require("../widget/overview/model");
const GrievancesModel = require("../grievance/grievance.model");
const GrievanceModel = require("../widget/grievance/model");
const TasksModel = require("../task/task.model");
const TaskModel = require("../widget/taskManagement/model");
const TeamPerformanceModel = require("../widget/teamPerformance/model");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const GetModelData = require("../../utils/utils.getDataByDate");

class WidgetController {

    static async getOverview(req, res) {
        try {
            //fetching data fom last or latest and only one document is needed.
            const getOverviews = await OverviewModel.findOne({ clientId: req.params.id }).limit(1).sort({$natural: -1})
            if (!getOverviews) {
                throw Unauthorized("Overview does not exist");
            }

            res.status(201).json({
                status: true,
                data: getOverviews,
                message: "Record found",
                error: null
            });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async createOverview(req, res) {
        try {

            let responseData = {
                clientId: req.body.clientId,
                newGMSEntries: 12,
                totalActiveTask: 120,
                totalSurveyReports: 233,
                GMSTMSCompletionRate: [ ],
                grievanceIsInOpenState : 11,
                grievanceIsInProgress : 21,
                grievanceIsDelayed: 7
            }

            let GMSCompletionRate = {
                id: 'GMS',
                color: '#BEBEBE',
                border: '1px solid #E67E22',
                data: []
            }

            let TMSCompletionRate = {
                id: 'TMS',
                color: 'grey',
                border: '2px solid #004877',
                data: []
            }
      
            let getData = await GetModelData.GetModelDataByDate(GrievancesModel);
            let getTaskData = await GetModelData.GetModelDataByDate(TasksModel);

            GMSCompletionRate["data"] = getData;
            TMSCompletionRate["data"] = getTaskData;

            responseData['GMSTMSCompletionRate'].push(GMSCompletionRate);
            responseData['GMSTMSCompletionRate'].push(TMSCompletionRate);

            const createOverview = await OverviewModel.create(responseData);
            

            if (!createOverview) {
                throw InternalServerError("Unable to save overview's data");
            }

            res.status(201).json({
                status: true,
                data: createOverview,
                message: "overview create successful",
                error: null
            });

        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async getGrievanceData(req, res) {
        try {

            const getGrievance = await GrievanceModel.findOne({ clientId: req.params.id });
            if (!getGrievance) {
                throw Unauthorized("Grievance does not exist");
            }
            res.status(201).json({
                status: true,
                data: getGrievance,
                message: "Grievance get successful",
                error: null
            });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async createGrievanceData(req, res) {
        try {

            const createGrievance = await GrievanceModel.create(req.body);

            if (!createGrievance) {
                throw InternalServerError("Unable to save Grievance's data");
            }

            res.status(201).json({
                status: true,
                data: createGrievance,
                message: "Grievance create successful",
                error: null
            });

        } catch (error) {


            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getTaskData(req, res) {
        try {

            const getTask = await TaskModel.findOne({ clientId: req.params.id });
            if (!getTask) {
                throw Unauthorized("Task does not exist");
            }
            res.status(201).json({
                status: true,
                data: getTask,
                message: "Task get successful",
                error: null
            });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async createTaskData(req, res) {
        try {

            const createTask = await TaskModel.create(req.body);

            if (!createTask) {
                throw InternalServerError("Unable to save Task's data");
            }

            res.status(201).json({
                status: true,
                data: createTask,
                message: "Task create successful",
                error: null
            });

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async getTeamPerformanceData(req, res) {
        try {

            const getTeamPerformance = await TeamPerformanceModel.findOne({ clientId: req.params.id });
            if (!getTeamPerformance) {
                throw Unauthorized("Team Performance does not exist");
            }
            res.status(201).json({
                status: true,
                data:getTeamPerformance,
                message: "Get Performance record successful",
                error: null
            });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async createTeamPerformanceData(req, res) {
        try {

            const createTeamPerformance = await TeamPerformanceModel.create(req.body);

            if (!createTeamPerformance) {
                throw InternalServerError("Unable to save TeamPerformance's data");
            }

            res.status(201).json({
                status: true,
                data: createTeamPerformance,
                message: "TeamPerformance create successfull",
                error: null
            });
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
}

module.exports = WidgetController;
