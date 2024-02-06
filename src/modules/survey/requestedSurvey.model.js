const mongoose = require('mongoose');

const requestedSurvey = new mongoose.Schema({
    surveyName: {
        required: true,
        type: String
    },
    clientId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    clientName: {
        required: true,
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["open", "close"],
        default: "open"
    },
    quickCall: {
        type: String,
        enum: ["true", "false"],
        default: "false"
    },
    phone: {
        type: String,
    },
    requestedDate: {
        type: Date,
        default: +new Date() + 7*24*60*60*1000
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('RequestedSurvey', requestedSurvey)