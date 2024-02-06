const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    surveyName: {
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
    surveyDescription: {
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
    surveyStatus: {
        type: String,
        enum: ["activated", "deactivated"],
        default: "activated"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Survey', surveySchema);