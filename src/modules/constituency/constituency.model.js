const mongoose = require('mongoose');

const constituencySchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    district: {
        type: String
    },
    tehsil: {
        type: String
    },
    type: {
        type: String,
        enum: ['central', 'state'],
    },
    state: {
        required: true,
        type: String
    },
    boundaries: {

    },
    establishedYear: {
        type: Date
    },
    noOfPeople: {
        type: String
    },
    description: {
        type: String
    },
    uploadedFileCount: {
        type: Number,
        default: 0
    }

},
    { timestamps: true });

module.exports = mongoose.model('Constituency', constituencySchema);
