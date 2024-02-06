const mongoose = require("mongoose");

const grievanceWidget = new mongoose.Schema({

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    newGMSEntries: {
        type: Number
    },
    GMSAssigndRate: {
        type: Number
    },
    GMSCompletionRate: {
        type: Number
    },
    newGMSCompletionRate: {
        type: Number
    },
    newGMSadditionVSCompilationDailyTrade: {
        type: []
    },
    footfallDailyTrend: {
        type: []
    },
    spiltGrievancesByCategory: {
        type: []
    },
    spiltGrievancesByGender: {
        type: []
    },
   
}, {
    timestamps: true
})

module.exports = mongoose.model('Grievancewidget', grievanceWidget);