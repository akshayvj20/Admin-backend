const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    issueName: {
        required: true,
        type: String
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    loggedBy: {
        required: true,
        type: String
    },
    companyName: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email" //custom error message
        },
        required: [true, "Email required"] //custom error message
    },
    phone: {
        required: true,
        type: Number,
        minlength: [10, 'Phone number is too short!'], //custom error message
        maxlength: 12
    },
    date: {
        required: true,
        type: Date,
    },
    category: {
        required: true,
        type: String,
    },
    assignedTo: {
        type: String
    },
    assignedToUserName: {
        type: String
    },
    comment: {
        required: true,
        type: String
    },
    ticketStatus: {
        type: String,
        enum: ['open', 'resolved', 'pending'],
    },
},{
    timestamps: true
})

module.exports = mongoose.model('Ticket', ticketSchema)