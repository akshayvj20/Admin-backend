const Constituency = require("../constituency/constituency.model")
const Form20Model = require("../form20/form20.model");
const ElectoralRollModel = require("../form20/electoralRolls.model");
const VillageDataModel = require("../form20/villageData.model");
const { Unauthorized, InternalServerError } = require("http-errors");
const Client = require("../client/client.model");
const PSVillageMappingDataModel = require("../form20/PSVillageMappingData.model");
const ObjectId = require('mongoose').Types.ObjectId;
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class constituency {
    static async createConstituency(req) {
        try {

            const fileData = await JSON.parse(req.file.buffer.toString());

            req.body.boundaries = fileData;
            const result = await Constituency.create(req.body);
            if (!result) {
                throw InternalServerError("Unable to create constituency");
            }
            return {
                status: true,
                data: result,
                message: "Constituency created successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async getAllConstituency(req) {
        try {
            let result;

            if (req.authData.user.type === 'client') {
                let getConstituencyList = [];
                let getclient = await Client.findOne({ "_id": req.authData.user.organisationId });
                for (let constituency of getclient.constituency) {

                    getConstituencyList.push(constituency.constituencyId)

                }

                result = await Constituency.find({ _id: { $in: getConstituencyList } });
            } else {
                result = await Constituency.find({
                    $and: [
                        { state: req.query.state },
                        { district: req.query.district }
                    ]
                });
            }
            if (!result) {
                throw InternalServerError("Unable to get all Constituencies");
            }
            return {
                status: true,
                data: result,
                message: "get constituencies successfull",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async deleteConstituencyById(payload) {
        try {
            const id = payload;
            const result = await Constituency.deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                throw Unauthorized("constituency does not exist");
            }
            return {
                status: true,
                data: result,
                message: "deleted constituency successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // Update category
    static async updateConstituency(req) {
        try {
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };

            const result = await Constituency.findByIdAndUpdate(
                id, updatedData, options
            );

            if (!result) {
                throw Unauthorized("Couldn't updated constituency");
            }

            return {
                status: true,
                data: result,
                message: "constituency updated successfully",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async ConstituencySearch(req) {
        const keyword = req.query.keyword;
        if (keyword === undefined || keyword === "") {
            return {
                status: false,
                data: null,
                message: "keyword is empty",
                error: "keyword is empty"
            };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        Constituency.count({}, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                results.totalPages = Math.round(result / limit);
            }
        });

        if (endIndex < await Constituency.countDocuments().exec()) {
            results.nextPage = page + 1;
        }

        if (page) {
            results.currentPage = page;
        }
        if (limit) {
            results.limit = limit;
        }

        if (startIndex > 0) {
            results.previousPage = page - 1;
        }

        try {
            results.results = await Constituency.find({
                '$or': [
                    { 'name': { '$regex': keyword, '$options': 'i' } },
                    { 'district': { '$regex': keyword, '$options': 'i' } },
                    { 'tehsil': { '$regex': keyword, '$options': 'i' } },
                    { 'state': { '$regex': keyword, '$options': 'i' } }
                ]
            }, {}).limit(limit).skip(startIndex).exec()
            const noData = false;
            if (!results) {
                throw Unauthorized("No constituency found");
            }
            return {
                status: 200,
                message: results.results.length === 0 ? 'no data available' : "Constituency Found successfully",
                data: results.results.length === 0 ? null : results,
                error: false,
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async ConstituencyGetById(payload) {
        try {

            const result = await Constituency.findOne({ _id: payload }, { __v: 0 });
            if (!result) {
                throw Unauthorized("Constituency does not exist");
            }

            return {
                status: true,
                data: result,
                message: "Get Constituency successfull",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getConstituencyByType
    static async getConstituencyByType(req) {
        try {
            let query = {};

            if (req.query.ConstituencyName && req.query.CentralOrState) {

                query["name"] = req.query.ConstituencyName;
                query["state"] = req.query.CentralOrState;
                query["type"] = req.params.type;

            } else if (req.query.CentralOrState) {

                query["state"] = req.query.CentralOrState;
                query["type"] = req.params.type;
            } else {

                query["type"] = req.params.type;
            }

            let result;

            if (req.authData.user.type === 'client') {
                let getConstituencyList = [];
                let getclient = await Client.findOne({ "_id": req.authData.user.organisationId });
                for (let constituency of getclient.constituency) {

                    getConstituencyList.push(constituency.constituencyId)

                }

                query["_id"] = { $in: getConstituencyList }
            }
            result = await Constituency.find(query);


            if (result.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "Constituencies not found",
                    error: "Constituencies not found"
                };
            }
            return {
                status: true,
                data: result,
                message: "get constituencies successfull",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }


    static async getConstituencysummaryById(payload) {
        try {

            let responseObj = {};
            const result = await Constituency.findOne({ _id: payload.params.id }, { _id: 1, establishedYear: 1, name: 1 });
            if (!result) {
                throw Unauthorized("Constituency does not exist");
            }

            responseObj["_id"] = result._id;
            responseObj["name"] = result.name;
            responseObj["establishedYear"] = result.establishedYear;

            const getForm20 = await Form20Model.findOne({ constituencyId: result._id, years: payload.query.year }, { _id: 1, constituencyId: 1, fileName: 1 });
            if (getForm20) {
                responseObj["Form 20"] = "YES"
                responseObj["Form20DataFileName"] = getForm20.fileName
            } else {
                responseObj["Form 20"] = "NO"
            }

            const getElectoralRoll = await ElectoralRollModel.findOne({ constituencyId: result._id, years: payload.query.year }, { _id: 1, constituencyId: 1, fileName: 1 });
            if (getElectoralRoll) {
                responseObj["Electoral Roll"] = "YES"
                responseObj["ElectoralRollDataFileName"] = getElectoralRoll.fileName
            } else {
                responseObj["Electoral Roll"] = "NO"
            }

            const getVillageDataModel = await VillageDataModel.findOne({ constituencyId: result._id, years: payload.query.year }, { _id: 1, constituencyId: 1, fileName: 1 });
            if (getVillageDataModel) {
                responseObj["Village Data"] = "YES"
                responseObj["VillageDataFileName"] = getVillageDataModel.fileName
            } else {
                responseObj["Village Data"] = "NO"
            }

            const getPSVillageMappingDataModel = await PSVillageMappingDataModel.findOne({ constituencyId: result._id, years: payload.query.year }, { _id: 1, constituencyId: 1, fileName: 1 });
            if (getPSVillageMappingDataModel) {
                responseObj["PS Village Mapping Data"] = "YES";
                responseObj["PSVillageMappingFileName"] = getPSVillageMappingDataModel.fileName
            } else {
                responseObj["PS Village Mapping Data"] = "NO"
            }
            if (responseObj["Village Data"] === "YES" && responseObj["Form 20"] === "YES" && responseObj["PS Village Mapping Data"] === "YES" && responseObj["Electoral Roll"] === "YES") {
                responseObj["allFileUploaded"] = true
            } else {
                responseObj["allFileUploaded"] = false
            }
            return {
                status: true,
                data: responseObj,
                message: "Get Constituency successfull",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getConstituencyTableById
    static async getConstituencyTableById(payload) {
        try {

            let responseObj = {};

            if (!responseObj["demographyData"]) {
                responseObj["demographyData"] = {};
            }

            const result = await Constituency.findOne({ _id: payload.params.id }, { _id: 1, establishedYear: 1, name: 1 });
            if (!result) {
                throw Unauthorized("Constituency does not exist");
            }

            responseObj["_id"] = result._id;
            responseObj["name"] = result.name;
            responseObj["establishedYear"] = result.establishedYear;
            let getElectoralData = [];

            const getVillageDetails = await VillageDataModel.aggregate([
                {
                    $match: {
                        "constituencyId": result._id,
                        "years": payload.query.years
                    }
                },
                {
                    "$lookup": {
                        "from": "psvillagemappingdatas",
                        "localField": "villageName",
                        "foreignField": "villageName",
                        "as": "PSVillageMappingDataDetails"
                    }
                },
                {
                    $lookup: {
                        from: "form20",
                        localField: "PSVillageMappingDataDetails.pollingStationNo",
                        foreignField: "pollingStationID",
                        as: "form20DataDetails"
                    }
                },
                {
                    $project: {
                        village: 1,
                        villageName: 1,
                        location: {
                            $concat: [
                                "{ lat ", ":", { $toString: "$lattitude" },
                                " , ",
                                " long ", ":", { $toString: "$longitude" }, " }"
                            ]
                        },
                        // lattitude: 1,
                        // longitude: 1,
                        // pollingStationID: '$PSVillageMappingDataDetails.pollingStationNo',
                        form20DataDetails: '$form20DataDetails.party'
                    }
                }
            ]);

            for (let key of getVillageDetails) {
                key.form20DataDetails = key.form20DataDetails.reduce((accumulator, currentObject) => {
                    for (const [party, count] of Object.entries(currentObject)) {
                        accumulator[party] = (accumulator[party] || 0) + count;
                    }
                    return accumulator;
                }, {});

                const keysArray = Object.keys(key.form20DataDetails);
                // const valuesArray = Object.values(key.form20DataDetails);
                // const totalVotes = Object.values(key.form20DataDetails).reduce((acc, count) => acc + count, 0);


                key['winnerParty'] = {
                    "name": keysArray[0],
                    "colorCode": "#FF9933"
                }
                key['runnerUpParty'] = {
                    "name": keysArray[1],
                    "colorCode": "#0074CC"
                }
                key['firstRunnerUpParty'] = {
                    "name": keysArray[2],
                    "colorCode": "#FF6600"
                }

                delete key.form20DataDetails;
            }
            responseObj["villageData"] = getVillageDetails;

            let getpollingStationCount = await Form20Model.countDocuments(
                {
                    "constituencyId": result._id,
                    "years": payload.query.years
                }
            );

            responseObj["totalPSCount"] = getpollingStationCount;

            let getVillageCount = await VillageDataModel.countDocuments(
                {
                    "constituencyId": result._id,
                    "years": payload.query.years
                }
            );
            responseObj["totalVillageCount"] = getVillageCount;
            let getForm20Data = await Form20Model.aggregate([
                {
                    $match: {
                        "constituencyId": result._id,
                        "years": payload.query.years
                    }
                },
                {
                    $project: {
                        party: 1,
                    }
                }
            ]);

            let getresult = getForm20Data.reduce((accumulator, currentDocument) => {
                const currentParty = currentDocument.party;

                for (const [party, count] of Object.entries(currentParty)) {
                    accumulator[party] = (accumulator[party] || 0) + count;
                }

                return accumulator;
            }, {});

            const dataArray = Object.entries(getresult);
            dataArray.sort((a, b) => b[1] - a[1]);
            getresult = Object.fromEntries(dataArray);

            let valuesArray = Object.values(getresult);
            let keysArray = Object.keys(getresult);

            const totalVotes = Object.values(getresult).reduce((acc, count) => acc + count, 0);

            const getnoOfPSWon = getForm20Data.reduce((accumulator, currentDocument) => {
                const currentParty = currentDocument.party;

                const winningParty = Object.keys(currentParty).reduce((a, b) => currentParty[a] > currentParty[b] ? a : b);
                accumulator[winningParty] = (accumulator[winningParty] || 0) + 1;

                return accumulator;
            }, {});

            let valuesArraynoOfPSWon = Object.values(getnoOfPSWon);

            // const keysArraynoOfPSWon = Object.keys(getnoOfPSWon);

            const elementsAfterFirstThreeForOthers = valuesArraynoOfPSWon.slice(3);
            let getothersNoOfPSWon = elementsAfterFirstThreeForOthers.reduce((acc, value) => acc + value, 0);

            const elementsAfterFirstThree = valuesArray.slice(3);
            const getOthersCount = elementsAfterFirstThree.reduce((acc, value) => acc + value, 0);
            const getNoOfPSWonCount = valuesArraynoOfPSWon.reduce((acc, value) => acc + value, 0);


            const getPSVillageMappingDataModelData = await PSVillageMappingDataModel.aggregate([
                {
                    $match: {
                        "constituencyId": result._id,
                        "years": payload.query.years
                    }
                },
                {
                    $group: {
                        _id: '$villageName',
                        pollingStations: { $addToSet: '$pollingStationNo' },
                    }
                },
                {
                    $lookup: {
                        from: "form20",
                        localField: "pollingStations",
                        foreignField: "pollingStationID",
                        as: "form20Data"
                    }
                },
            ]);

            const partyCounts = getPSVillageMappingDataModelData.map(villageData => {
                const partyVotes = villageData.form20Data.reduce((acc, form20) => {
                    Object.entries(form20.party).forEach(([party, votes]) => {
                        acc[party] = (acc[party] || 0) + votes;
                    });
                    return acc;
                }, {});

                return { villageName: villageData._id, partyVotes };
            });

            function villagesWithHighestPartyVotes(data, partyName) {
                let villageCount = 0;
            
                data.forEach(village => {
                    const partyVotes = village.partyVotes[partyName];
                    const maxVotes = Math.max(...Object.values(village.partyVotes));
            
                    if (partyVotes === maxVotes) {
                        villageCount++;
                    }
                });
            
                return villageCount;
            }
            let othersCount = villagesWithHighestPartyVotes(partyCounts, keysArray[0]) + villagesWithHighestPartyVotes(partyCounts, keysArray[1]) + villagesWithHighestPartyVotes(partyCounts, keysArray[2])
            getElectoralData.push(
                {
                    "type": "winner",
                    "partyName": keysArray[0],
                    "partyColorCode": "#FF9933",
                    "voteShare": valuesArray[0],
                    "voteSharePercentage": (valuesArray[0] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[0],
                    "noOfVillageWon": villagesWithHighestPartyVotes(partyCounts, keysArray[0])
                },
                {
                    "type": "runnerUp",
                    "partyColorCode": "#0074CC",
                    "partyName": keysArray[1],
                    "voteShare": valuesArray[1],
                    "voteSharePercentage": (valuesArray[1] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[1],
                    "noOfVillageWon": villagesWithHighestPartyVotes(partyCounts, keysArray[1])
                },
                {
                    "type": "firstRunnerUp",
                    "partyColorCode": "#FF6600",
                    "partyName": keysArray[2],
                    "voteShare": valuesArray[2],
                    "voteSharePercentage": (valuesArray[2] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[2] || 0,
                    "noOfVillageWon": villagesWithHighestPartyVotes(partyCounts, keysArray[2])
                },
                {
                    "type": "others",
                    "partyColorCode": "#FF9966",
                    "partyName": "others",
                    "voteShare": getOthersCount,
                    "voteSharePercentage": (getOthersCount / totalVotes) * 100,
                    "noOfPSWon": getothersNoOfPSWon || 0,
                    "noOfVillageWon":  getVillageCount - othersCount
                },
                {
                    "type": "total",
                    "partyColorCode": "#000000",
                    "partyName": "total",
                    "voteShare": totalVotes,
                    "voteSharePercentage": 100,
                    "noOfPSWon": getpollingStationCount,
                    "noOfVillageWon": getVillageCount
                },
            );

            // const getnoOfPSWon = getForm20Data.reduce((accumulator, currentDocument) => {
            //     const currentParty = currentDocument.party;

            //     for (const [party, count] of Object.entries(currentParty)) {
            //         accumulator[party] = (accumulator[party] || 0) + 1; // Increment by 1 for each occurrence
            //     }

            //     return accumulator;
            // }, {});

            // const getnoOfPSWon = getForm20Data.reduce((accumulator, currentDocument) => {
            //     const currentParty = currentDocument.party;

            //     const winningParty = Object.keys(currentParty).reduce((a, b) => currentParty[a] > currentParty[b] ? a : b);
            //     accumulator[winningParty] = (accumulator[winningParty] || 0) + 1;

            //     return accumulator;
            // }, {});

            // let valuesArraynoOfPSWon = Object.values(getnoOfPSWon);
            // const keysArraynoOfPSWon = Object.keys(getnoOfPSWon);

            responseObj["electoralData"] = getElectoralData;

            // ----------------------- demographyData
            const getDemographyData = await ElectoralRollModel.aggregate([
                {
                    $match: {
                        "constituencyId": result._id,
                        "years": payload.query.years
                    }
                },
            ]);

            // Your original data
            // Assuming your response is stored in a variable called responseData
            // const responseData = [
            //     // ... (your provided data)
            // ];

            // Function to group data by age range
            function groupByAge(data) {
                const ageGroups = {
                    "18-25": 0,
                    "26-35": 0,
                    "36-50": 0,
                    "51-65": 0,
                    "65+": 0,
                    "Unknown": 0
                };

                data.forEach(person => {
                    const age = parseInt(person.age || 0);
                    if (age == 0) {
                        ageGroups["Unknown"] += 1;
                    } else if (age >= 18 && age <= 25) {
                        ageGroups["18-25"] += 1;
                    } else if (age >= 26 && age <= 35) {
                        ageGroups["26-35"] += 1;
                    } else if (age >= 36 && age <= 50) {
                        ageGroups["36-50"] += 1;
                    } else if (age >= 51 && age <= 65) {
                        ageGroups["51-65"] += 1;
                    } else {
                        ageGroups["65+"] += 1;
                    }
                });

                return Object.entries(ageGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Function to group data by gender
            function groupByGender(data) {
                const genderGroups = {
                    Male: 0,
                    Female: 0,
                    Others: 0,
                    Unknown: 0
                };

                data.forEach(person => {
                    const gender = person.gender ? person.gender.toLowerCase() : "";

                    if (gender === "" || gender === " ") {
                        genderGroups["Unknown"] += 1;
                    } else if (gender === "male") {
                        genderGroups["Male"] += 1;
                    } else if (gender === "female") {
                        genderGroups["Female"] += 1;
                    } else {
                        genderGroups["Others"] += 1;
                    }
                });

                return Object.entries(genderGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Function to group data by community
            function groupByCommunity(data) {
                const communityGroups = {};

                data.forEach(person => {
                    const community = person.community;

                    if (!communityGroups[community]) {
                        communityGroups[community] = 1;
                    } else {
                        communityGroups[community] += 1;
                    }
                });

                return Object.entries(communityGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Creating the final structure
            const normalDemoGraphy = {
                age: groupByAge(getDemographyData),
                gender: groupByGender(getDemographyData),
                community: groupByCommunity(getDemographyData)
            };

            // Output the result

            responseObj["demographyData"]["normalDemoGraphy"] = normalDemoGraphy;
            // -------------------------------------- Get ageVsGender

            // Initialize ageVsGender object with empty arrays for each age group
            const ageVsGender = {
                "18-25": [],
                "26-35": [],
                "36-50": [],
                "51-65": [],
                "65+": [],
                "Unknown": [],
            };

            // Categorize individuals based on age and gender
            getDemographyData.forEach(person => {
                const age = parseInt(person.age || 0);
                const gender = person.gender ? person.gender.toUpperCase() : "Unknown";
                let ageGroup;

                if (age == 0 || age == "") {
                    ageGroup = "Unknown";
                } else if (age >= 18 && age <= 25) {
                    ageGroup = "18-25";
                } else if (age >= 26 && age <= 35) {
                    ageGroup = "26-35";
                } else if (age >= 36 && age <= 50) {
                    ageGroup = "36-50";
                } else if (age >= 51 && age <= 65) {
                    ageGroup = "51-65";
                } else {
                    ageGroup = "65+";
                }

                const existingGender = ageVsGender[ageGroup].find(item => item.name === gender);

                if (existingGender) {
                    existingGender.noOfPeople++;
                } else {
                    ageVsGender[ageGroup].push({ name: gender, noOfPeople: 1 });
                }
            });

            let getAgeVsGender = ageVsGender;
            responseObj["demographyData"]["ageVsGender"] = getAgeVsGender;

            // ------------------  Get ageVsCommunity
            // Assuming your data is stored in the 'demographyData' variable
            const demographyData = [
                // ... (your data here)
            ];

            // Initialize the result object
            const ageVsCommunity = {
                "18-25": [],
                "26-35": [],
                "36-50": [],
                "51-65": [],
                "65+": [],
                "Unknown": [],
            };

            // Iterate over the demographic data
            getDemographyData.forEach(person => {
                const age = parseInt(person.age || 0);
                const communityName = person.community; // Assuming the community name is the person's name

                // Categorize individuals into age groups
                if (age == 0 || age == "") {
                    ageVsCommunity["Unknown"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 18 && age <= 25) {
                    ageVsCommunity["18-25"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 26 && age <= 35) {
                    ageVsCommunity["26-35"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 36 && age <= 50) {
                    ageVsCommunity["36-50"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 51 && age <= 65) {
                    ageVsCommunity["51-65"].push({ name: communityName, noOfPeople: 1 });
                } else {
                    ageVsCommunity["65+"].push({ name: communityName, noOfPeople: 1 });
                }
            });

            // Optionally, you can sort the result by age group
            Object.keys(ageVsCommunity).forEach(ageGroup => {
                ageVsCommunity[ageGroup].sort((a, b) => b.noOfPeople - a.noOfPeople);
            });

            responseObj["demographyData"]["ageVsCommunity"] = ageVsCommunity;



            // ------------------------  genderVsCommunity
            // Create an object to store the transformed data
            const transformedData = {
                genderVsCommunity: {
                    Male: [],
                    Female: [],
                    Other: [],
                    Unknown: [],
                },
            };

            // Iterate through the demographyData array
            getDemographyData.forEach(person => {
                const { gender, community } = person;

                // Find the gender category (Male, Female, or Other)
                const genderCategory = gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : gender === 'Unknown' ? 'Unknown' : 'Other';

                // Check if the community already exists in the corresponding gender category
                const existingCommunity = transformedData.genderVsCommunity[genderCategory].find(
                    item => item.name === community
                );

                // If the community exists, update the count, otherwise add a new entry
                if (existingCommunity) {
                    existingCommunity.noOfPeople++;
                } else {
                    transformedData.genderVsCommunity[genderCategory].push({
                        name: community,
                        noOfPeople: 1,
                    });
                }
            });

            responseObj["demographyData"]["genderVsCommunity"] = transformedData;

            return {
                status: true,
                data: responseObj,
                message: "Get Constituency successfull",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getVillageTableById
    static async getVillageTableById(payload) {
        try {

            let responseObj = {};

            if (!responseObj["demographyData"]) {
                responseObj["demographyData"] = {};
            }

            const result = await VillageDataModel.findOne({ _id: payload.params.id }, { _id: 1, constituencyId: 1, villageName: 1, constituencyName: 1, years: 1 });
            if (!result) {
                throw Unauthorized("Village  does not exist");
            }

            let getElectoralData = [];

            const getVillageDetails = await VillageDataModel.aggregate([
                {
                    $match: {
                        "_id": result._id,
                        "constituencyId": result.constituencyId,
                        "years": result.years
                    }
                },
                {
                    "$lookup": {
                        "from": "psvillagemappingdatas",
                        "localField": "villageName",
                        "foreignField": "villageName",
                        "as": "PSVillageMappingDataDetails"
                    }
                },
                {
                    $lookup: {
                        from: "form20",
                        localField: "PSVillageMappingDataDetails.pollingStationNo",
                        foreignField: "pollingStationID",
                        as: "form20DataDetails"
                    }
                },
                {
                    $project: {
                        village: 1,
                        villageName: 1,
                        form20DataDetails: '$form20DataDetails.party'
                    }
                }
            ]);

            // Use reduce to sum up the values for each party
            let reducedData = getVillageDetails[0].form20DataDetails.reduce((acc, entry) => {
                Object.entries(entry).forEach(([party, votes]) => {
                    acc[party] = (acc[party] || 0) + votes;
                });
                return acc;
            }, {});

            const dataArray = Object.entries(reducedData);
            dataArray.sort((a, b) => b[1] - a[1]);
            reducedData = Object.fromEntries(dataArray);

            let valuesArray = Object.values(reducedData);
            let keysArray = Object.keys(reducedData);

            const totalVotes = Object.values(reducedData).reduce((acc, count) => acc + count, 0);

            const getnoOfPSWon = getVillageDetails[0].form20DataDetails.reduce((accumulator, currentDocument) => {
                //   const currentParty = currentDocument.party;

                const winningParty = Object.keys(currentDocument).reduce((a, b) => currentDocument[a] > currentDocument[b] ? a : b);
                accumulator[winningParty] = (accumulator[winningParty] || 0) + 1;

                return accumulator;
            }, {});

            let valuesArraynoOfPSWon = Object.values(getnoOfPSWon);

            const elementsAfterFirstThreeForOthers = valuesArraynoOfPSWon.slice(3);
            let getothersNoOfPSWon = elementsAfterFirstThreeForOthers.reduce((acc, value) => acc + value, 0);

            const elementsAfterFirstThree = valuesArray.slice(3);
            const getOthersCount = elementsAfterFirstThree.reduce((acc, value) => acc + value, 0);

            // const elementsAfterFirstThree = valuesArraynoOfPSWon.slice(3);
            // const getOthersCount = elementsAfterFirstThree.reduce((acc, value) => acc + value, 0);
            // const totalNoOfPSWon = Object.values(valuesArraynoOfPSWon).reduce((acc, count) => acc + count, 0);

            // let valuesArraynoOfPSWon = Object.values(getnoOfPSWon);

            // const keysArraynoOfPSWon = Object.keys(getnoOfPSWon);

            // const elementsAfterFirstThreeForOthers = valuesArraynoOfPSWon.slice(3);
            // let getothersNoOfPSWon = elementsAfterFirstThree.reduce((acc, value) => acc + value, 0);

            const getNoOfPSWonCount = valuesArraynoOfPSWon.reduce((acc, value) => acc + value, 0);

            getElectoralData.push(
                {
                    "type": "winner",
                    "partyColorCode": "#FF9933",
                    "partyName": keysArray[0],
                    "voteShare": valuesArray[0],
                    "voteSharePercentage": (valuesArray[0] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[0],
                },
                {
                    "type": "runnerUp",
                    "partyColorCode": "#0074CC",
                    "partyName": keysArray[1],
                    "voteShare": valuesArray[1],
                    "voteSharePercentage": (valuesArray[1] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[1],
                },
                {
                    "type": "firstRunnerUp",
                    "partyColorCode": "#FF6600",
                    "partyName": keysArray[2],
                    "voteShare": valuesArray[2],
                    "voteSharePercentage": (valuesArray[2] / totalVotes) * 100,
                    "noOfPSWon": valuesArraynoOfPSWon[2] || 0,
                },
                {
                    "type": "others",
                    "partyColorCode": "#FF9966",
                    "partyName": "others",
                    "voteShare": getOthersCount,
                    "voteSharePercentage": (getOthersCount / totalVotes) * 100,
                    "noOfPSWon": getothersNoOfPSWon,
                },
                {
                    "type": "total",
                    "partyColorCode": "#000000",
                    "partyName": "Total",
                    "voteShare": totalVotes,
                    "voteSharePercentage": 100,
                    "noOfPSWon": getNoOfPSWonCount,
                }
            );


            responseObj["electoralData"] = getElectoralData;

            // --------------------------------------  demographyData
            let villageName = result.villageName;
            const getPollingStationIDs = await VillageDataModel.aggregate([
                {
                    '$match': {
                        'villageName': villageName,
                        "constituencyId": result.constituencyId
                    }
                },
                {
                    "$lookup": {
                        "from": "psvillagemappingdatas",
                        "localField": "villageName",
                        "foreignField": "villageName",
                        "as": "PSVillageMappingDataDetails"
                    }
                },
                {
                    $unwind: "$PSVillageMappingDataDetails"
                },
                {
                    $group: {
                        _id: null,
                        pollingStationNos: { $addToSet: "$PSVillageMappingDataDetails.pollingStationNo" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        pollingStationNos: 1
                    }
                }
            ]);

            const getDemographyData = await ElectoralRollModel.aggregate([
                {
                    $match: {
                        "constituencyId": ObjectId(result.constituencyId),
                        "years": result.years,
                        "pollingStationNo": { $in: getPollingStationIDs[0].pollingStationNos }
                    }
                },
            ]);
            // Function to group data by age range
            function groupByAge(data) {
                const ageGroups = {
                    "18-25": 0,
                    "26-35": 0,
                    "36-50": 0,
                    "51-65": 0,
                    "65+": 0,
                    "Unknown": 0
                };

                data.forEach(person => {
                    const age = parseInt(person.age || 0);

                    if (age == 0 || age == "") {
                        ageGroups["Unknown"] += 1;
                    } else if (age >= 18 && age <= 25) {
                        ageGroups["18-25"] += 1;
                    } else if (age >= 26 && age <= 35) {
                        ageGroups["26-35"] += 1;
                    } else if (age >= 36 && age <= 50) {
                        ageGroups["36-50"] += 1;
                    } else if (age >= 51 && age <= 65) {
                        ageGroups["51-65"] += 1;
                    } else {
                        ageGroups["65+"] += 1;
                    }
                });

                return Object.entries(ageGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Function to group data by gender
            function groupByGender(data) {
                const genderGroups = {
                    Male: 0,
                    Female: 0,
                    Others: 0,
                    Unknown: 0
                };

                data.forEach(person => {
                    const gender = person.gender ? person.gender.toLowerCase() : "";

                    if (gender === "" || gender === " ") {
                        genderGroups["Unknown"] += 1;
                    } else if (gender === "male") {
                        genderGroups["Male"] += 1;
                    } else if (gender === "female") {
                        genderGroups["Female"] += 1;
                    } else {
                        genderGroups["Others"] += 1;
                    }
                });

                return Object.entries(genderGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Function to group data by community
            function groupByCommunity(data) {
                const communityGroups = {};

                data.forEach(person => {
                    const community = person.community;

                    if (!communityGroups[community]) {
                        communityGroups[community] = 1;
                    } else {
                        communityGroups[community] += 1;
                    }
                });

                return Object.entries(communityGroups).map(([name, noOfPeople]) => ({
                    name,
                    noOfPeople
                }));
            }

            // Creating the final structure
            const normalDemoGraphy = {
                age: groupByAge(getDemographyData),
                gender: groupByGender(getDemographyData),
                community: groupByCommunity(getDemographyData)
            };

            // Output the result

            responseObj["demographyData"]["normalDemoGraphy"] = normalDemoGraphy;
            // -------------------------------------- Get ageVsGender

            // Initialize ageVsGender object with empty arrays for each age group
            const ageVsGender = {
                "18-25": [],
                "26-35": [],
                "36-50": [],
                "51-65": [],
                "65+": [],
                "Unknown": []
            };

            // Categorize individuals based on age and gender
            getDemographyData.forEach(person => {
                const age = parseInt(person.age || 0);
                const gender = person.gender ? person.gender.toUpperCase() : "Unknown";
                let ageGroup;

                if (age == 0) {
                    ageGroup = "Unknown";
                } else if (age >= 18 && age <= 25) {
                    ageGroup = "18-25";
                } else if (age >= 26 && age <= 35) {
                    ageGroup = "26-35";
                } else if (age >= 36 && age <= 50) {
                    ageGroup = "36-50";
                } else if (age >= 51 && age <= 65) {
                    ageGroup = "51-65";
                } else {
                    ageGroup = "65+";
                }

                const existingGender = ageVsGender[ageGroup].find(item => item.name === gender);

                if (existingGender) {
                    existingGender.noOfPeople++;
                } else {
                    ageVsGender[ageGroup].push({ name: gender, noOfPeople: 1 });
                }
            });

            let getAgeVsGender = ageVsGender;
            responseObj["demographyData"]["ageVsGender"] = getAgeVsGender;

            // ------------------  Get ageVsCommunity

            const ageVsCommunity = {
                "18-25": [],
                "26-35": [],
                "36-50": [],
                "51-65": [],
                "65+": [],
                "Unknown": []
            };

            getDemographyData.forEach(person => {
                const age = parseInt(person.age || 0);
                const communityName = person.community; // Assuming the community name is the person's name

                if (age == 0 || age == "") {
                    ageVsCommunity["Unknown"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 18 && age <= 25) {
                    ageVsCommunity["18-25"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 26 && age <= 35) {
                    ageVsCommunity["26-35"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 36 && age <= 50) {
                    ageVsCommunity["36-50"].push({ name: communityName, noOfPeople: 1 });
                } else if (age >= 51 && age <= 65) {
                    ageVsCommunity["51-65"].push({ name: communityName, noOfPeople: 1 });
                } else {
                    ageVsCommunity["65+"].push({ name: communityName, noOfPeople: 1 });
                }
            });

            // Optionally, you can sort the result by age group
            Object.keys(ageVsCommunity).forEach(ageGroup => {
                ageVsCommunity[ageGroup].sort((a, b) => b.noOfPeople - a.noOfPeople);
            });

            responseObj["demographyData"]["ageVsCommunity"] = ageVsCommunity;

            // ------------------------  genderVsCommunity
            const transformedData = {
                genderVsCommunity: {
                    Male: [],
                    Female: [],
                    Other: [],
                    Unknown: []
                },
            };

            // Iterate through the demographyData array
            getDemographyData.forEach(person => {
                const { gender, community } = person;

                // Find the gender category (Male, Female, or Other)
                const genderCategory = gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : gender === 'Unknown' ? 'Unknown' : 'Other';

                // Check if the community already exists in the corresponding gender category
                const existingCommunity = transformedData.genderVsCommunity[genderCategory].find(
                    item => item.name === community
                );

                // If the community exists, update the count, otherwise add a new entry
                if (existingCommunity) {
                    existingCommunity.noOfPeople++;
                } else {
                    transformedData.genderVsCommunity[genderCategory].push({
                        name: community,
                        noOfPeople: 1,
                    });
                }
            });

            responseObj["demographyData"]["genderVsCommunity"] = transformedData;

            return {
                status: true,
                data: responseObj,
                message: "Get Constituency successfull",
                error: null
            };
        } catch (error) {

            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // getConstituencyFileUploadedSummary
    static async getConstituencyFileUploadedSummary() {
        try {

            let responseObj = {};
            if (!responseObj["total"]) {
                responseObj["total"] = {};
            }
            if (!responseObj["complete"]) {
                responseObj["complete"] = {};
            }
            if (!responseObj["incomplete"]) {
                responseObj["incomplete"] = {};
            }
            const getTotalConstituency = await Constituency.aggregate([
                {
                    $group: {
                        _id: "$type", // Group by the "type" field
                        count: { $sum: 1 } // Calculate the count for each group
                    }
                }
            ]);
            if (!getTotalConstituency) {
                throw Unauthorized("Constituency does not exist");
            }

            if (getTotalConstituency[0]._id === "state") {
                responseObj["total"]["assembley"] = getTotalConstituency[0].count;
            } else {
                responseObj["total"]["assembley"] = 0;
            }

            if (getTotalConstituency[0]._id === "central") {
                responseObj["total"]["parlimentry"] = getTotalConstituency[0].count;
            } else {
                responseObj["total"]["parlimentry"] = 0;
            }

            const completedAssembleyConstituency = await Constituency.countDocuments({ type: "state", uploadedFileCount: 4 });
            if (completedAssembleyConstituency) {
                responseObj["complete"]["assembley"] = completedAssembleyConstituency;
            } else {
                responseObj["complete"]["assembley"] = 0;
            }

            const completedParlimentryConstituency = await Constituency.countDocuments({ type: "central", uploadedFileCount: 4 });
            if (completedParlimentryConstituency) {
                responseObj["complete"]["parlimentry"] = completedParlimentryConstituency;
            } else {
                responseObj["complete"]["parlimentry"] = 0;
            }

            // Incomplete
            const incompleteAssembleyConstituency = await Constituency.countDocuments({ type: "state", uploadedFileCount: { $lt: 4 } });
            if (incompleteAssembleyConstituency) {
                responseObj["incomplete"]["assembley"] = incompleteAssembleyConstituency;
            } else {
                responseObj["incomplete"]["assembley"] = 0;
            }

            const incompleteParlimentryConstituency = await Constituency.countDocuments({ type: "central", uploadedFileCount: { $lt: 4 } });
            if (incompleteParlimentryConstituency) {
                responseObj["incomplete"]["parlimentry"] = incompleteParlimentryConstituency;
            } else {
                responseObj["incomplete"]["parlimentry"] = 0;
            }

            return {
                status: true,
                data: responseObj,
                message: "Get Constituency successfull",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async deleteUploadedForm20DataByConstituencyId(payload) {
        try {

            const id = payload.params.id;
            const result = await Form20Model.deleteMany({ constituencyId: id, years: payload.query.years });

            if (result.deletedCount === 0) {
                throw Unauthorized("Form20 Data does not exist");
            }

            const constituencyData = await Constituency.findByIdAndUpdate(
                { _id: ObjectId(id) }, { $inc: { uploadedFileCount: -1 } }
            );

            return {
                status: true,
                data: result,
                message: "Delete Uploaded Form20 Data successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async deleteUploadedVillageDataByConstituencyId(payload) {
        try {

            const id = payload.params.id;
            const result = await VillageDataModel.deleteMany({ constituencyId: id, years: payload.query.years });

            if (result.deletedCount === 0) {
                throw Unauthorized("Village Data does not exist");
            }
            const constituencyData = await Constituency.findByIdAndUpdate(
                { _id: ObjectId(id) }, { $inc: { uploadedFileCount: -1 } }
            );
            return {
                status: true,
                data: result,
                message: "Delete Uploaded Village Data successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async deleteUploadedElectoralRollsDataByConstituencyId(payload) {
        try {

            const id = payload.params.id;
            const result = await ElectoralRollModel.deleteMany({ constituencyId: id, years: payload.query.years });

            if (result.deletedCount === 0) {
                throw Unauthorized("Electoral Rolls Data does not exist");
            }
            const constituencyData = await Constituency.findByIdAndUpdate(
                { _id: ObjectId(id) }, { $inc: { uploadedFileCount: -1 } }
            );
            return {
                status: true,
                data: result,
                message: "Delete Uploaded Electoral Rolls Data successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    // deleteUploadedPSvillageMappingDataByConstituencyId
    static async deleteUploadedPSvillageMappingDataByConstituencyId(payload) {
        try {

            const id = payload.params.id;
            const result = await PSVillageMappingDataModel.deleteMany({ constituencyId: id, years: payload.query.years });

            if (result.deletedCount === 0) {
                throw Unauthorized("PS Village Mapping Data does not exist");
            }
            const constituencyData = await Constituency.findByIdAndUpdate(
                { _id: ObjectId(id) }, { $inc: { uploadedFileCount: -1 } }
            );
            return {
                status: true,
                data: result,
                message: "Delete Uploaded PS Village Mapping Data successfully",
                error: null
            };
        }
        catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }

    static async downloadUploadedFileByConstituencyId(req) {
        try {

            const id = req.params.id;
            let query = { constituencyId: id, years: req.query.year }
            let model = "";
            if(req.query.model === "form20"){
                model = Form20Model;
            }
            if(req.query.model === "electoralrolls"){
                model = ElectoralRollModel;
            } 
            if(req.query.model === "villagedatas"){
                model = VillageDataModel;
            } 
            if(req.query.model === "psvillagemappingdatas"){
                model = PSVillageMappingDataModel;
            } 
  
            const result = await model.findOne(query, { filePath: 1 });
            if (!result) {
                throw Unauthorized("File does not exist");
            }

            if (result.filePath) {

                const params = {
                    Bucket: process.env.BUCKET,
                    Key: result.filePath.key
                };

                const command = new GetObjectCommand(params);
                let accessKeyId = process.env.ACCESS_KEY;
                let secretAccessKey = process.env.ACCESS_SECRET;
                const s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: process.env.REGION });
                let getUrl = await getSignedUrl(s3Client, command, { expiresIn: 180000 });

                result.filePath.publicUrl = getUrl
            }

            return {
                status: true,
                data: result,
                message: "Got file successfully",
                error: null
            };
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    }
}

module.exports = constituency;