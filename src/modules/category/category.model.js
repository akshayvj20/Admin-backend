const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        minlength: [3, 'Name is too short!'], //custom error message
        maxlength: 50
    },
    parentId:{
        type: mongoose.Schema.Types.ObjectId
    },
    parentCategoriesName:{
        type: String,
    },
    description: {
        type: String,
        minlength: [4, 'description is too short!'], //custom error message
    },
    createdBy: {
        required: true,
        type: String,
    },
},
{timestamps: true});

module.exports = mongoose.model('Category', categorySchema);