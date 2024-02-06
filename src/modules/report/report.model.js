const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportName: {
        required: true,
        type: String
    },
    uploadedBy: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    uploaderName: {
        type: String
    },
    reportDescription: {
        type: String
    },
    tags: {
        type: []
    },
    resourceLocation: {
        type: []
    },
    subscribers: {
        type: []
    },
    reportStatus: {
        type: String,
        enum: ["activated", "deactivated", "requested"],
        default: "activated"
    },
    type: {
        type: String,
        enum: ["free", "paid"],
        default: "paid"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Report', reportSchema)