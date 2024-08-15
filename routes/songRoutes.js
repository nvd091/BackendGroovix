const { Router } = require("express");
const { auth } = require("../middleware/auth");
const { isPro } = require("../middleware/isPro");
const { upload } = require("../utils/multer");
const {
    addSong, updateSong, deleteSong, getSong, 
    getSongFile, getCoverImage, getSongList, getLyrics,
    addLike, removeLike,
    addComment, getComments,
    addPlaylist, removePlaylist, createPlaylist, deletePlaylist, getPlaylists, updatePlaylist
} = require("../controllers/songController");



const songRouter = Router();


/* Song */
songRouter.post("/addsong", auth, isPro, upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'lyrics', maxCount: 1 }
]), addSong);
songRouter.post("/updatesong/:id", auth, upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'lyrics', maxCount: 1 }
]), updateSong);
songRouter.get("/song/:id", auth, getSong);
songRouter.delete("/deletesong/:id", auth, deleteSong);
songRouter.get("/getsongfile/:id", auth, getSongFile);
songRouter.get("/getcoverimage/:id", auth, getCoverImage);
songRouter.get("/getlyrics/:id", auth, getLyrics);
songRouter.post("/getsonglist", auth, getSongList);

/* Features */
songRouter.post("/addlike", auth, addLike);
songRouter.post("/removelike", auth, removeLike);

songRouter.post("/addcomment", auth, addComment);
songRouter.get("/getcomments/:id", auth, getComments);

songRouter.post("/createplaylist", auth, createPlaylist);
songRouter.delete("/deleteplaylist/:id", auth, deletePlaylist);
songRouter.post("/addplaylist", auth, addPlaylist);
songRouter.post("/removeplaylist", auth, removePlaylist);
songRouter.post("/getplaylists", auth, getPlaylists);
songRouter.post("/updateplaylist", auth, updatePlaylist);


module.exports = songRouter;