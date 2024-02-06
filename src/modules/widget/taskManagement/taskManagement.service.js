// taskManagement
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const getCompletionRate = require("../../../utils/utils.getCompletionRate");
const TasksModel = require("../../task/task.model");
const TaskModel = require("../taskManagement/model");
const Responses = require("../../../utils/utils.response");

class TaskManagement {

    static async taskcompletionRateForLastSevenDays(req, res) {
        try {

            let getCompletedTask = await getCompletionRate.getCompletionRateForLastSevenDays(TasksModel);
            let getAddedTask = await getCompletionRate.getAddedRateForLastSevenDays(TasksModel);


            const basisTask = {};


            for (let key in getCompletedTask) {
                if (getCompletedTask.hasOwnProperty(key)) {
                    basisTask[getCompletedTask[key]['date']] = getCompletedTask[key]['count'];
                }
            }

            for (let key in getAddedTask) {

                if (basisTask.hasOwnProperty(getAddedTask[key]['date'])) {
                
                    if (basisTask.hasOwnProperty(getAddedTask[key]['date'])) {

                        basisTask[getAddedTask[key]['date']] = basisTask[getAddedTask[key]['date']] / getAddedTask[key]['count'];
                    } else {
                        basisTask[getAddedTask[key]['date']] = basisTask[getAddedTask[key]];
                    }
                }
            }

            res.status(201).json({
                status: true,
                data: { getCompletedTask, getAddedTask, basisTask },
                message: "get successfull",
                error: null
            })

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
};

module.exports = TaskManagement;
