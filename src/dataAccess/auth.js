const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {  SESSION_SECRET } =require("../util/secrets");

module.exports = {
    allowedTypes:["user"],
    getPasswordHash(password){
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    },
    comparePassword(password,hash){
        const result = bcrypt.compareSync(password, hash);
        return result;
    },
    generateToken(payloads){
        return jwt.sign(payloads, SESSION_SECRET);
    },
    verifyToken(token){
        return new Promise(resolve => jwt.verify(token, SESSION_SECRET, function(err, decoded) {
            resolve({error:err,decoded:decoded});    
        }));
    }
};