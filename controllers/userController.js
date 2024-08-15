const bcrypt = require('bcryptjs');
const axios = require('axios');
const fs = require('fs');
const stripe = require('stripe')("sk_test_51Pkzz9RoFTuRWEmAnjTn6cEsVSkpJIXRhoY1lJmCeGHndwj9ErgrFY83ZrWgoWn6TBnu0nTkwYpUwtHqIxJR1UkR00RKAk8wOJ");
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Genre = require('../models/Genre');
const Like = require('../models/Like');
const path = require('path');
const logoPath = path.join(__dirname, '../photo/logo.png');



exports.userSignup= async (req,res) => {
    
    try{

        let user = await User.findOne({email: req.body.email})
        if(user){
            throw new Error("User with this email already exist. Please use different one !!")
        }

        if(req.body.userType!=="admin"){
            const trialPeriodDays = 2;
            req.body.trialExpiresAt = new Date(Date.now() + trialPeriodDays * 24 * 60 * 60 * 1000);
        }

        user = new User(req.body)
        await user.save()

        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.userLogin= async (req,res) => {

    try{

        const user = await User.findOne({email: req.body.email})
        if(!user){
            throw new Error('There is no account with given email address. Please register first to login !')
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if(!isMatch){
            throw new Error("The entered password is incorrect")
        }

        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    }catch(error){
        res.send({error: error.message})
    }

}

exports.userLogout = async(req, res) =>{

    try{

        const user = await User.findById(req.user._id);
        if(!user){
            throw new Error('There is no account with given email address. Please register first to login !')
        }

        await User.findByIdAndUpdate(req.user._id,{token: null})
        res.status(200).send()

    }catch(error){
        res.send({error: error.message})
    }

}

exports.getUserList = async (req,res) => {
    
    try{

        if(req.user.userType!=="admin"){
            throw new Error("Access Forbidden...!!!")
        }

        let users = await User.find({userType: "user"})
        if(users.length===0){
            throw new Error("No users exists")
        }

        res.status(201).send({users})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.editUser = async (req,res) => {
    
    try{

        if(req.user.userType!=="admin"){
            throw new Error("Access Forbidden...!!!")
        }

        let user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if(!user){
            throw new Error("No user exists")
        }
        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.deleteUser = async (req,res) => {
    
    try{

        if(req.user.userType!=="admin"){
            throw new Error("Access Forbidden...!!!")
        }

        let user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            throw new Error("No user exists")
        }
        
        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.cardDetails = async (req,res) => {
    
    try{

        if(req.user.userType!=="admin"){
            throw new Error("Access Forbidden...!!!")
        }

        let noOfUsers = await User.find({userType: 'user'}).count();
        let noOfSongs = await Song.find({}).count();
        let noOfArtists = await Artist.find({isDeleted: false}).count();
        let noOfGeneres = await Genre.find({isDeleted: false}).count();
        
        res.status(201).send({
            noOfUsers,
            noOfSongs,
            noOfArtists,
            noOfGeneres
        })

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.graphData= async (req,res) => {
    
    try{

        const likes = await Like.aggregate([
            {
              $group: {
                _id: "$song",
                likeCount: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "songs",
                localField: "_id",
                foreignField: "_id",
                as: "song"
              }
            },
            {
              $unwind: "$song"
            },
            {
              $project: {
                _id: 0,
                songTitle: "$song.title",
                likeCount: 1
              }
            },
            {
                $sort: {likeCount: -1}
            },
            {
                $limit: 5
            }
        ]);
      
        const formattedData = [["Song", "Like"], ...likes.map(like => [like.songTitle, like.likeCount])];

        res.status(201).send({data: formattedData})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.getUser = async (req,res) => {
    
    try{

        const user = await User.findById(req.user._id);
        if(!user){
            throw new Error("No user exists")
        }
        
        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.editProfilePic = async (req,res) => {
    
    try{

        let user = await User.findById(req.user._id);
        if(!user){
            throw new Error("No user exists")   
        }

        if(req?.file?.profilePic && user.profilePic!="/photo/Default_Profile_Image.png"){
            if (fs.existsSync(user.profilePic)) {
                fs.unlinkSync(user.profilePic);
            }
        }
        
        user = await User.findByIdAndUpdate(req.user._id, {profilePic: req.file.path.replace("photo\\","/photo/")}, {new: true});

        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.editProfile = async (req,res) => {
    
    try{

        let user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true})
        if(!user){
            throw new Error("No user exists")
        }

        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.removeProfilePic = async (req,res) => {
    
    try{

        let user = await User.findById(req.user._id);
        if(!user){
            throw new Error("No user exists")   
        }

        if(req?.file?.profilePic){
            if (fs.existsSync(user.profilePic)) {
                fs.unlinkSync(user.profilePic);
            }
        }
        
        user = await User.findByIdAndUpdate(req.user._id, {profilePic: "/photo/Default_Profile_Image.png"}, {new: true});

        res.status(201).send({user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

exports.forgotPassword = async (req,res) => {
    try{

        let user = await User.findOne({email: req.body.email});
        if(!user){
            throw new Error("No user exists")   
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if(isMatch){
            throw new Error("Old password & Current password can't be same")
        }
        user = await User.findByIdAndUpdate(user._id, {password: await bcrypt.hash(req.body.password, 8)}, {new: true});

        res.status(200).send({user})

    }catch(error){
        res.send({error: error.message})
    }           
}

exports.checkPro= async (req, res) => {
    
    try{

        if(req.user.userType!=="admin"){
            if(!req.user.isProUser){
                throw new Error("Trial expired...!!!")
            }else if(req.user.trialExpiresAt && req.user.trialExpiresAt < new Date()){
                throw new Error("Trial expired...!!!")
            }
        }
        
        res.status(201).send({user: req.user})

    }catch(error){
        res.send({error: error.message})
    }
    
}

// Setup email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'parthjpatel2106@gmail.com',
    pass: 'ekbi nwae evvk yvbs',
  },
});

// Function to fetch image buffer from URL using axios
const getImageBuffer = async (url) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
};

// Generate invoice as a PDF buffer with logo
const generateInvoice = async (billingDetails, amount) => {
  const doc = new PDFDocument();
  let buffer = [];

  doc.on('data', (chunk) => buffer.push(chunk));
  doc.on('end', () => {
    buffer = Buffer.concat(buffer);
  });
  console.log("logoPath", logoPath);

  // Fetch logo image from URL
  const logoUrl = 'http://localhost:5000/photo/logo.png';
  const logoBuffer = await getImageBuffer(logoUrl);

  // Add logo image
  doc.image(logoBuffer, {
    fit: [150, 150],
    align: 'center',
    valign: 'top'
  });

  doc.moveDown(5);

  // Add a title
  doc.fontSize(16).text('Invoice', { align: 'center' });

  // Add billing details
  doc.fontSize(12).moveDown(3);
  doc.text(`Name: ${billingDetails.name}`);
  doc.text(`Email: ${billingDetails.email}`);
  doc.text(`Postal Code: ${billingDetails.address.postal_code}`);
  doc.text(`Amount: $${(amount / 100).toFixed(2)} CAD`);

  doc.moveDown(5);
  doc.text('Thank you for your purchase!');

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(buffer));
  });
};

// Send email with the invoice
const sendEmailWithInvoice = async (to, invoiceBuffer) => {
  const mailOptions = {
    from: 'parthjpatel2106@gmail.com',
    to: to,
    subject: 'Grooviex - Your Invoice',
    text: 'Please find the attached invoice.',
    attachments: [
      {
        filename: 'Invoice.pdf',
        content: invoiceBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

exports.createPaymentIntent = async (req, res) => {
    try{
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'cad',
            payment_method_types: ['card'],
        });
        console.log("paymentIntent", paymentIntent);
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    }catch(error){
        res.send({error: error.message})
    }
}


exports.confirmPayment = async (req, res) => {
    try{

        const { amount, billingDetails } = req.body;

        const user = await User.findByIdAndUpdate(req.user._id, {isProUser: true, trialExpiresAt: null}, {new: true});
        if(!user){
            throw new Error("No user exists")
        }

        const invoiceBuffer = await generateInvoice(billingDetails, amount);
        await sendEmailWithInvoice(req.user.email, invoiceBuffer);

        res.status(201).send({user})
    }catch(error){
        res.send({error: error.message})
    }
}