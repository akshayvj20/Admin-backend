const mongoose = require("mongoose");

const taskWidget = new mongoose.Schema({

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    newTaskEntries: {
        type: Number
    },
    taskAssigndRate: {
        type: Number
    },
    taskCompletionRate: {
        type: Number
    },
    newTaskCompletionRate: {
        type: Number
    },
    newTaskadditionVSCompilationDailyTrade: {
        type: []
    },
    spiltTaskByCategory: {
        type: []
    }
   
}, {
    timestamps: true
})

module.exports = mongoose.model('TaskWidget', taskWidget);