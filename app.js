var express = require('express'),
    path = require('path'),
    app = express(),
    server = require('http').createServer(app),
    config = require('config'),
    HttpError = require('error').HttpError
;

server.listen(config.get('port'), function() {
    console.log('Express server listening on port ' + config.get('port'));
});

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.favicon());

if (app.get('env') == 'development')
    app.use(express.logger('dev'));
else
    app.use(express.logger('default'));

require('lib/mongoose');

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    store: require('lib/sessionStore'),
}));

app.use(require('middleware/loadUser'));

require('routes/index')(app);
app.set('io', require('socket/index')(server));

app.use(function(err, req, res, next) {
    if (app.get("env") === "development") {
	express.errorHandler()(err, req, res, next);
    } else {
	err = new HttpError(500);
	res.send(500);
    }
});
