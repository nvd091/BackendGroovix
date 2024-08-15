const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User'
    },
    song: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Song'
    }
},
{
    timestamps: { 
        createdAt: true, 
        updatedAt: true 
    }
})


const Like = mongoose.model('Like', likeSchema)
module.exports = Like;