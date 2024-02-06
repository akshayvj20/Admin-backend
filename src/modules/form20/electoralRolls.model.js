const mongoose = require('mongoose');

/*
const ElectoralRollsData = new mongoose.Schema({
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    constituencyName: {
        type: String,
    },
    yearOfElection: {
        type: String,
    },
    years: {
        type: String,
    },
    Name: {
        type: String,
    },
    age: {
        type: String,
    },
    gender: {
        type: String,
    },
    voterId: {
        type: String
    },
    fathersName: {
        type: String,
    },
    mothersName: {
        type: String,
    },
    husbandsName: {
        type: String,
    },
    houseNumber: {
        type: String,
    },
    partyInclination: {
        type: String,
    },
    caste: {
        type: String,
    }
}, {
    timestamps: true
});
*/

const ElectoralRollsData = new mongoose.Schema({
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    constituencyName: {
        type: String,
    },
    yearOfElection: {
        type: String,
    },
    years: {
        type: String,
    },
    Voterlist_sl_no: {
        type: String,
    },
    pollingStationNo:{
        type: String,
    },
    Name: {
        type: String,
    },
    age: {
        type: String,
    },
    gender: {
        type: String,
    },
    FatherOrHusbandName: {
        type: String,
    },
    houseNumber: {
        type: String,
    },
    community: {
        type: String,
    },
    partyInclination: {
        type: String,
    },
    fileName: {
        type: String,
    },
    filePath: {
        type: {}
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('ElectoralRolls', ElectoralRollsData);