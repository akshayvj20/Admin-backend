const mongoose = require('mongoose');


const PSVillageMappingData = new mongoose.Schema({
    pollingStationNo: {
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
    MandalOrTown: {
        type: String,
    },
    VillageTypeRuralOrUrban: {
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


module.exports = mongoose.model('PSVillageMappingData', PSVillageMappingData);