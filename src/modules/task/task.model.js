const mongoose = require("mongoose");

const task = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['assigned', 'unassigned', 'inProgress', 'pendingApproval', 'complete'],
        default: 'unassigned'
    },
    createdByUserId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    createdByUserName: {
        required: true,
        type: String
    },
    createdByUserRole: {
        required: true,
        type: String
    },
    assignedToUserId: {
        type: mongoose.Schema.Types.ObjectId
    },
    assignedToUserName: {
        type: String
    },
    assignedToUserRole: {
        type: String
    },
    title: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    location: {
        lat: {
            type: String,
        },
        lng: {
            type: String,
        },
        address: {
            type: String,
        },
    },
    uploadImages: {
        type: []
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'],
    },
    // taskStatus: {
    //     type: String,
    //     enum: ['progress', 'pending', 'completed'],
    // },
    showImages: {
        type: Boolean
    },
    postCompletionImages: {
        type: []
    },
    instructions: {
        type: String
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId
    },
    categoryName: {
        type: String
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId
    },
    subCategoryName: {
        type: String
    },
    numberOfPeople: {
        type: String
    },
    grievanceId: {
        type: String,
    },
    officeId: {
        // required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    officeName: {
        type: String
    },
    dueDate: {
        type: Date
    },
    profilePicture: {
        type: {}
    },
    promptQuestions: {
        type: {},
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Task', task);