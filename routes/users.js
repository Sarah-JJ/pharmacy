const express = require('express');
const router = express.Router();
// const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const checkAuth = require('../middleware/checkAuth');
const User = require('../models/user');


router.get('/', checkAuth, (req, res) => {
    console.log(req.deviceId);
    User.findOne({_id: req.userId, deviceId: req.deviceId}).then(result => {
        if (!result) {
            res.status(404).send('There is no such user');
        }
        res.send(result);
    }).catch(err => {
        res.status(400).send(err.message)
    });
});

router.post('/add', (req, res) => {

    let user = req.body;

    console.log(user);

    // let validationResult = validateUser(user);

    // if (validationResult.error) {
    //     console.log(validationResult.error.details[0].message);
    //     res.status(400).json({"message": validationResult.error.details[0].message});
    // } else {

    bcrypt.hash(user.password, 10, function (err, hash) {

        console.log(`${hash} , ${req.body.username}`);

        let user = new User({
            username: req.body.username,
            password: hash,
        });

        user.save().then(data => {
            console.log(data);
            res.json({"message": "user added successfully"}); //successful registration
        }).catch(err => {
            console.log(err);
            res.json({"err": err});
        });

    });
    // }

});

// adding a user
router.post('/register', (req, res) => {

    let user = req.body;

    User.findOne({username: req.body.username})
        .then(data => {

            if (data.deviceId)
                res.json({"err": "you have registered before"})
            else {

                bcrypt.compare(req.body.password, data.password, function (err, response) {
                    if (response) {

                        User.updateOne({username: user.username}, {$set: {deviceId: user.deviceId}}).then(data => {

                            let token = jwt.sign({_id: data._id, deviceId: data.deviceId}, 'key');
                            res.json({"token": token, "message": "registration successful", "_id": data._id});

                        }).catch(err => {
                            res.status(400).json({"err": err});
                        });

                    } else {
                        res.status(400).json({"err": err});
                    }
                });
            }
        }).catch(err => {
        console.log(err);
        res.status(400).json({"err": err});
    });
    // let validationResult = validateUser(user);
    //
    // if (validationResult.error) {
    //     console.log(validationResult.error.details[0].message);
    //     res.status(400).json({"message": validationResult.error.details[0].message});
    // } else {


//    }

});


router.post('/login', (req, res) => {

    // let validationResult = validateUser(req.body);
    //
    // if (validationResult.error) {
    //     console.log(validationResult.error.details[0].message);
    //     res.status(400).json({"message": "validation_error"});
    // } else {
    User.findOne({username: req.body.username, deviceId: req.body.deviceId})
        .then(data => {

            bcrypt.compare(req.body.password, data.password, function (err, response) {
                if (response) {
                    let token = jwt.sign({_id: data._id, deviceId: data.deviceId}, 'key');
                    res.json({"token": token, "message": "user logged in", "_id": data._id});
                } else {
                    res.status(400).json({"err": err});
                }
            });

        }).catch(err => {
        console.log(err);
        res.status(400).json({"err": err});
    });
    // }
});


// updating a user
//
// router.put('/:id', checkAuth, (req, res) => {
//
//     let user = req.body;
//
//     let validationResult = validateUser(user);
//
//     if (validationResult.error) {
//         console.log(validationResult.error);
//         res.status(400).send(validationResult.error.details[0].message);
//     } else {
//
//         bcrypt.hash(user.password, 10, function (err, hash) {
//             User.updateOne({_id: req.params.id}, {$set: {email: user.email, password: hash}})
//                 .then(data => {
//                     res.send('Changes saved');
//                 }).catch(err => {
//                 res.status(400).send(err);
//             });
//         });
//     }
//
// });


// deleting a user
router.delete('/:id', checkAuth, (req, res) => {
    User.remove({_id: req.params.id}).then(result => {
        res.send('The user has been deleted successfully');
    }).catch(err => {
        res.status(400).send(err);
    });
});


// function validateUser(user) {
//
//     const userSchema = {
//          'email': Joi.string().email({minDomainAtoms: 2}).required(),
//         'password': Joi.string().min(6).required()
//
//         // password 6 chars long, and must contain at least one numberic character
//         // .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
//     };
//
//     return Joi.validate(user, userSchema);
// }


module.exports = router;