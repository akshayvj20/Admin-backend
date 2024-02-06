const mongoose = require('mongoose');


const villageData = new mongoose.Schema({
    villageUID: {
        type: String,
    },
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
    villageName: {
        type: String
    },
    totalNoofPollingStations: {
        type: String,
    },
    lattitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    Description: {
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


module.exports = mongoose.model('VillageData', villageData);