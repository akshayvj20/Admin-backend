
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");
const Users = require("../user/user.model");
const AccessToken = require("../../utils/utils.accessToken");
const sendEmailPasswordReset = require("../../utils/utils.sendEmailPasswordReset");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const EncryptDecrypt = require("../../utils/utils.encryptDecrypt");
const EncryptAndDecrypt = require("../../utils/utils.encryptAndDecrypt");

class UserServices {
    // user Login
    static async login(payload) {
        try {

            const { email, password } = payload;

            // check if user exist
            const user = await Users.findOne({ email }, { firstName: 1, lastName:1, email: 1, phone: 1, password: 1, role: 1, _id: 1, userstatus:1, bio: 1, profileImageLink: 1 });

            if (!user) {
                throw Unauthorized("User does not exist");
            }

            if(user.userstatus != "active"){
                throw Unauthorized("This account is suspended.");
            }

            let isverified = await bcrypt.compare(password, user.password);    
                
            // let getPassword = EncryptDecrypt.decrypt(user.password);
            // if (password !== user.password) {
            if (!isverified) {
                throw Unauthorized("Email and Password do not match");
            }

            //generate token using user object above and store it in cookie
            let _user = user._doc;
            _user.type = "superadmin";
            const token = AccessToken.generateAccessToken(_user);
            // res.cookie('jwtoken', 'Bearer ' + token, {
            //     expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
            // })

            // check if password is correct
            // const checkPassword = await AuthHelpers.isPasswordValid(user.password, password);

            // if (!checkPassword) {
            //     throw Unauthorized("invalid login credentials, please check your email or password");
            // }
            // // create token
            // const token = await AuthHelpers.generateToken({ userId: user._id });

            //removed the password from the returned data
            user.password = undefined;

            return {
                status: true,
                data: {
                    user,
                    token
                },
                message: "Login successfully",
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

    // Create user
    static async createUser(payload) {
        try {

   
            let { firstName, lastName, email, password,userhash, role, phone, userPassword, bio } = payload;
            const checkUser = await Users.findOne({ email });
            // password = UniqueId.create_password(firstName);
            
            // check if user email exist in DB
            if (checkUser) {
                throw Forbidden("user with this email address exists");
            }

            // save user into the DB
            const user = await Users.create({
                firstName,
                lastName,
                email,
                password,
                userhash,
                role,
                phone,
                userPassword,
                bio
            });
            
            if (!user) {
                throw InternalServerError("Unable to save user's data");
            }
            else {
                return {
                    status: true,
                    data: { id: user._id, firstName, lastName, email, role, phone, password, userPassword, bio },
                    message: "user created sucessfully",
                    error: null
                }
            }
        } catch (error) {
            return {
                status: false,
                data: null,
                message: error.message,
                error: error
            };
        }
    }

    //Get All Users
    static async getAllUser() {
        try {

            const user = await Users.find({}, { "__v": 0, "password":0,"resetPasswordToken":0 });
            if (!user) {
                throw Unauthorized("User does not exist");
            }

            return {
                status: true,
                data: user,
                message: "Get all users successfully",
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

    // Update User
    static async userUpdate(req) {
        try {

            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true, runValidators: true };


            if(req.query.keyword){
                let userchangeddata = Users.findOneAndUpdate({_id:id}, updatedData, {}, (err, updatedDoc) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("userstatus updated");
                    }
                });
                let { firstName, lastName, email, role, phone,userstatus, userPassword, bio, profileImageLink } = userchangeddata;
                userPassword =  EncryptAndDecrypt.decrypt(userPassword)

                return {
                    status: true,
                    error: null,
                    message: "User updated single field successfully",
                    data: {id, firstName, lastName, email, role, phone,userstatus, userPassword, bio, profileImageLink },
                };
            }

            // check if user email exist in DB
            const checkUser = await Users.findOne({ email: req.body.email });
            if (checkUser && checkUser.id !== id) {
                throw Forbidden("Email address already exists");
            }

            // delete updatedData.password;
            const user = await Users.findByIdAndUpdate(
                id, updatedData, options
            );
            if (!user) {
                throw Unauthorized("User does not exist");
            }

            let { firstName, lastName, email, role, phone,userstatus, alternativeEmail, userPassword, bio, profileImageLink } = updatedData;

            userPassword =  EncryptAndDecrypt.decrypt(userPassword)

            return {
                status: true,
                error: null,
                message: "User update successfully",
                data: {id, firstName, lastName, email, role, phone,userstatus, alternativeEmail, userPassword, bio, profileImageLink },
            };
        } catch (error) {
            return {
                status: false,
                error: error,
                message: error.message,
                data: null,
            };
        }
    }

    static async userDelete(payload) {
        try {

            const id = payload;
            const user = await Users.deleteOne({ _id: id });

            if (user.deletedCount === 0) {
                throw Unauthorized("User does not exist");
            }

            return {
                status: true,
                data: {
                    user
                },
                message: "User Delete successfully",
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

    //finds user then adds token and sends mail to user with reset password link
    static async requestPasswordReset(email) {
        try{
            const user = await Users.findOne({ email });
            if (!user) return (
                {
                    status: false,
                    message: "user not found",
                    error: "user not found",
                    data: user
                }
            )
    
            const id = user.id;
            const options = { new: true };
            //throw new Error("User does not exist");
            //find the user with resetpasswordtoken field
            let founduser = await Users.findOne({ resetPasswordToken: user.resetPasswordToken });
            //if token is alredy present then replace with the latest password generated
            if (founduser.resetPasswordToken) {
                await Users.findByIdAndUpdate(
                    id, { resetPasswordToken: null }, options
                );
    
            }
            //console.log("resetPasswordToken after : ",resetPasswordToken);
            let resetToken = crypto.randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));
            //add the hashed token to the user
            const updateduser = await Users.findByIdAndUpdate(
                id, { resetPasswordToken: hash }, options
            );
            //if user is not found
            if (!updateduser) {
                return ({ status: false, message: "user does not exist", error:"user does not exist" ,data:updateduser})
            }
            //generate a link with token and userid
            const link = `${process.env.CLIENT_URL}api/users/auth/passwordReset?token=${resetToken}&id=${user._id}`;
            //sends mail to user with password reset link
    
            const resp = await sendEmailPasswordReset(user.email, "Password Reset Request", { data: `<p>Click <a href=${link}>here</a> to reset your password</p>` });
    
            //if everything went well the return status as true
            
            if(!resp.messageId){
                return {
                    status: false,
                    data: null,
                    message: "Email not sent",
                    error: "Email Not Sent"
                }
            }
            else{
                return {
                    status: true,
                    data: "Email sent successfully",
                    message: "Email sent successfully",
                    error: null
                }
            }
        }
        catch(error){
            return {
                status: false,
                data: null,
                message: "Email not sent",
                error: error
            }
        }
    };

    static async searchUserWithKeywordService(req) {
        try {

            const no_of_docs_each_page = parseInt(req.query.size) || 10; // 10 docs in single page
            const current_page_number = parseInt(req.query.page) || 1; // 1st page
            const keyword = req.query.keyword;

            if (keyword === "") {
                return {
                    status: false,
                    data: [],
                    currentPage:current_page_number,
                    totalPages,
                    message: "Pls add keyword or search string to search user",
                    error: "Pls add keyword or search string to search user"
                };
            }

            let query = {
                '$or': [
                    { 'email': { '$regex': keyword, '$options': 'i' } },
                    { 'firstName': { '$regex': keyword, '$options': 'i' } },
                    { 'lastName': { '$regex': keyword, '$options': 'i' } },
                    { 'phone': { '$regex': keyword, '$options': 'i' } },
                    { 'role': { '$regex': keyword, '$options': 'i' } },
                    { 'userstatus': { '$regex': keyword, '$options': 'i' } }]
            }

            //find user with firstname, lastname and email with pagination
            const foundUser = await Users.find(query, { password: 0 }
            ).skip(no_of_docs_each_page * (current_page_number - 1))
                .limit(no_of_docs_each_page);

            let totaldocuments = await Users.countDocuments(query);
            var totalPages = Math.ceil(totaldocuments/no_of_docs_each_page);

            
            if (foundUser.length != 0) {
                return {
                    status: true,
                    data: foundUser,
                    currentPage:current_page_number,
                    totalPages,
                    totaldocuments,
                    message: "User found",
                    error: null
                };
            }
            else {
                return {
                    status: false,
                    data: [],
                    currentPage:0,
                    totalPages:0,
                    totaldocuments,
                    message: "User Not found",
                    error: "User Not found"
                };
            }

        }
        catch (error) {

            return {
                status: false,
                data: [],
                currentPage:current_page_number,
                totalPages,
                message: "Error searching user",
                error
            };
        }
    }

    //this function gets called when link gets clicked from users email to match user and reset password
    static async resetPassword(req) {
        try{
            if (req.body.password.length < 3 || req.body.password === undefined) {
                return{ 
                    status: false, 
                    message: "password is too short", 
                    data: null,
                    error:"password is too short"
                };
            }
            let userId = req.query.id;
            let token = req.query.token;
            let password = EncryptDecrypt.crypt(req.body.password);
            let foundUser = await Users.findOne({ _id: userId });
            if (!foundUser) {
                return { 
                    status: false, 
                    message: "user not found for password update", 
                    data: foundUser,
                    error: "user not found for password update"
                }
            }
    
            let passwordResetToken = foundUser.resetPasswordToken;
    
            if (!passwordResetToken) {
                return { status: false, 
                    message: "password reset token is not valid", 
                    data: passwordResetToken ,
                    error: "password reset token is not valid"
                }
            }
            const isValid = await bcrypt.compare(token, passwordResetToken);
            if (!isValid) {
                return { status: false, 
                    message: "token doesn't match", 
                    data: isValid,
                    error: "token doesn't match" 
                }
            }
    
            await Users.updateOne(
                { _id: userId },
                { $set: { password: password, lastpasswordchangedate: new Date() } },
                { new: true }
            );
            const user = await Users.findById({ _id: userId });
            sendEmailPasswordReset(
                user.email,
                "Password Reset Successfully",
                { data: "Your Password was changed Successfully on Polstrat" }
            );
            //after reseting the password reset the token 
            const updateduser = await Users.findByIdAndUpdate(
                                    userId, { resetPasswordToken: null }
            );
    
            return { status: true, message: "password updated sucessfully", data: updateduser,error:null }
        }
        catch(error){
            return { 
                status: false, 
                message: "error in updating password", 
                data: null,
                error: error
            }
        }
    };

    // updateUserProfile

    static async updateUserProfile(req) {

        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true, runValidators: true };

        const user = await Users.findByIdAndUpdate(
            id, updatedData, options
        );
        if (!user) {
            throw Unauthorized("User does not exist");
        }

        let { firstName, lastName, email, role, phone,userstatus, bio } = updatedData;
        return {
            status: true,
            error: null,
            message: "User profile update successfully",
            data: {id, firstName, lastName, email, role, phone,userstatus, bio },
        };
    }
}

module.exports = UserServices;
