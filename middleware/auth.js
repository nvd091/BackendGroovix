const jwt = require('jsonwebtoken')
const User = require('../models/User')


exports.auth = async (req, res, next) => {
    try{

        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, "grooveix")
        let user = await User.findOne({_id:decoded._id, token})
        
        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        
        next()
        
    }catch(e){
        res.status(401).send({error: "Please authenticate...!!!"})
    }
}

