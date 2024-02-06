const mongoose = require("mongoose");

const Reportissue = new mongoose.Schema({
    organisationId: {
        type: mongoose.Schema.Types.ObjectId
    },
    phone: {
        type: Number
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
    description: {
        type: String
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Reportissue', Reportissue);