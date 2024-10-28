const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require:true,
    },
    userType:{
        type:String,
        require:true
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
