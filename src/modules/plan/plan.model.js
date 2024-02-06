const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    name:{
        required:true,
        type: String
    },
    // services:[
    //     {
    //         name:{
    //             type: String,
    //             required: true
    //         },
    //         isActive:{
    //             type:Boolean,
    //             required: true
    //         }
    //     }
    // ]
});

module.exports = mongoose.model('Plan',planSchema);