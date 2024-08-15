const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        validate(value){
            if(!validator.isLength(value,{min:3})){
                throw new Error("First name atleast have 3 letters")
            }
        }
    },
    lastName: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter a valid email address")
            }
        }
    },
    phone:{
        type: Number
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    profilePic: {
        type: String,
        default: "/photo/Default_Profile_Image.png"
    },
    isProUser: {
        type: Boolean,
        default: false
    },
    trialExpiresAt: {
        type: Date
    }
},
{
    timestamps: { 
        createdAt: true, 
        updatedAt: true 
    }
})

userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, "grooveix")

    user.token = token
    await user.save()

    return token
}


const User = mongoose.model('User', userSchema)

module.exports = User