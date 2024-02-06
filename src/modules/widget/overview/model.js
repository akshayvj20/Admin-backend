const mongoose = require("mongoose");

const overviewWidget = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    newGMSEntries: {
        type: Number
    },
    totalActiveTask: {
        type: Number
    },
    totalSurveyReports: {
        type: Number
    },
    GMSTMSCompletionRate: {
        type: Array
    },
    grievanceIsInOpenState: {
        type: Number
    },
    grievanceIsInProgress: {
        type: Number
    },
    grievanceIsDelayed: {
        type: Number
    }
   
}, {
    timestamps: true
})

module.exports = mongoose.model('OverviewWidget', overviewWidget);