const { Router } = require("express");
const { auth } = require("../middleware/auth");
const { 
    getAlbums, getArtists, getGenres,
    editAlbum, editArtist, editGenre,
    deleteAlbum, deleteArtist, deleteGenre,
    addAlbum, addArtist, addGenre
} = require("../controllers/dataController");



const dataRouter = Router();



/* Data */
dataRouter.post("/getalbums", auth, getAlbums);
dataRouter.post("/getartists", auth, getArtists);
dataRouter.post("/getgenres", auth, getGenres);

dataRouter.post("/editalbum/:id", auth, editAlbum);
dataRouter.post("/editartist/:id", auth, editArtist);
dataRouter.post("/editgenre/:id", auth, editGenre);

dataRouter.delete("/deletealbum/:id", auth, deleteAlbum);
dataRouter.delete("/deleteartist/:id", auth, deleteArtist);
dataRouter.delete("/deletegenre/:id", auth, deleteGenre);

dataRouter.post("/addalbum", auth, addAlbum);
dataRouter.post("/addartist", auth, addArtist);
dataRouter.post("/addgenre", auth, addGenre);



module.exports = dataRouter;