const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
const port = process.env.port || 8100;
const dbURL = "mongodb://localhost:27017/zappaShows";
var ZappaShow = require("./models/zappaShow.js");

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static("public"));

app.get("/", (req,res) => {
    ZappaShow.find().then(foundShows => {
        foundShows.map( e => e.formattedDate = e.date.toLocaleDateString());
        res.render("index", {shows: foundShows});         
    });
});

app.get("/addShow", (req,res) => {
    res.render("addShow", {}); 
});

app.post("/addShow", (req,res) => {
    let lineupToArray = req.body.lineup.split("\r\n");
    let setListToArray = req.body.setlist.split("\r\n");
    let newZappaShow = new ZappaShow();
    newZappaShow.date = req.body.date;
    newZappaShow.lineup = lineupToArray;
    newZappaShow.location.venue = req.body.venue;
    newZappaShow.location.country = req.body.country;
    newZappaShow.location.state_province = req.body.state;
    newZappaShow.location.city = req.body.city;
    newZappaShow.setlist = setListToArray;
    newZappaShow.time = req.body.time;

    newZappaShow.save().then(savedShow => {
        res.redirect("/");
    }).catch(err=>console.log(err)); 
});

app.get("/edit/:id", (req, res) => {
    ZappaShow.findById(req.params.id, (err, result) => {
        if(result != undefined){
            var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            result.formattedDate = result.date.toISOString().slice(0,10);
            result.lineup = result.lineup.join("\n");
            result.setlist = result.setlist.join('\n');

            switch(result.time){
            case "early":
                result.early=true;
                break;
            case "late":
                result.late=true;
                break;
            case "only":
                result.only=true;
                break;
            }
        }
        return res.render("editShow", result);
    });
});

app.post("/editShow/:id", (req,res)=>{
    let lineupToArray = req.body.lineup.split("\r\n");
    let setListToArray = req.body.setlist.split("\r\n");
    ZappaShow.findById(req.params.id).then(foundShow => {
        foundShow.date = req.body.date;
        foundShow.lineup = lineupToArray;
        foundShow.location.venue = req.body.venue;
        foundShow.location.country = req.body.country;
        foundShow.location.state_province = req.body.state;
        foundShow.location.city = req.body.city;
        foundShow.setlist = setListToArray;
        foundShow.time = req.body.time;
        foundShow.save().then(savedShow => {
            res.redirect("/");
        });
    });
});



app.post("/delete/:id", (req,res) => {
    ZappaShow.findByIdAndRemove(req.params.id).then(removedDoc => {
        res.redirect("/");
    }).catch(err=>console.log(err));
});


mongoose.connect(dbURL, { useMongoClient: true })
    .then( () =>{
        console.log("Sucessfully connected to Mongodb");
    })
    .catch(err => {
        console.log("Error: ", err);
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

