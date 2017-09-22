/** This module defines the routes for pins using the store.js as db memory
 *
 * @author Al Brown
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/pins
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module.exports
// 3.) exports (which is module.exports)

// modules
var express = require('express');
var logger = require('debug')('we2:pins');
var codes = require('../restapi/http-codes');
var HttpError = require('../restapi/http-error.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/we2');
var pins = express.Router();
var pinMongoose = require('../models/pin');
var storeKey = 'pins';

// routes **************
pins.route('/')
    .get(function (req, res, next) {
        pinMongoose.find({}, function (err, pins) {
            if (err) {
                next(err);
                return;
            }
            res.locals.items = pins;
            res.locals.processed = true;
            logger("GET fetched items");
            next();
        })

    })
    .post(function (req, res, next) {
        var pin = new pinMongoose(req.body);
        pin.save(function (err) {
            if (err) {
                err.status = 400;
                err.message += ' in fields: '
                    + Object.getOwnPropertyNames(err.errors);
                return next(err);
            }
            res.locals.items = pin;
            res.status(codes.created);
            res.locals.processed = true;
            next();
        });


    })
    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    });

pins.route('/:id')
    .get(function (req, res, next) {
        var query = pinMongoose.findById(req.params._id);

        if(req.query.filter) {
            query.select(req.query.filter.split(','));
        }

        query.exec(function (err, item) {
            if (!err) {
                res.locals.items = item;

            } else {
                res.status(404);
                res.locals.items = {error: {message: 'Bad Request', code: 404}};
            }
            next();
        });
    })
    .put(function (req, res, next) {

        if (req.body.id === req.params._id) {
            pinMongoose.findById(req.params._id, function (err, item) {
                if (!err && item) {
                    var tmp = new pinMongoose(req.body);
                    item.title = tmp.title;
                    item.type = tmp.type;
                    item.src = tmp.src;
                    item.description = tmp.description;
                    item.views = tmp.views;
                    item.ranking = tmp.ranking;
                    item.save(function (err) {
                        if (!err) {
                            res.locals.items = item;
                        } else {
                            res.status(400);
                            res.locals.items = {error: {message: 'Bad Request', code: 400}};
                        }
                        next();
                    });
                } else {
                    res.status(404);
                    res.locals.items = {error: {message: 'Bad Request', code: 404}};
                    next();
                }
            });
        } else {
            res.status(400);
            res.locals.items = {error: {message: 'Bad Request', code: 400}};
            next();
        }
    })
    .delete(function (req, res, next) {

        pinMongoose.findByIdAndRemove(req.params._id, function (err, item) {
            if (!err) {
                res.status(204);
                res.locals.items = item;
            } else {
                res.status(404);
                res.locals.items = {"error": {"code": 404, "message": "Bad Request"}};
            }
            next();
        });

    })
    .patch(function (req, res, next) {
        if (!req.body.id || req.body.id === req.params._id) {
            pinMongoose.findByIdAndUpdate(req.params._id, { $set: req.body, $inc: { __v: 1 } }, {new: true, runValidators: true }, function (err, item) {
                if (!err) {
                    res.status(200);
                    res.locals.items = item;
                } else {
                    res.status(400);
                    res.locals.items = {error: {message: 'Bad Request', code: 400}};
                }
                next();
            });
        } else {
            res.status(400);
            res.locals.items = {error: {message: 'Bad Request', code: 400}};
            res.locals.items
            next();
        }

    })

    .all(function (req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    });

/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON)
 * or, if nothing left, will send a 204.
 */
pins.use(function (req, res, next) {
    if (res.locals.items) {
        res.json(res.locals.items);
        delete res.locals.items;
    } else if (res.locals.processed) {
        res.set('Content-Type', 'application/json'); // not really necessary if "no content"
        if (res.get('Status-Code') == undefined) { // maybe other code has set a better status code before
            res.status(204); // no content;
        }
        res.end();
    } else {
        next(); // will result in a 404 from app.js
    }
});

module.exports = pins;
