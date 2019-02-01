const express = require('express');
const app = express();
const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
const cors = require('cors');




let port = process.env.PORT || 3000;


mongoose.connect('mongodb://admin22:admin22@ds111422.mlab.com:11422/pharmacies',{useNewUrlParser: true}, (err) => {
    if(err)
        console.log(err);
    else console.log('connected to db...');

});


//app.use(bodyParser.text());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers: token");
    next();
});


app.use(express.json());

app.use(function (req, res, next) {
    console.log(req.body);
    next()
});



app.get('/pharmacies', (req, res) => {
    PharmacyModel.find({}, function (err, pharmacies) {
        if (err) {
            res.json({"err": err});
        } else {
            res.json({pharmacies});
        }
    })
});



app.post('/pharmacies', (req, res) => {

    console.log(req.body);

        let pharmacy = new PharmacyModel({
            name: req.body.name,
            longitude: req.body.long,
            latitude: req.body.lat,
            registered: false
        });

        pharmacy.save().then(result => {
            res.send(result);
        }).catch(err => {
            res.send(err);
        });

    });



app.post('/pharmacies/edit', (req, res) => {

    PharmacyModel.updateOne({ _id: req.body.id }, { registered: req.body.registered, name: req.body.name }, function(result, err){
        if(err) {
            console.log(err);
            res.json({"err": err})
        }
        else {
            console.log(result);
            res.json({result});
        }
    });


});




var SchemaTypes = mongoose.Schema.Types;

const pharmacySchema = mongoose.Schema({

    name: String,
    longitude: SchemaTypes.Double,
    latitude: SchemaTypes.Double,
    registered: Boolean

});

let PharmacyModel = mongoose.model('Pharmacy', pharmacySchema);



app.listen(port);