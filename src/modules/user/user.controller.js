const User = require('../user/user.model');
const { validationResult } = require('express-validator');
const Responses = require("../../utils/utils.response");
const UserService = require("../user/user.service");
const EncryptDecrypt = require("../../utils/utils.encryptDecrypt");
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const bcrypt = require("bcrypt");
const AwsClient = require("../../config/awsconfig");
const AWS3 = require("@aws-sdk/client-s3");
const DateFormatter = require('../../utils/utils.dateFormatter');
const path = require("path");
const { getSignedUrl, getSignedUrlPromise } = require("@aws-sdk/s3-request-presigner");
const { roles } = require('../../middleware/roles');
const AccessControl = require("accesscontrol");
const ac = new AccessControl();
const UniqueId = require("../../utils/utils.uniqueId");
const EncryptAndDecrypt = require("../../utils/utils.encryptAndDecrypt");

class UserController {


    static async userCreate(req, res) {
        try {

            // Validate incoming input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(Responses.errorResponse(errors))
            }

            if (typeof req.body.phone !== "number") {
                return res.status(400).json(Responses.errorResponse({ message: "Please enter number values for phone" }))
            }

            // let password = UniqueId.create_password(req.body.firstName);
            const encryptedPassword = EncryptAndDecrypt.encrypt(req.body.password);

            //req.body.password = EncryptDecrypt.crypt(req.body.password);
            const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
            const hash = bcrypt.hashSync(req.body.password, salt);
            req.body.password = hash;
            req.body.userPassword = encryptedPassword;

            const result = await UserService.createUser(req.body);
            const {
                status, error, message, data
            } = result;

            if (status) {
                // data.password = password;
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                return res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async usersGet(req, res) {
        try {

            // if (req.authData.role !== "management") {
            //     throw Unauthorized("Only admin can see all users");
            // }

            const result = await UserService.getAllUser();
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async userUpdate(req, res) {
        try {

            if (req.authData.user.type != "superadmin") {
                if (req.authData.user._id !== req.params.id) {
                    throw Unauthorized("Unauthorized");
                }
            }

            // Validate incoming input
            if (!req.query.keyword) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json(Responses.errorResponse(errors))
                }
                if (typeof req.body.phone !== "number") {
                    return res.status(400).json(Responses.errorResponse({ message: "Please enter number values for phone" }))
                }
                // req.body.password = EncryptDecrypt.crypt(req.body.password);
            }

            if(req.body.password){
                const encryptedPassword = EncryptAndDecrypt.encrypt(req.body.password);
                const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
                const hash = bcrypt.hashSync(req.body.password, salt);
                req.body.password = hash;
                req.body.userPassword = encryptedPassword;
            }
            const result = await UserService.userUpdate(req);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    static async userDelete(req, res) {
        try {
            const result = await UserService.userDelete(req.params.id);
            const {
                status, error, message, data
            } = result;
            if (status) {
                res.status(201).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))

        }
    }

    static async userLogin(req, res) {

        const result = await UserService.login(req.body);

        const {
            status, error, message, data
        } = result;
        if (status) {
            res.status(200).json(Responses.successResponse(message, data));
        } else {
            res.status(error.status || 500).json(Responses.errorResponse(error));
        }
    }

    //fetches user detail with id
    static async fetchUserWithId(req, res) {

        try {

            // console.log("req.authData.role ---------------- ", req.authData);
            // const permission = roles.can(req.authData.user.role).readOwn('profile').granted;
            // console.log('permission: ',permission);

            // if (req.authData.role != "management") {
            //     if (req.authData.id !== req.params.id) {
            //         throw Unauthorized("Unauthorized");
            //     }
            // }
            User.findById({ _id: req.params.id }, function (err, info) {
                if (err) {
                    res.status(404).json(err);
                }
                else {

                    if(info){
    
                        info.userPassword = EncryptAndDecrypt.decrypt(info.userPassword)
                        res.status(200).json(Responses.successResponse("Users found Sucessfully", info))
                        // res.json(info);
                        // console.log('res from contrlr:',res);
                    }else{
                        res.status(404).json(Responses.successResponse("User does not exist."))
                    }
                }
            })
        } catch (error) {
            res.status(error.status || 500).json(Responses.errorResponse(error));
        }

    }

    //fetch multiple users with pagination
    static async fetchUsers(req, res) {
        try {
            if (res.paginatedResults.data.results.length == 0) {
                res.paginatedResults.message = "No User found";
                res.paginatedResults.status = 404;
                console.log(res.paginatedResults);
                res.status(404).json(res.paginatedResults);
            }

            else {
                res.paginatedResults.message = "Users found Sucessfully";
                res.status(201).json(res.paginatedResults);
            }

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    //search user with keyword
    static async searchUserWithKeyword(req, res) {
        try {
            if (req.authData.user.type != "superadmin") {
                throw Unauthorized("Unauthorized");
            }

            const result = await UserService.searchUserWithKeywordService(req);
            const { status, data, currentPage, totalPages, totaldocuments, message, error } = result;
            return res.json({ "error": error, "status": status, "message": message, "data": data, "totaldocuments": totaldocuments, "currentpage": currentPage, "totalpages": totalPages });

        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    }

    //gets called when requesting to reset password
    static async resetPasswordRequestController(req, res) {
        try {
            //passing email to find user
            const requestPasswordResetService = await UserService.requestPasswordReset(
                req.body.email
            );

            const {
                status, error, message, data
            } = requestPasswordResetService;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            res.status(400).json(Responses.errorResponse(error));
        }
    };

    //when link gets click in mail this controller get called
    static async resetPasswordController(req, res) {
        try {
            const resetPasswordService = await UserService.resetPassword(req);
            //resolving the promise from resetpassword
            const {
                status, error, message, data
            } = resetPasswordService;
            if (status) {
                res.status(200).json(Responses.successResponse(message, data));
            } else {
                res.status(error.status || 500).json(Responses.errorResponse(error));
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json(Responses.errorResponse(error));
        }

    };

    // updateUserProfile
    static async updateUserProfile(req, res) {
        try {

            if (req.authData.user.type != "superadmin") {
                if (req.authData.user._id !== req.params.id) {
                    throw Unauthorized("Unauthorized");
                }
            }

            let getUser = await User.findById({ _id: req.params.id })
            if (getUser == "null") {
                throw Unauthorized("User does not exist");
            }
            // File upload in S3
            let filename = `staging/users/${DateFormatter.getMonth(new Date())}/${getUser.id}/avtar.png`;
            let params = { Key: filename, Bucket: "polstrat-backend", Body: req.file.buffer };
            if (getUser.profileImageLink) {
                // Delete existing file
                const command = new AWS3.PutObjectCommand(params);
                await AwsClient.s3Instance.send(command)
            }

            const command = new AWS3.GetObjectCommand(params);
            const response = await getSignedUrl(AwsClient.s3Instance, command, { expiresIn: 3600 })

            if (response) {

                req.body.profileImageLink = response;

                const result = await UserService.updateUserProfile(req);
                const {
                    status, error, message, data
                } = result;
                if (status) {
                    res.status(201).json(Responses.successResponse(message, data));
                } else {
                    res.status(error.status || 500).json(Responses.errorResponse(error));
                }
            } else {
                res.status(error.status || 500).json(response);
            }


        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }

    // deleteUserProfile
    static async deleteUserProfile(req, res) {
        try {

            if (req.authData.user.type != "superadmin") {
                if (req.authData.user._id !== req.params.id) {
                    throw Unauthorized("Unauthorized");
                }
            }

            const filename = path.basename(req.body.profileImageLink);
            const s3 = new AwsClient.AWS.S3({});
            let bucketName = `polstrat-backend/staging/users/${DateFormatter.getMonth(new Date())}`
            let deleteParams = { Key: filename, Bucket: bucketName };

            s3.deleteObject(deleteParams, async (err, response) => {
                if (err) {
                    return res.status(400).json(Responses.errorResponse(err))
                }

                req.body.profileImageLink = "";

                const result = await UserService.updateUserProfile(req);
                const {
                    status, error, message, data
                } = result;
                if (status) {
                    res.status(201).json(Responses.successResponse(message, data));
                } else {
                    res.status(error.status || 500).json(Responses.errorResponse(error));
                }
            })

        } catch (error) {
            res.status(400).json(Responses.errorResponse(error))
        }
    }
}

module.exports = UserController;
