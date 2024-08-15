const mongoose = require('mongoose');


const songSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    artists: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'Artist'
        }
    ],
    albums: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'Album'
        }
    ],
    genres: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref:'Genre'
        }
    ],
    file: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: "/photo/Default_Cover_Image.png"
    },
    lyrics: {
        type: String
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User'
    },
    isPrivate: {
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


const Song = mongoose.model('Song', songSchema)

module.exports = Song;