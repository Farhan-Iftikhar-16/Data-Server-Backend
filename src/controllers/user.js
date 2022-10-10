const User = require('../models/User');
const LoginTrack = require('../models/LoginTrack');
const helper = require('./helper');
const auth = require('../dataAccess/auth');
const uuid = require('uuid');

module.exports ={
    login: async (req, res) => {
        if(!req.body.email){
            return res.status(400).json({success:false,message:"Please provide a valid email!",data:[]});
        }
        else if(!req.body.password){
            return res.status(400).json({success:false,message:"Please provide a valid password!",data:[]});
        }
        const {email,password} = req.body;
        let user = await User.findOne({email: req.body.email.toLowerCase()})
        user = JSON.parse(JSON.stringify(user))
        if(!user){
            return res.status(404).json({success:false,message:`Email ${email} not found.`,data:[]});
        }
        const passResult = auth.comparePassword(password,user.password);
        if(!passResult){
            return res.status(400).json({success:false,message: "Invalid email or password.",data:[]});
        }
        delete user.password;
        const loginTrack = await LoginTrack.find({user: user._id})
            let firstLogin = false;
            if(loginTrack){
                if(Array.isArray(loginTrack) && loginTrack.length >=1){
                    firstLogin=false;
                }
                else{
                    firstLogin=true;
                }
            }
            let loginSaveStatus = new LoginTrack({ user: user._id });
            loginSaveStatus = await loginSaveStatus.save();
            user.loginId = loginSaveStatus._id;
            const token = auth.generateToken(user);
            // user.avatar = helpers.mapImageHost(user.avatar);
            res.cookie('access_token', token, { maxAge: 9000000, httpOnly: true });
            res.status(200).json({success:true,message: "Login successfully",data:{
                accessToken: token,
                user: user,
                firstLogin
            }});
    },
    logout: async (req, res) => {
        await LoginTrack.updateOne({_id: req.params.id}, {login_status: 0});
        // const response = await dbClient.query("update public.login_track set login_status=0 where id=$1",[req.user.loginId]);
        // console.log(response,req.user);
        res.cookie('access_token','');
        return res.status(200).json({success:true,message:"Logout successfully",data:[]});
    },
    singup: async (req, res, next) => {
        if(!req.body.email){
            return res.status(400).json({success:false,message:"Please provide a valid email!",data:[]});
        }
        else if(!req.body.password){
            return res.status(400).json({success:false,message:"Please provide a password!",data:[]});
        }
        else if(!req.body.firstName){
            return res.status(400).json({success:false,message:"Please provide first name!",data:[]});
        }
        else if(!req.body.lastName){
            return res.status(400).json({success:false,message:"Please provide last name!",data:[]});
        }
        try {
        const result = await User.find({ email: req.body.email })
        if(result && result.length>0){
            return res.status(400).json({success:false,message:"Account with that email address already exists.",data:[]});
        }
        let password = req.body.password;
        if(password !== req.body.confirmPassword) {
            return res.status(400).json({success:false,message:"Password and confirm password do not match.",data:[]});
        }
        password = auth.getPasswordHash(password);
        let avatar = "";
        const file = req.files;
        if(file && typeof file == "object" && file["user_image"]){
            avatar = file["user_image"][0].filename;
        }
        let user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password,
            avatar: avatar
        })
        const saveStatus = await user.save();
        const userId = saveStatus._id;
        let data = {
            ...req.body,
            userId
        }
        return res.status(200).json({success:true,message:"Signup successfully",data:data});
        }
        catch(ex){
            console.log('signup expection',ex);
            res.status(500).json({success:false,message:"Something went wrong"});
        }
    },
    searchUsers: async (req, res) => {
        const users = await User.find({
            $and: [
                {_id: {$ne: req.params.id}},
                {email: {$regex : req.params.query}}
            ]
        });

        const usersDataToSend = [];

        for (let user of users) {
            usersDataToSend.push({
                name: user.firstName + ' ' + user.lastName,
                id: user._id
            });
        }

        res.status(200).json({success:true, message:'ok', users:usersDataToSend});
    }
}
