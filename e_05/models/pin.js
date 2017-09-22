/**
 * @author Al Brown
 */


"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var types = ['image', 'video', 'website'];

var pinScheme = new Schema({
    title: {type: String, required: true, default: ''},
    type: {type: String, required: true, enum: types},
    src: {type: String, default: 0},
    description: {type: String, default: ''},
    views: {type: Number, default: 0, min: 0},
    ranking: {type: Number, default: 0, min: 0}
}, {
    timestamps: {createdAt: 'timestamp'}
});


module.exports = mongoose.model('Pin', pinScheme);
