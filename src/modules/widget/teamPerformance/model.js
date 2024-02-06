const mongoose = require("mongoose");

const teamPerformanceWidget = new mongoose.Schema({

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    newGrievancesAssignd: {
        type: Number
    },
    totleNoOfGrievancesIsInProgress: {
        type: Number
    },
    totleNoOfGrievancesIsInCompleted: {
        type: Number
    },
    grievanceCompilationDailyTrade: {
        type: []
    },

    newTaskAssignd: {
        type: Number
    },
    totleNoOfTaskIsInProgress: {
        type: Number
    },
    totleNoOfTaskIsInCompleted: {
        type: Number
    },
    taskCompilationDailyTrade: {
        type: []
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('TeamPerformancewidget', teamPerformanceWidget);