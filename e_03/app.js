/** Main app for server to start a small REST API for tweets
 * The included ./blackbox/store.js gives you access to a "database" which contains
 * already tweets with id 101 and 102, as well as users with id 103 and 104.
 * On each restart the db will be reset (it is only in memory).
 * Best start with GET http://localhost:3000/tweets to see the JSON for it
 *
 * @author Al Brown
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";  // tell node.js to be more "strict" in JavaScript parsing (e.g. not allow variables without var before)

// node module imports
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

// our own modules imports
var store = require('./blackbox/store.js');

// creating the server application
var app = express();

// Middleware ************************************
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// logging
app.use(function (req, res, next) {
    console.log('Request of type ' + req.method + ' to URL ' + req.originalUrl);
    next();
});

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
app.use(function (req, res, next) {
    // expect the Accept-Version header to be NOT set or being 1.0
    var versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
    } else {
        next(); // all OK, call next handler
    }
});

// request type application/json check
app.use(function (req, res, next) {
    if (['POST', 'PUT'].indexOf(req.method) > -1 &&
        !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        res.status(415).send('wrong Content-Type');  // user has SEND the wrong type
    } else if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        // user has REQUESTED the wrong type
        res.status(406).send('response of application/json only supported, please accept this');
    }
    else {
        next(); // let this request pass through as it is OK
    }
});


// Routes ***************************************


// host
var host = 3000;
//

function getRetweets() {
    var tweetlist = store.select('tweets');
    var retweetlist = store.select('retweets');

    for (var i = 0; i < tweetlist.length; i++) {

        for (var a = 0; a < retweetlist.length; a++) {

            if (tweetlist[i].id == retweetlist[a].rel)
                return tweetlist[i].retweets = "http://localhost:3000/retweets/" + retweetlist[a].id;


        }
    }
}

app.get('/tweets', function (req, res, next) {
    var tweetList = store.select('tweets');

    for (var i = 0; i < tweetList.length; i++) {

        tweetList[i].href = "http://localhost:" + host + "/tweets/" + tweetList[i].id;
    }
    var retweetlist = store.select('retweets');
    if (retweetlist !== undefined) {
        for (var i = 0; i < tweetList.length; i++) {

            for (var a = 0; a < retweetlist.length; a++) {

                if (tweetList[i].id == retweetlist[a].rel)
                    tweetList[i].retweet = store.select('retweets');


            }
        }
    }

    res.json(tweetList);
});

app.post('/tweets', function (req, res, next) {
    var id = req.body;
    var data = store.insert('tweets', id);

    // set code 201 "created" and send the item back
    res.status(201).json(store.select('tweets', data));
});


app.get('/tweets/:id', function (req, res, next) {
    var tweet = store.select('tweets', req.params.id);
    var retweet = store.select('retweets');
    tweet.href = "http://localhost:" + host + "/tweets/" + tweet.id;

    var retweetlist = store.select('retweets');
    for (var a = 0; a < retweetlist.length; a++) {

        if (tweet.id == retweetlist[a].rel)
            tweet.retweets = retweet;

        //"http://localhost:3000/retweets/" + retweetlist[a].id;


    }
    res.json(tweet);
});

app.delete('/tweets/:id', function (req, res, next) {
    store.remove('tweets', req.params.id);
    res.status(200).end();
});

app.put('/tweets/:id', function (req, res, next) {
    store.replace('tweets', req.params.id, req.body);
    res.status(200).end();

});


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
// Resource Collection "Retweets"

app.get('/retweets', function (req, res, next) {

    var retweetList = store.select('retweets');

    for (var i = 0; i < retweetList.length; i++) {

        retweetList[i].href = "http://localhost:" + host + "/retweets/" + retweetList[i].id;
    }
    res.json(retweetList);
});

app.post('/retweets', function (req, res, next) {
    var id = req.body;
    var data = store.insert('retweets', id);

    // set code 201 "created" and send the item back
    res.status(201).json(store.select('retweets', data));
});

app.get('/retweets/:id', function (req, res, next) {

    var retweet = store.select('retweets', req.params.id);
    retweet.href = "http://localhost:" + host + "/tweets/" + retweet.id;

    res.json(retweet);

});

app.delete('/retweets/:id', function (req, res, next) {
    store.remove('retweets', req.params.id);
    res.status(200).end();
});

app.put('/retweets/:id', function (req, res, next) {
        store.replace('retweets', req.params.id, req.body);
        res.status(200);
        res.json(store.select('retweets', req.params.id));
    }
)
;


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

// TODO: add your routes, error handling etc.


// CatchAll for the other requests (unfound routes/resources) ********

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers (express recognizes it by 4 parameters!)

// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log('Internal Error: ', err.stack);
        res.status(err.status || 500);
        res.json({
            error: {
                message: err.message,
                error: err.stack
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            error: {}
        }
    });
});


// Start server ****************************
app.listen(3000, function (err) {
    if (err !== undefined) {
        console.log('Error on startup, ', err);
    }
    else {
        console.log('Listening on port 3000');
    }
});