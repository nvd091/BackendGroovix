
exports.isPro = async (req, res, next) => {
    try{

        if(req.user.userType!=="admin"){
            if(!req.user.isProUser){
                throw new Error("Trial expired...!!!")
            }else if(req.user.trialExpiresAt < new Date()){
                throw new Error("Trial expired...!!!")
            }
        }
      
        next()
        
    }catch(e){
        res.status(401).send({error: "Please authenticate...!!!"})
    }
}

