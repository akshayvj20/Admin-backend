const mongoose = require("mongoose");

const client = mongoose.Schema({
    organisationName: {
        type: String
    },
    //object id created will be used as a organisation id
    constituency: [
        {
            constituencyId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            constituencyName: {
                type: String,
                required: true
            },
            constituencyType: {
                type: String,
                required: true
            },
            constituencyState: {
                type: String,
                required: true
            },
            constituencyDistrict: {
                type: String,
                required: true
            }
        }
    ],
    headOffice:{
            // location:{
            //     type: String,
            //     required: true
            // },
            // contactNumber:{
            //         type: String,
            //         required: true,
            //         minlength: 10,
            //         maxlength: 12
            // },
            // officeName: {
            //     type: String,
            //     required: true
            // },
            // email: {
            //     required: true,
            //     type: String,
            //     lowercase: true,
            //     validate: {
            //         validator: function (v) {
            //             return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/.test(v);
            //         },
            //         message: "Please enter a valid email" //custom error message
            //     },
            //     required: [true, "Email required"] //custom error message
            // },
    },
    adminFirstName: {
        required: true,
        type: String,
        minlength: [3, 'First Name is too short!'], //custom error message
        maxlength: 50
    },
    adminLastName: {
        required: true,
        type: String,
        minlength: [3, 'Last Name is too short!'], //custom error message
        maxlength: 50
    },
    adminEmail: {
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
    adminContact: {
        unique: true,
        type: String,
        required: true,
        minlength: 10,
        maxlength: 12
    },
    planDuration: {
        type: String,
        enum: ['quarterly', 'half_yearly', 'yearly'],
        default: 'yearly',
        required: true,
    },
    planAmount: {
        type: String,
        required: true,
    },
    office: [],
    // planType: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    planType: [],
    validityStart: {
        type: Date
    },
    validityEnd: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'deactivate'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['client', 'chief_of_staff'],
        default: 'client'
    },
    users: [],
    clientPassword: {
        type: String
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Client', client);
