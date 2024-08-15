const express = require("express")
const cors = require("cors")
const path = require("path")
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const userRouter = require('./routes/userRoutes');
const songRouter = require('./routes/songRoutes');
const dataRouter = require('./routes/dataRoutes');


const mongoDB = "mongodb+srv://parthjpatel:parth2106@cluster0.9sisgbx.mongodb.net/grooveix"
try {
    mongoose.connect(mongoDB)
    console.log("Mongo DB Connected...!!!")
} catch (e) {
    console.log("Error In Connection: ", e)
}


const app = express()

app.use('/photo', express.static(path.join(__dirname, '/photo')))
app.use('/audio', express.static(path.join(__dirname, '/audio')))
app.use('/lyrics', express.static(path.join(__dirname, '/lyrics')))
app.use('/other', express.static(path.join(__dirname, '/other')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(express.static('public'))
app.use(cors());


app.get("/", (req, res)=>{
    res.send('Grooveix Server')
})
app.use(userRouter);
app.use(songRouter);
app.use(dataRouter);


app.listen(5000, () => {
    console.log("Application is running on http://localhost:5000");
})
