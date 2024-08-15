const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Genre = require('../models/Genre');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Playlist = require('../models/Playlist');


const findOrCreate = async (Model, value) => {
    if (mongoose.Types.ObjectId.isValid(value)) {
        return new mongoose.Types.ObjectId(value);
    } else {
        const existing = await Model.findOne({ name: value });
        if (existing) return existing._id;

        const newDoc = new Model({ name: value });
        await newDoc.save();

        return newDoc._id;
    }
};

exports.addSong = async (req, res) => {
    
    try{

        if (!req?.files?.song) {
            return res.status(400).send({ error: 'Song file is required.' });
        }

        const { albums, artists, genres } = req.body;
        let payLoad = req.body;

        if(req?.files?.song && req?.files?.song[0]){
            payLoad = {
                ...payLoad,
                file: req.files.song[0].path.replace("audio\\","/audio/"),
            }
        }

        if(req?.files?.coverImage && req?.files?.coverImage[0]){
            payLoad = {
                ...payLoad,
                coverImage: req.files.coverImage[0].path.replace("photo\\","/photo/"),
            }
        }

        if(req?.files?.lyrics && req?.files?.lyrics[0]){
            payLoad = {
                ...payLoad,
                lyrics: req.files.lyrics[0].path.replace("lyrics\\","/lyrics/"),
            }
        }

        const processedAlbums = await Promise.all(albums.map(album => findOrCreate(Album, album)));
        const processedArtists = await Promise.all(artists.map(artist => findOrCreate(Artist, artist)));
        const processedGenres = await Promise.all(genres.map(genre => findOrCreate(Genre, genre)));

        const newSong = new Song({
            ...payLoad,
            albums: processedAlbums,
            artists: processedArtists,
            genres: processedGenres,
            addedBy: req.user._id
        });
        await newSong.save();

        const song = await Song.findById(newSong._id)
            .populate('artists')
            .populate('albums')
            .populate('genres')
            .populate('addedBy', 'firstName lastName');

        res.status(201).send({ message: 'Song added successfully!', song });

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.updateSong = async (req,res) => {
    
    try{

        let newData = req.body;

        let song = await Song.findById(req.params.id);
        if(!song){
           throw new Error("Song not found!"); 
        }

        if(req?.files?.song && req?.files?.song[0]){
            if (fs.existsSync(song.file)) {
                fs.unlinkSync(song.file);
            }
            newData = {
                ...newData,
                file: req.files.song[0].path.replace("audio\\","/audio/")
            }
        }
        if(req?.files?.coverImage && req?.files?.coverImage[0]){
            if (fs.existsSync(song.coverImage) && song.coverImage!=="/photo/Default_Cover_Image.png") {
                fs.unlinkSync(song.coverImage);
            }
            newData = {
                ...newData,
                coverImage: req.files.coverImage[0].path.replace("photo\\","/photo/"),
            }
        }
        if(req?.files?.lyrics && req?.files?.lyrics[0]){
            if (fs.existsSync(song.lyrics)) {
                fs.unlinkSync(song.lyrics);
            }
            newData = {
                ...newData,
                lyrics: req.files.lyrics[0].path.replace("lyrics\\","/lyrics/")
            }
            console.log(newData)
        }

        const processedAlbums = await Promise.all(req.body.albums.map(album => findOrCreate(Album, album)));
        const processedArtists = await Promise.all(req.body.artists.map(artist => findOrCreate(Artist, artist)));
        const processedGenres = await Promise.all(req.body.genres.map(genre => findOrCreate(Genre, genre)));

        newData = {
            ...newData,
            albums: processedAlbums,
            artists: processedArtists,
            genres: processedGenres,
        }

        song = await Song.findByIdAndUpdate(
            req.params.id,
            newData,
            {new: true}
        );


        if(!song){
           throw new Error("Song not found!"); 
        }

        song = await Song.findById(song._id)
            .populate('artists')
            .populate('albums')
            .populate('genres')
            .populate('addedBy', 'firstName lastName');

        res.status(201).send({ message: 'Song updated successfully!', song });


    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.getSong = async (req,res) => {
    
    try{

        const song = await Song.findById(req.params.id)
            .populate('artists')
            .populate('albums')
            .populate('genres')
            .populate('addedBy', 'firstName lastName');

        if(!song){
           throw new Error("Song not found!"); 
        }

        res.status(201).send({ message: 'Song fetched successfully!', song });

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.deleteSong = async (req,res) => {
    
    try{

        const song = await Song.findByIdAndDelete(req.params.id);
        if(!song){
           throw new Error("Song not found!"); 
        }

        if (fs.existsSync(song.file)) {
            fs.unlinkSync(song.file);
        }
        if (fs.existsSync(song.coverImage) && song.coverImage!=="/photo/Default_Cover_Image.png") {
            fs.unlinkSync(song.coverImage);
        }

        res.status(201).send({ message: 'Song deleted successfully!', song });

    }catch(error){
        res.send({error: error.message})
    }
    
}

const sendFile = (res, filePath) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send({ error: 'File not found' });
        }
        res.sendFile(path.resolve(filePath));
    });
};

exports.getSongFile = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return new Error('Song not found');
        }
        sendFile(res, song.file);
    } catch (error) {
        res.send({error: error.message})
    }
};

exports.getCoverImage = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return new Error('Song not found');
        }
        sendFile(res, song.coverImage);
    } catch (error) {
        res.send({error: error.message})

    }
};

exports.getSongList = async (req, res) => {
    try {
        const { search, artists, albums, genres, isUser } = req.body;
        const userId = req.user._id;

        let filter = {};
        let aggregateArray = [];

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (artists && artists.length > 0) {
            filter.artists = { $in: artists.map(id => new mongoose.Types.ObjectId(id)) };
        }

        if (albums && albums.length > 0) {
            filter.albums = { $in: albums.map(id => new mongoose.Types.ObjectId(id)) };
        }

        if (genres && genres.length > 0) {
            filter.genres = { $in: genres.map(id => new mongoose.Types.ObjectId(id)) };
        }
        if (isUser) {
            filter.addedBy = new mongoose.Types.ObjectId(req.user._id);
        }else if(req.user.userType!=="admin"){
            filter.$or = [
                { isPrivate: false },
                { isPrivate: { $exists: false } },
                { addedBy: new mongoose.Types.ObjectId(req.user._id) }
            ];
        }

        aggregateArray.push({ $match: filter });

        aggregateArray.push(
            { $lookup: { from: 'artists', localField: 'artists', foreignField: '_id', as: 'artists' } },
            { $lookup: { from: 'albums', localField: 'albums', foreignField: '_id', as: 'albums' } },
            { $lookup: { from: 'genres', localField: 'genres', foreignField: '_id', as: 'genres' } },
            { $lookup: { from: 'users', localField: 'addedBy', foreignField: '_id', as: 'addedBy' } },
            { $unwind: { path: '$addedBy', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'likes',
                    let: { songId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$song', '$$songId'] }, { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] } } },
                        { $project: { _id: 1 } }
                    ],
                    as: 'likes'
                }
            },
            {
                $addFields: {
                    liked: { $cond: { if: { $eq: [{ $size: '$likes' }, 0] }, then: false, else: true } }
                }
            },
            { $sort: { createdAt: -1 } }
        );

        const songs = await Song.aggregate(aggregateArray);

        res.status(200).send({ songs });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.addLike = async (req, res) => {
    try {

        const { id } = req.body;
        const song = await Song.findById(id);
        if(!song){
            throw new Error("Song not found!");
        }

        let isOneLike = await Like.findOne({ user: req.user._id }).count();
        if(isOneLike === 0){
            if(!await Playlist.findOne({ name: 'Liked Songs', user: req.user._id })){
                const playlist = new Playlist({
                    name: 'Liked Songs',
                    user: req.user._id,
                    song: [song._id]
                });
                await playlist.save();
            }else{
                await Playlist.findOneAndUpdate({ name: 'Liked Songs', user: req.user._id }, { $addToSet: { song: song._id } });
            }
        }else{
            await Playlist.findOneAndUpdate({ name: 'Liked Songs', user: req.user._id }, { $addToSet: { song: song._id } });
        }

        let like = new Like({
            user: req.user._id,
            song: song._id
        });
        await like.save();
        like = await Like.findById(like._id).populate('user').populate('song');

        res.status(200).send({ like });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.removeLike = async (req, res) => {
    try {

        const { id } = req.body;

        const song = await Song.findById(id);
        if(!song){
            throw new Error("Song not found!");
        }

        const like = await Like.deleteOne({
            user: req.user._id,
            song: song._id
        }).populate('user').populate('song');

        let isOneLike = await Like.findOne({ user: req.user._id}).count();
        if(isOneLike === 0){
            await Playlist.findOneAndDelete({ name: 'Liked Songs', user: req.user._id });
        }

        res.status(200).send({ like });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {

        const { message, song } = req.body;

        let comment = new Comment({
            user: req.user._id,
            song: song,
            message: message
        });
        await comment.save();

        comment = await Comment.findById(comment._id).populate('user');

        res.status(200).send({ comment });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {

        const comments = await Comment.find({ song: req.params.id }).populate('user').sort({ createdAt: -1 });

        res.status(200).send({ comments });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.createPlaylist = async (req, res) => {
    try {
        const { name } = req.body;

        let playlist = new Playlist({
            name,
            user: req.user._id
        });
        await playlist.save();

        playlist = await Playlist.findById(playlist._id).populate('user');

        res.status(200).send({ playlist });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        if(!playlist){
            throw new Error("Playlist not found!");
        }

        res.status(200).send({ playlist });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.addPlaylist = async (req, res) => {
    try {
        const { songIds, playlistId } = req.body;

        let playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { song: songIds } },
            { new: true }
        );
        if(!playlist){
            throw new Error("Playlist not found!");
        }

        if(playlist.name === 'Liked Songs'){
            for (const songId of songIds){
                if(!await Like.findOne({ user: playlist.user, song: songId })){
                    const like = new Like({ user: playlist.user, song: songId });
                    await like.save();
                }
            }
        }

        playlist = await Playlist.findById(playlist._id)
            .populate('user')
            .populate({
                path: 'song',
                populate: [
                    { path: 'artists' },
                    { path: 'albums' },
                    { path: 'genres' }
                ]
            });

        res.status(200).send({ playlist });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.removePlaylist = async (req, res) => {
    try {
        const { songId, playlistId } = req.body;

        let playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { song: songId } },
            { new: true }
        );
        if(!playlist){
            throw new Error("Playlist not found!");
        }

        if(playlist.name === 'Liked Songs'){
            await Like.deleteOne({ user: playlist.user, song: songId });
        }

        playlist = await Playlist.findById(playlist._id)
            .populate('user')
            .populate({
                path: 'song',
                populate: [
                    { path: 'artists' },
                    { path: 'albums' },
                    { path: 'genres' }
                ]
            });

        res.status(200).send({ playlist });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getPlaylists = async (req, res) => {
    try {
        let playlists = await Playlist.find({ user: req.user._id })
            .populate('user')
            .populate({
                path: 'song',
                populate: [
                    { path: 'artists' },
                    { path: 'albums' },
                    { path: 'genres' }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        if (req?.body?.songId) {
            for (let i = 0; i < playlists.length; i++) {
                const containsSong = playlists[i]?.song
                    ? playlists[i].song.some(song => song._id.toString() === req.body.songId)
                    : false;
                playlists[i] = { ...playlists[i], containsSong };
            }
        }

        for (let i = 0; i < playlists.length; i++) {
            const user = playlists[i].user._id;
            const songsWithLikes = [];

            for (let j = 0; j < playlists[i].song.length; j++) {
                const song = playlists[i].song[j];
                const liked = await Like.findOne({ user, song: song._id }) ? true : false;
                songsWithLikes.push({ ...song, liked });
            }

            playlists[i] = { ...playlists[i], song: songsWithLikes };
        }

        res.status(200).send({ playlists });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updatePlaylist = async (req, res) => {
    try {
        const { songId, playlistIds } = req.body;

        const allPlaylists = await Playlist.find();

        for (const playlist of allPlaylists) {
            if (playlistIds.includes(playlist._id.toString())) {
                if (!playlist.song.includes(songId)) {
                    playlist.song.push(songId);
                    if (playlist.name === 'Liked Songs') {
                        const like = new Like({ user: playlist.user, song: songId });
                        await like.save();}
                }
            } else {
                const songIndex = playlist.song.indexOf(songId);
                if (songIndex > -1) {
                    playlist.song.splice(songIndex, 1);
                    if (playlist.name === 'Liked Songs') {
                        await Like.deleteOne({ user: playlist.user, song: songId });
                    }
                }
            }
            await playlist.save();
        }

        res.status(200).send({ message: 'Playlists updated successfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getLyrics = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            throw new Error('Song not found');
        }
        const lyricsPath = path.join(__dirname, "../", song.lyrics);
        const lyricsContent = await fs.readFile(lyricsPath, 'utf-8');
        res.send({ lyrics: lyricsContent });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}