const mongoose = require('mongoose');


const artistSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: {
        createdAt: true, 
        updatedAt: true 
    }
})


const Artist = mongoose.model('Artist', artistSchema)

module.exports = Artist;