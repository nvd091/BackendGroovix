const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Genre = require('../models/Genre');


exports.getArtists = async (req, res) => {
    try {
        let search = req.body.search || '';

        let artists;
        if (search) {
            artists = await Artist.aggregate([
                {
                    $match: { name: { $regex: search, $options: 'i' }, isDeleted: false }
                },
                {
                    $addFields: {
                        matchType: {
                            $cond: [
                                { $eq: ["$name", search] }, 0,
                                {
                                    $cond: [
                                        { $regexMatch: { input: "$name", regex: `^${search}`, options: 'i' } }, 1,
                                        2
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        matchType: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                }
            ]);
        } else {
            artists = await Artist.aggregate([
                {
                    $match: { isDeleted: false }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                },
                {
                    $sort: { name: 1 }
                }
            ]);
        }

        res.status(201).send({ data: artists });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.getAlbums = async (req, res) => {
    try {
        let search = req.body.search || '';

        let albums;
        if (search) {
            albums = await Album.aggregate([
                {
                    $match: { name: { $regex: search, $options: 'i' }, isDeleted: false }
                },
                {
                    $addFields: {
                        matchType: {
                            $cond: [
                                { $eq: ["$name", search] }, 0,
                                {
                                    $cond: [
                                        { $regexMatch: { input: "$name", regex: `^${search}`, options: 'i' } }, 1,
                                        2
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        matchType: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                }
            ]);
        } else {
            albums = await Album.aggregate([
                {
                    $match: { isDeleted: false }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                },
                {
                    $sort: { name: 1 }
                }
            ]);
        }

        res.status(201).send({ data: albums });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.getGenres = async (req, res) => {
    try {
        let search = req.body.search || '';

        let genres;
        if (search) {
            genres = await Genre.aggregate([
                {
                    $match: { name: { $regex: search, $options: 'i' }, isDeleted: false }
                },
                {
                    $addFields: {
                        matchType: {
                            $cond: [
                                { $eq: ["$name", search] }, 0,
                                {
                                    $cond: [
                                        { $regexMatch: { input: "$name", regex: `^${search}`, options: 'i' } }, 1,
                                        2
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        matchType: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                }
            ]);
        } else {
            genres = await Genre.aggregate([
                {
                    $match: { isDeleted: false }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        label: "$name"
                    }
                },
                {
                    $sort: { name: 1 }
                }
            ]);
        }

        res.status(201).send({ data: genres });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.editAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!album) {
            return res.status(404).send({ error: 'Album not found' });
        }

        res.status(201).send({ album });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.editArtist = async (req, res) => {
    try {   
        const artist = await Artist.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!artist) {
            return res.status(404).send({ error: 'Artist not found' });
        }

        res.status(201).send({ artist });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.editGenre = async (req, res) => {
    try {
        const genre = await Genre.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!genre) {
            return res.status(404).send({ error: 'Genre not found' });
        }

        res.status(201).send({ genre });
    
    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!album) {
            return res.status(404).send({ error: 'Album not found' });
        }

        res.status(201).send({ album });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.deleteArtist = async (req, res) => {
    try {
        const artist = await Artist.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!artist) {
            return res.status(404).send({ error: 'Artist not found' });
        }

        res.status(201).send({ artist });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.deleteGenre = async (req, res) => {
    try {
        const genre = await Genre.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!genre) {
            return res.status(404).send({ error: 'Genre not found' });
        }

        res.status(201).send({ genre });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.addAlbum = async (req, res) => {
    try {
        const album = new Album(req.body);
        await album.save();

        res.status(201).send({ album });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.addArtist = async (req, res) => {    
    try {
        const artist = new Artist(req.body);
        await artist.save();

        res.status(201).send({ artist });

    } catch (error) {
        res.send({ error: error.message });
    }
};

exports.addGenre = async (req, res) => {
    try {
        const genre = new Genre(req.body);
        await genre.save();

        res.status(201).send({ genre });

    } catch (error) {
        res.send({ error: error.message });
    }
};