const _ = require('lodash');
const LoginTrack = require('../models/LoginTrack');
const auth = require('../dataAccess/auth');
/**
 * Login Required middleware.
 */
const isAuthenticatedMiddleWare = async (req, res, next) => {
    const accessToken = req.params.access_token  || req.headers["access_token"] || req.query.access_token || (req.body ? req.body.access_token:"") || req.cookies.access_token;
    if(!accessToken && req.skipAuth){
        return next();
    }
    const {error,decoded} = await auth.verifyToken(accessToken);
    if(error || !decoded){
        if(req.skipAuth){
            return next();
        }
        if(req.xhr)
            return res.status(401).json({success:false,msg:"Something went wrong while authorizing request!"});
        else{
            return res.redirect('/login');
        }
    }
    if(!decoded.loginId){
        if(req.skipAuth){
            return next();
        }
        if(req.xhr)
            return res.status(401).json({success:false,msg:"Please login again!"});
        else{
            return res.redirect('/login');
        }
    }
    const loginTrack = await LoginTrack.findOne({ _id: decoded.loginId, login_status: 1});
    if(!loginTrack){
        if(req.skipAuth){
            return next();
        }
        if(req.xhr){
            return res.status(401).json({success:false,msg:"Your login session has been expired!"});
        }
        else{
            return res.redirect('/login');
        }
    }
    // if(Array.isArray(loginTrack.result) && loginTrack.result.length <= 0){
    //     if(req.skipAuth){
    //         return next();
    //     }
    //     if(req.xhr){
    //         return res.status(401).json({success:false,msg:"Login session expired!"});
    //     } 
    //     else{
    //         return res.redirect('/login');
    //     }
    // }
    const user = loginTrack.user;
    if(!user){
        if(req.skipAuth){
            return next();
        }
        if(req.xhr) {
            return res.json({success:false,msg:"User not found. Please login again to continue!",data:{}});
        }
        else{
            return res.redirect('/login');
        }
    }
    user.loginId = decoded.loginId;
    req.user = user;
    res.locals.user = user;
    res.locals.isAuthenticated = true;
    res.locals.isAdmin = user.role && user.role === 'admin';
    next();
};
exports.isAuthenticated = isAuthenticatedMiddleWare;

exports.listingAuth = [
    (req, res, next) => {
        req.skipAuth = true;
        req.user={};
        next();
    },
    isAuthenticatedMiddleWare
];
exports.isAdmin = (req, res, next) => {
    // console.log(req.user)
    req.user = req.user || {};
    if(!req.user || req.user.role != 'admin'){
        if(req.xhr){
            return res.json({success:false,msg:"You do not have access to this resource!",data:{}});
        }
        else{
            return res.redirect('/login');
        }
    }
    res.locals.isAdmin = true;
    next();
}