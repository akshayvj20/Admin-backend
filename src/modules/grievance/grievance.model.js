const mongoose = require("mongoose");

const grievance = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    grievanceTitle: {
        type: String
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    officeId: {
        // required: true,
        type: mongoose.Schema.Types.ObjectId
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
    visitorType: {
        type: String,
        enum: ['citizen', 'vip', 'cadre', 'other', 'Citizen', 'CITIZEN', 'VIP', 'Vip', 'Cadre', 'Other', 'CADRE']
    },
    numberOfPeople: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others', 'male', 'female', 'others']
    },
    email: {
        type: String
    },
    phone: {
        type: Number
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
    description: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'],
    },
    uploadImages: {
        type: []
    },
    instructions: {
        type: String
    },
    showImages: {
        type: Boolean
    },
    postCompletionImages: {
        type: []
    },
    dueDate: {
        type: Date
    },
    promptQuestions: {
        type: {},
    },
    profilePicture: {
        type: {}
    },

}, {
    timestamps: true
})

module.exports = mongoose.model('Grievance', grievance);