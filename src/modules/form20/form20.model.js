const mongoose = require('mongoose');
/*  Old  -------- 
const form20Schema = new mongoose.Schema({
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    year: {
        type: Number,
    },
    pollingStationNo: {
        type: Number,
    },
    psNoAndName: {
        type: String,
    },
    parliament: {
        type: String,
    },
    constituency: {
        type: String,
    },
    mandalVillage: {
        type: String,
    },
    topNParties: {
        type: Number,
    },
    others: {
        type: Number,
    },
    totalNumberOfValidVotes: {
        type: Number,
    },
    notaTotal: {
        type: Number,
    },
    noOfTenderedVotes: {
        type: Number,
    },
    winnerParty: {
        type: String,
    },
    runnerParty1: {
        type: String,
    },
    runnerParty2: {
        type: String,
    },
    topNPartiesByPercentage: {
        type: Number,
    },
    othersByPercentage: {
        type: Number,
    },
    winnerVoteShare: {
        type: Number,
    },
    runnerParty1VoteShare: {
        type: Number,
    },
    runnerParty2VoteShare: {
        type: Number,
    },
    topNPartiesVillageVoteShare: {
        type: Number,
    },
    othersVillageVoteShare: {
        type: Number,
    },
    topNPartiesMandalVoteShare: {
        type: Number,
    },
    othersMandalVoteShare: {
        type: Number,
    },
    winningMargin: {
        type: Number,
    },
    differenceMargin: {
        type: Number,
    },
    winningMarginBracket: {
        type: String,
    },
    topNPartiesVoteShareBrackets: {
        type: String,
    }
}, {
    timestamps: true
});

---------------- */

// const form20Schema = new mongoose.Schema({
//     pollingStationID:{
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     constituencyId: {
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     constituencyName: {
//         type: String,
//     },
//     yearOfElection: {
//         type: String,
//     },
//     totalVillages: {
//         type: String,
//     },
//     totalPollingStations: {
//         type: String,
//     },
//     villages: [
//         {
//             villageId: {
//                 type: String,
//             },
//             villageName: {
//                 type: String,
//             },
//             location: {
//                 lat: {
//                     type: String,
//                 },
//                 lng: {
//                     type: String,
//                 },
//             },
//             parties: [
//                 {
//                     partyName: {
//                         type: String,
//                     },
//                     voteShare: {
//                         type: String,
//                     },
//                     voteSharePercentage: {
//                         type: String,
//                     },
//                     noOfPollingStations: {
//                         type: String,
//                     },
//                 }
//             ],
//             total: {
//                 voteShare: {
//                     type: String,
//                 },
//                 voteSharePercentage: {
//                     type: String,
//                 },
//                 noOfPollingStations: {
//                     type: String,
//                 },
//             },
//             winnerParty: {
//                 type: String,
//             },
//             runnerUpParty: {
//                 type: String,
//             },
//             firstRunnerUpParty: {
//                 type: String,
//             },
//         },
//     ]
// }, {
//     timestamps: true
// });


// const form20Schema = new mongoose.Schema({
//     pollingStationID: {
//         type: String,
//     },
//     constituencyId: {
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     constituencyName: {
//         type: String,
//     },
//     yearOfElection: {
//         type: String,
//     },
//     totalVillages: {
//         type: String,
//     },
//     years: {
//         type: String,
//     },
//     pollingStationNumber: {
//         type: String,
//     },
//     pollingStationName: {
//         type: String,
//     },
//     villageUID: {
//         type: String,
//     },
//     totalNoOfValidVotes: {
//         type: String,
//     },
//     noOfRejectedVotes: {
//         type: String,
//     },
//     note: {
//         type: String,
//     },
//     totalVotes: {
//         type: String,
//     },
//     noTenderedVotes: {
//         type: String,
//     },
//     winnerPartyOrCandidate: {
//         type: String,
//     },
//     winnerPartyOrCandidateHexCodeColor: {
//         type: String,
//     },
//     runnerParty1Candidate: {
//         type: String,
//     },
//     runnerParty1CandidateHexCodeColor: {
//         type: String,
//     },
//     runnerParty2Candidate: {
//         type: String,
//     },
//     runnerParty2CandidateHexCodeColor: {
//         type: String,
//     },
//     winnerVoteShare: {
//         type: String
//     },
//     runnerParty1VoteShare: {
//         type: String
//     },
//     runnerParty2VoteShare: {
//         type: String
//     },
//     winningMargin: {
//         type: String
//     },
//     differenceMargin: {
//         type: String
//     }
// }, {
//     timestamps: true
// });

const form20Schema = new mongoose.Schema({
    pollingStationID: {
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
    totalVillages: {
        type: String,
    },
    years: {
        type: String,
    },
    party: {
        type: {}
    },
    totalVotes: {
        type: String,
    },
    fileName: {
        type: String,
    },
    filePath: {
        type: {}
    },
    // pollingStationName: {
    //     type: String,
    // },
    // villageUID: {
    //     type: String,
    // },
    // totalNoOfValidVotes: {
    //     type: String,
    // },
    // noOfRejectedVotes: {
    //     type: String,
    // },
    // note: {
    //     type: String,
    // },
    // totalVotes: {
    //     type: String,
    // }
}, {
    timestamps: true
});


module.exports = mongoose.model('form20', form20Schema);