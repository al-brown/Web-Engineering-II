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
var store = require('../blackbox/store');
var codes = require('../restapi/http-codes'); // if you like, you can use this for status codes, e.g. res.status(codes.success);
var _pin = require('../model/pin');
var filter = require('../filter/filter');
var HttpError = require('../restapi/http-error.js');

var pins = express.Router();

const storeKey = 'pins';


var requiredKeys = {title: 'string', type: ['image', 'video', 'website'], src: 'string'};
var optionalKeys = {description: 'string', views: 'number', ranking: 'number'};
var internalKeys = {id: 'number', timestamp: 'number'};
var keys = {title: 'string', src: 'string', length: 'number', description: 'string', views: 'number',
    ranking: 'number', limit: 'number', offset: 'number', filter: 'string';

pins.use(filter.validateQuery(allKeys));


/* GET all pins */
pins.route('/')
    .get(function(req, res, next) {
        res.locals.items = store.select('pins');
        res.locals.processed = true;
        logger("GET fetched store items");
        next();
    })
    .post(function(req,res,next) {
        var err = new HttpError('Unimplemented method!', codes.servererror);
        next(err);
        var pin = _pin(req.body);
        if (pin.err) {
            res.status(parseInt(pin.err.error.code)).json(pin.err).end();
        } else {
            pin.id = store.insert('pins', pin);
            res.status(201).json(pin).end();
        }

        })
    .all(function(req, res, next) {
        if (res.locals.processed) {
            next();
        } else {
            // reply with wrong method code 405
            var err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    })

    .delete(function (req, res, next) {
        res.status(405).json({"error": {"code": 405, "message": "Not supported"}}).end();
    });


pins.route('/:id')
    .get(function (req, res, next) {
        var data = filter.queryFilter(store.select('pins', req.params.id), req.query, filter.queryFilter());
        //var data = store.select('pins', req.params.id);
        if (!data ) {
            res.json({}).status(404).end();
        } else if(data.error){
            res.status(data.error.code).json(data.error).end();
        }else {
            res.json(data).status(200).end();
            //next();
        }
    })
    .post(function (req, res) {
        res.status(405).json({"error": {"code": 405, "message": "Not supported"}}).end();
    })
    .put(function (req, res, next) {
        var pin = _pin(req.body);
        if (pin.err) {
            res.status(parseInt(pin.err.error.code)).json(pin.err).end();
        } else {
            store.replace('pins', req.params.id, pin);
            res.json(store.select('pins', req.params.id)).status(200).end();
            //next();
        }
    })
    .delete(function (req, res, next) {
        if (!store.select('pins', req.params.id)) {
            res.status(404).json({"error": {"code": 404, "message": "No Content"}}).end();
        } else {
            var data = store.remove('pins', req.params.id);
            res.set('Content-Type', 'application/json').status(204).end();
        }
        ;
    });





/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON) or, if nothing left, will send a 204.
 */
pins.use(function(req, res, next){
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
