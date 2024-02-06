const mongoose = require('mongoose');


const PartyColoursData = new mongoose.Schema({
    state: {
        type: String,
    },
    party: {
        type: {},
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('PartyColoursData', PartyColoursData);