var mongoose = require('mongoose'),
    express = require('express'),
    MongoStore = require('connect-mongo')(express),
    sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;
