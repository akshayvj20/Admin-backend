const UserModel = require("../modules/user/user.model");
const ClientModel = require("../modules/client/client.model");
const Responses = require("./utils.response");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const ObjectId = require('mongoose').Types.ObjectId;

class getCompletionRate {

    static async getCompletionRateForLastSevenDays(model, id) {
        try {

            var sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
            let results = await model.aggregate([
                {
                    $match: {
                        "clientId": ObjectId(id),
                        updatedAt: {
                            $gte: sevenDaysAgo
                        },
                        status: "complete"
                    }
                },
                {
                    $project: {
                        updatedAt: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                        _id: 0,
                    },
                },
                {
                    $group: {
                        _id: "$updatedAt",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        count: 1,
                        date: "$_id"
                    },
                },
                {
                    $sort: {
                        date: 1
                    }
                  }
            ])

            if (!results) {
                throw Unauthorized("data does not exist");
            }

            return results;
        } catch (error) {
            throw Unauthorized(error);
        }
    };

    static async getAddedRateForLastSevenDays(model, id) {
        try {

            var sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
            let results = await model.aggregate([
                {
                    $match: {
                        "clientId": ObjectId(id),
                        createdAt: {
                            $gte: sevenDaysAgo
                        },
                    }
                },
                {
                    $project: {
                        createdAt: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        _id: 0,
                    },
                },
                {
                    $group: {
                        _id: "$createdAt",
                        count: {
                            $sum: 1
                        },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        count: 1,
                        date: "$_id",
                        // "$createdAt": y
                    },
                },
                {
                    $sort: {
                      date: 1
                    }
                  }
            ])

            if (!results) {
                throw Unauthorized("data does not exist");
            }
            return results;
        } catch (error) {
            throw Unauthorized(error);
        }
    };
}

module.exports = getCompletionRate;