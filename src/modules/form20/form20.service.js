const form20Model = require("./form20.model");
const VillageData = require("./villageData.model");
const ElectoralRolls = require("./electoralRolls.model");
const PSVillageMappingData = require("./PSVillageMappingData.model");
const PartyColoursData = require("./PartyColours.model");
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl, getSignedUrlPromise } = require("@aws-sdk/s3-request-presigner");
const csv = require("csvtojson");
const xlsx = require('xlsx');
const constituencyModel = require("../constituency/constituency.model");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const ObjectId = require('mongoose').Types.ObjectId;
const Responses = require("../../utils/utils.response");

// var empResponse;

class Form20Service {

    //upload csv data into mongoDB
    // Old
    // static async uploadCsvDataToDb(req, res) {
    //     try {
    //         let form20Data;

    //         const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
    //         if (!getConstituency) {
    //             throw Unauthorized("Constituency data does not exist");
    //         }

    //         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const jsonData = xlsx.utils.sheet_to_json(worksheet);

    //         const dateString = getConstituency.establishedYear;
    //         const dateObject = new Date(dateString);
    //         const year = dateObject.getFullYear();

    //         // Add a new field to each row
    //         const newData = jsonData.map(row => {
    //             row["pollingStationID"] =  row["Polling Station ID (System Generated)"];
    //             row["pollingStationNumber"] =  row["Polling Station Number"];
    //             row["pollingStationName"] =  row["Polling Station Name"];
    //             row["villageUID"] =  row["Village UID (System Generated)"];
    //             row["totalNoOfValidVotes"] =  row["Total_No_of_Valid_Votes"];
    //             row["noOfRejectedVotes"] =  row["No_of_Rejected_Votes"];
    //             row["note"] =  row["NOTA"];
    //             row["totalVotes"] =  row["Total_Votes"];
    //             row["noTenderedVotes"] =  row["No_Tendered_Votes"];
    //             row["winnerPartyOrCandidate"] =  row["Winner Party / Candidate"];
    //             row["winnerPartyOrCandidateHexCodeColor"] =  row["Winner Party / Candidate HexCode Color"];
    //             row["runnerParty1Candidate"] =  row["Runner Party 1 / Candidate"];
    //             row["runnerParty1CandidateHexCodeColor"] =  row["Runner Party 1 / Candidate HexCode Color"];
    //             row["runnerParty2Candidate"] =  row["Runner Party 2 / Candidate"];
    //             row["runnerParty2CandidateHexCodeColor"] =  row["Runner Party 2 / Candidate HexCode Color"];
    //             row["winnerVoteShare"] =  row["Winner_VoteShare (%)"];
    //             row["runnerParty1VoteShare"] =  row["Runner_Party 1_VoteShare (%)"];
    //             row["runnerParty2VoteShare"] =  row["Runner_Party 2_VoteShare (%)"];
    //             row["winningMargin"] =  row["Winning_Margin"];
    //             row["differenceMargin"] =  row["Difference_Margin"];

    //             return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: year,  yearOfElection: getConstituency.establishedYear,  };
    //         });  

    //         form20Model.insertMany(newData, (err, data) => {
    //             if (err) {
    //                 console.log(err)
    //             } else {
    //                 form20Data = data;
    //                 return data;
    //             }
    //         })
    //         //     });

    //         return {
    //             status: true,
    //             data: form20Data,
    //             message: "data uploaded successfully",
    //             error: null
    //         };
    //     } catch (error) {
    //         return {
    //             status: false,
    //             data: null,
    //             message: error.message,
    //             error
    //         };
    //     }
    // };

    // static async uploadCsvDataToDb(req, res) {
    //     try {
    //         let form20Data;

    //         const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
    //         if (!getConstituency) {
    //             throw Unauthorized("Constituency data does not exist");
    //         }

    //         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const jsonData = xlsx.utils.sheet_to_json(worksheet);

    //         const dateString = getConstituency.establishedYear;
    //         const dateObject = new Date(dateString);
    //         const year = dateObject.getFullYear();

    //         // Add a new field to each row
    //         const newData = jsonData.map(row => {
    //             // console.log("row ---------------- ", row);
    //             row["SI_No"] =  row["SI.No."];
    //             row["pollingStationID"] =  row["P.S.No"];
    //             row["pollingStationName"] =  row["Polling Station Name"];
    //             // row["villageUID"] =  row["Village UID (System Generated)"];
    //             // row["totalNoOfValidVotes"] =  row["Total_No_of_Valid_Votes"];
    //             // row["noOfRejectedVotes"] =  row["No_of_Rejected_Votes"];
    //             // row["note"] =  row["NOTA"];
    //             // row["totalVotes"] =  row["Total_Votes"];
    //             // row["noTenderedVotes"] =  row["No_Tendered_Votes"];
    //             // row["winnerPartyOrCandidate"] =  row["Winner Party / Candidate"];
    //             // row["winnerPartyOrCandidateHexCodeColor"] =  row["Winner Party / Candidate HexCode Color"];
    //             // row["runnerParty1Candidate"] =  row["Runner Party 1 / Candidate"];
    //             // row["runnerParty1CandidateHexCodeColor"] =  row["Runner Party 1 / Candidate HexCode Color"];
    //             // row["runnerParty2Candidate"] =  row["Runner Party 2 / Candidate"];
    //             // row["runnerParty2CandidateHexCodeColor"] =  row["Runner Party 2 / Candidate HexCode Color"];
    //             // row["winnerVoteShare"] =  row["Winner_VoteShare (%)"];
    //             // row["runnerParty1VoteShare"] =  row["Runner_Party 1_VoteShare (%)"];
    //             // row["runnerParty2VoteShare"] =  row["Runner_Party 2_VoteShare (%)"];
    //             // row["winningMargin"] =  row["Winning_Margin"];
    //             // row["differenceMargin"] =  row["Difference_Margin"];

    //             return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: year,  yearOfElection: getConstituency.establishedYear,  };
    //         });  

    //         // form20Model.insertMany(newData, (err, data) => {
    //         //     if (err) {
    //         //         console.log(err)
    //         //     } else {
    //         //         form20Data = data;
    //         //         return data;
    //         //     }
    //         // })
    //         //     });

    //         return {
    //             status: true,
    //             data: form20Data,
    //             message: "data uploaded successfully",
    //             error: null
    //         };
    //     } catch (error) {
    //         return {
    //             status: false,
    //             data: null,
    //             message: error.message,
    //             error
    //         };
    //     }
    // };

    static async uploadVillageDataToDb(req, res) {
        try {
            let form20Data;

            const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
            if (!getConstituency) {
                throw Unauthorized("Constituency data does not exist");
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            // const dateString = getConstituency.establishedYear;
            // const dateObject = new Date(dateString);
            // const year = dateObject.getFullYear();

            // Add a new field to each row
            const newData = jsonData.map(row => {

                row["villageUID"] = row["Village UID (System Generated)"];
                row["villageName"] = row["Village Name"];
                row["totalNoofPollingStations"] = row["Total No of Polling Stations"];
                row["lattitude"] = row["Lattitude"];
                row["longitude"] = row["Longitude"];
                row["description"] = row["Description"];
                return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: req.body.year, yearOfElection: getConstituency.establishedYear, fileName: req.file.originalname, filePath: req.body.filePath };
            });

            if (newData[0] == undefined) {
                throw Unauthorized("Village data not uploaded");
            }

            VillageData.insertMany(newData, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    form20Data = data;
                    return data;
                }
            })

            const constituencyData = await constituencyModel.findByIdAndUpdate(
                { _id: ObjectId(req.body.constituencyId) }, { $inc: { uploadedFileCount: 1 } }
            );

            return {
                status: true,
                data: form20Data,
                message: "data uploaded successfully",
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
    };

    //get uploaded csv data from mongoDB
    static async getForm20Data(req) {
        try {
            const form20Data = await form20Model.find({}, {});

            //if form20Data is null or array is empty throw error
            if (!form20Data || form20Data?.length === 0) {
                return {
                    status: false,
                    data: null,
                    message: "No data found",
                    error: "No data found"
                };
            }
            return {
                status: true,
                data: form20Data,
                message: "Got form20 data successfully",
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
    };

    // uploadElectoralRollsData
    // static async uploadElectoralRollsData(req, res) {
    //     try {
    //         let form20Data;

    //         const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
    //         if (!getConstituency) {
    //             throw Unauthorized("Constituency data does not exist");
    //         }

    //         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];
    //         const jsonData = xlsx.utils.sheet_to_json(worksheet);

    //         const dateString = getConstituency.establishedYear;
    //         const dateObject = new Date(dateString);
    //         const year = dateObject.getFullYear();

    //         // Add a new field to each row
    //         const newData = jsonData.map(row => {

    //             row["name"] =  row["Name"];
    //             row["age"] =  row["Age"];
    //             row["Gender"] =  row["Gender"];
    //             row["voterId"] =  row["Voter_id"];
    //             row["fathersName"] =  row["Father'sName"];
    //             row["mothersName"] =  row["Mother'sName"];
    //             row["husbandsName"] =  row["Husband'sName"];
    //             row["houseNumber"] =  row["HouseNumber"];
    //             row["partyInclination"] =  row["Party Inclination"];
    //             row["caste"] =  row["Caste"];

    //             return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: year, yearOfElection: getConstituency.establishedYear };
    //         });  

    //         ElectoralRolls.insertMany(newData, (err, data) => {
    //             if (err) {
    //                 console.log(err)
    //             } else {
    //                 form20Data = data;
    //                 return data;
    //             }
    //         })

    //         return {
    //             status: true,
    //             data: form20Data,
    //             message: "data uploaded successfully",
    //             error: null
    //         };
    //     } catch (error) {
    //         return {
    //             status: false,
    //             data: null,
    //             message: error.message,
    //             error
    //         };
    //     }
    // };

    // uploadPSVillageMappingData
    static async uploadPSVillageMappingData(req, res) {
        try {
            let form20Data;

            const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
            if (!getConstituency) {
                throw Unauthorized("Constituency data does not exist");
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            // const dateString = getConstituency.establishedYear;
            // const dateObject = new Date(dateString);
            // const year = dateObject.getFullYear();

            // Add a new field to each row
            const newData = jsonData.map(row => {

                row["pollingStationNo"] = row["P.S.No"];
                row["villageName"] = row["Village Name"];
                row["MandalOrTown"] = row["Mandal/Town"];
                row["VillageTypeRuralOrUrban"] = row["Village Type ( Rural/Urban)"];

                return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: req.body.year, yearOfElection: getConstituency.establishedYear, fileName: req.file.originalname, filePath: req.body.filePath };
            });

            if (newData[0] == undefined) {
                throw Unauthorized("PS Village Mapping data not uploaded");
            }

            PSVillageMappingData.insertMany(newData, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    form20Data = data;
                    return data;
                }
            })
            const constituencyData = await constituencyModel.findByIdAndUpdate(
                { _id: ObjectId(req.body.constituencyId) }, { $inc: { uploadedFileCount: 1 } }
            );

            return {
                status: true,
                data: form20Data,
                message: "data uploaded successfully",
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
    };

    static async uploadElectoralRollsData(req, res) {
        try {
            let form20Data;

            const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
            if (!getConstituency) {
                throw Unauthorized("Constituency data does not exist");
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            // const dateString = getConstituency.establishedYear;
            // const dateObject = new Date(dateString);
            // const year = dateObject.getFullYear();

            // Add a new field to each row
            const newData = jsonData.map(row => {

                row["Voterlist_sl_no"] = row["Voterlist_sl.no."];
                row["pollingStationNo"] = row["P.S.No"];
                row["name"] = row["Name"];
                row["age"] = row["Age"];
                row["gender"] = row["Gender"];
                row["FatherOrHusbandName"] = row["Father's/Husband'sName"];
                row["houseNumber"] = row["HouseNumber"];
                row["community"] = row["Community"];
                row["partyInclination"] = row["Party Inclination"];

                return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: req.body.year, yearOfElection: getConstituency.establishedYear, fileName: req.file.originalname, filePath: req.body.filePath };
            });

            if (newData[0] == undefined) {
                throw Unauthorized("Electoral Rolls data not uploaded");
            }
            ElectoralRolls.insertMany(newData, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    form20Data = data;
                    return data;
                }
            })

            const constituencyData = await constituencyModel.findByIdAndUpdate(
                { _id: ObjectId(req.body.constituencyId) }, { $inc: { uploadedFileCount: 1 } }
            );

            return {
                status: true,
                data: form20Data,
                message: "data uploaded successfully",
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
    };

    static async uploadCsvDataToDb(req, res) {
        try {
            let form20Data;

            const getConstituency = await constituencyModel.findOne({ _id: ObjectId(req.body.constituencyId) }, { __v: 0 });
            if (!getConstituency) {
                throw Unauthorized("Constituency data does not exist");
            }

            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            // const dateString = getConstituency.establishedYear;
            // const dateObject = new Date(dateString);
            // const year = req.body.year;

            // Add a new field to each row
            const newData = jsonData.map(row => {
                if (row["SI.No."] != 'undefined' && typeof (row["SI.No."]) != 'undefined') {

                    row["pollingStationID"] = row["P.S.No"];
                    let party = {};

                    for (let key in row) {
                        if (key !== "totalVotes", key != "pollingStationID" && key !== "SI.No." && key !== "P.S.No" && key !== "Constituency" && key !== "SUM(IND)" && key != "SUM(IND)" && key != "Total of valid votes" && key != "NOTA" && key != "No.of rejected votes" && key != "Total Votes" && key != "No of tendered votes.") {
                            if (key !== "pollingStationID" && key !== "SI.No." && key !== "P.S.No") {
                                party[key] = row[key]
                            }
                        }
                    }

                    row["totalVotes"] = row["Total Votes"];
                    row["party"] = party;

                    return { ...row, constituencyId: getConstituency._id, constituencyName: getConstituency.name, years: req.body.year, yearOfElection: getConstituency.establishedYear, fileName: req.file.originalname, filePath: req.body.filePath };
                }
            });

            if (newData[0] == undefined) {
                throw Unauthorized("form20 data not uploaded");
            }

            form20Model.insertMany(newData, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    form20Data = data;
                    return data;
                }
            })
            //uploadedFileCount
            const constituencyData = await constituencyModel.findByIdAndUpdate(
                { _id: ObjectId(req.body.constituencyId) }, { $inc: { uploadedFileCount: 1 } }
            );

            return {
                status: true,
                data: form20Data,
                message: "data uploaded successfully",
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
    };

    // 
    static async uploadPartyColoursData(req, res) {
        try {
            let form20Data;

            // const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

            // const XLSX = require('xlsx');

            // const excelFilePath = 'your_file.xlsx'; // Replace with your actual file path
            
            function transformData(sheet) {
              const transformedData = [];
              let currentState = null;
            
              for (let i in sheet) {
                const stateCell = sheet['Recognized National Parties' + i];
                const partyNameCell = sheet['__EMPTY' + i];
                const colorNameCell = sheet['__EMPTY_1' + i];
                const colorCodeCell = sheet['__EMPTY_5' + i];
            
                if (stateCell && stateCell.v !== '') {
                  currentState = {
                    state: stateCell.v,
                    parties: [],
                  };
                  transformedData.push(currentState);
                }
            
                if (currentState && partyNameCell && colorNameCell && colorCodeCell) {
                  currentState.parties.push({
                    party: partyNameCell.v,
                    color: {
                      name: colorNameCell.v,
                      code: colorCodeCell.v,
                    },
                  });
                }
              }
            
              return transformedData;
            }
            
            function printTransformedData(transformedData) {
              transformedData.forEach((state) => {
                console.log(`State: ${state.state}`);
                state.parties.forEach((party) => {
                  console.log(`  Party: ${party.party}`);
                  console.log(`    Color Name: ${party.color.name}`);
                  console.log(`    Color Code: ${party.color.code}`);
                });
              });
            }
            
            // Read Excel file
            // xlsx.read(req.file.buffer, { type: 'buffer' });
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // console.log("sheet ------------- ", sheet);
            
            // Transform data
            const transformedData = transformData(sheet);
            
            // Print transformed data
            // printTransformedData(transformedData);
            
            console.log("transformedData ------------ ", transformedData);
            if (transformedData[0] == undefined) {
                throw Unauthorized("Party Colours Data not uploaded");
            }

            PartyColoursData.insertMany(transformedData, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    form20Data = data;
                    return data;
                }
            })

            return {
                status: true,
                data: form20Data,
                message: "data uploaded successfully",
                error: null
            };
        } catch (error) {
            console.log("Error ---------------- ", error);
            return {
                status: false,
                data: null,
                message: error.message,
                error
            };
        }
    };
};

module.exports = Form20Service;