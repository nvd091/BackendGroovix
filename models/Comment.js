const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User'
    },
    song: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Song'
    },
    message: {
        type: String,
        required: true
    }
},
{
    timestamps: { 
        createdAt: true, 
        updatedAt: true
    }
})


const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment;