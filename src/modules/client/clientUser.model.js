const mongoose = require('mongoose');
// const clientOfficeSchema = require('./clientOffice.model');

const ObjectId = mongoose.Schema.Types.ObjectId;

const clientUserSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String,
        minlength: [3, 'First Name is too short!'], //custom error message
        maxlength: 50
    },
    lastName: {
        required: true,
        type: String,
        minlength: [3, 'Last Name is too short!'], //custom error message
        maxlength: 50
    },
    organisationId:{
       type: mongoose.Schema.Types.ObjectId
    },
    officeId:{
        type: mongoose.Schema.Types.ObjectId
    },
    constituencyId:{
        type: mongoose.Schema.Types.ObjectId
    },
    email: {
        required: true,
        type: String,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/.test(v);
            },
            message: "Please enter a valid email" //custom error message
        },
        required: [true, "Email required"] //custom error message
    },
    phone: {
        unique: true,
        required: true,
        type: Number,
        minlength: [10, 'Phone number is too short!'], //custom error message
        maxlength: 12
    },
    password: {
        required: true,
        type: String,
        minlength: 8,
        maxlength: 200
    },
    lastpasswordchangedate: {
        type: Date,
        default: new Date() + 7*24*60*60*1000
    },
    resetPasswordToken: {
        type: String,
        expireAfterSeconds: 3600,
        default: null
    },
    role: {
        type: String,
        enum: ['client', 'constituency_manager', 'cadre', 'office_manager','data_entry_operator', 'chief_of_staff']
    },
    // office: [office],
    status: {
        type: String,
        enum: ['active', 'deactivate'],
        default: 'active'
    },
    subscription: [],
    // subscription: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    validityStart: {
        type: Date
    },
    validityEnd: {
        type: Date
    },
    profileImageLink: {
        type: {}
    },
    planDuration: {
        type: String,
        enum: ['quarterly', 'half_yearly', 'yearly'],
        default: 'yearly',
        required: true,
    },
    planAmount: {
        type: String,
        // required: true,
    },
    clientPassword: {
        type: String
    },
},{
    timestamps: true
})

module.exports = mongoose.model('ClientUser', clientUserSchema)