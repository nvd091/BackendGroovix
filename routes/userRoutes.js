const { Router } = require("express");
const { auth } = require("../middleware/auth");
const { 
    userSignup, userLogin, userLogout, forgotPassword,
    getUserList, editUser, deleteUser, getUser, 
    editProfile, editProfilePic, removeProfilePic,
    cardDetails, graphData, 
    checkPro, createPaymentIntent, confirmPayment
} = require("../controllers/userController");
const { upload } = require("../utils/multer");



const userRouter = Router();


/* Auth */
userRouter.post("/signup", userSignup)
userRouter.post("/login", userLogin)
userRouter.get("/logout", auth, userLogout)
userRouter.post("/forgotpassword", forgotPassword)

/* User */
userRouter.post("/getuserlist", auth, getUserList);
userRouter.post("/edituser/:id", auth, editUser);
userRouter.get("/deleteuser/:id", auth, deleteUser);
userRouter.get("/getuser", auth, getUser);
userRouter.post("/editprofile", auth, editProfile);
userRouter.post("/editprofilepic", auth, upload.single('profilePic'), editProfilePic);
userRouter.delete("/removeprofilepic", auth, removeProfilePic);

/* Dashboard */
userRouter.get("/carddetails", auth, cardDetails);
userRouter.post("/getgraphdata", auth, graphData);

/* Pro */
userRouter.get("/checkpro", auth, checkPro);
userRouter.post("/create-payment-intent", createPaymentIntent);
userRouter.post("/confirm-payment", auth, confirmPayment);


module.exports = userRouter;