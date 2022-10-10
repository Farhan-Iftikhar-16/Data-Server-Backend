const mongoose = require('mongoose');

const LoginSchema = new mongoose.Schema({
    user: { type: mongoose.ObjectId, ref: 'User' },
    login_status: { type: Number, default: 1}
}, { timestamps: true });

const autoPopulateChildren = function(next) {
    this.populate('user');
    next();
  };
  
  LoginSchema.pre('findOne', autoPopulateChildren).pre(
    'find',
    autoPopulateChildren,
  );

const Login = mongoose.model('LoginTrack', LoginSchema);
module.exports = Login;
