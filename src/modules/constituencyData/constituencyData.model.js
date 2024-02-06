const mongoose = require('mongoose');

const constituencyDataSchema = new mongoose.Schema({
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    parameter1: {
        type: String
    },
    parameter2: {
        type: Number
    },
    parameter3: {
        type: String
    },
    parameter4: {
        type: Number
    },
    parameter5: {
        type: String
    },
    parameter6: {
        type: Number
    },
    parameter7: {
        type: String
    },
    parameter8: {
        type: Number
    },
    parameter9: {
        type: String
    },
    parameter10: {
        type: Number
    },
    parameter11: {
        type: String
    },
    parameter12: {
        type: Number
    },
    parameter13: {
        type: String
    },
    parameter14: {
        type: Number
    },
    parameter15: {
        type: String
    }
},
{timestamps: true});

module.exports = mongoose.model('ConstituencyData', constituencyDataSchema);
