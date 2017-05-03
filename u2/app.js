/**
 *app.js represents static data, time and text files and print "Hello World!"
 *
 *
 *
 *@author Michael Peters , Ishau Kevin
 */

"use strict";
var express = require('express');
var path = require('path');
var app = express();
var date = new Date();
var fs = require('fs');

// static data
app.use('/staticfiles', express.static(path.join(__dirname, 'public')));

// time
app.get("/time", function (req, res) {
    res.type("text/plain");
    res.send(date);
});

// Hello World
app.get('/', function (req, res) {

    res.send('<!DOCTYPE html>' + '<html lang="en">' +
        '<head><meta charset="utf-8"></head>' + '<body><h1>Hello World!</h1></body>' + '</html>');
});

//text async
var text = app.get("/text", function (req, res) {

    var hrstart = process.hrtime();
    res.type("text/plain");

//filereader
    fileReader(rname + '/files/text.txt', function (data) {
        if(data === undefined){
            res.statusCode = 23;
            data = "Error 23!";
        }


        var hrend = process.hrtime(hrstart);

        res.send(data.toString()+"\n"+"time (ns): " + hrend[1]);


    });


});

/**
 * Memorize pattern
 *
 * @param f
 * @returns Function
 */
function memoizeFile(f) {
    //object to store data
    var memoize = {};

    //option 1 : file not processed yet --> read it and store it to the variable memoize
    //option 2 : read the data from memoize
    return function (key, callback) {
        if (memoize[key] === undefined) {
            f(key, function (data) {
                if (data) {
                    memoize[key] = data;
                }
                callback(memoize[key]);
            });
        } else {
            callback(memoize[key]);
        }
    };
}
;

/**
 *
 * @type {Function}
 */
var fileReader = memoizeFile(function (path, callback) {
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            callback(null);
            return console.log(err);
        }
        callback(data);
    });
});

// Start Server
var server = app.listen(3000, function () {

    console.log("Server's on fire");
});

