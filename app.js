var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    config = require('config'),
    mongoose = require('lib/mongoose'),
    User = require('models/user').User,
    HttpError = require('error').HttpError
;

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.favicon());

if (app.get('env') == 'development')
    app.use(express.logger('dev'));
else
    app.use(express.logger('default'));

var MongoStore = require('connect-mongo')(express);

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    store: new MongoStore({mongoose_connection: mongoose.connection}),
}));

app.use(require('middleware/loadUser'));

require('routes/index')(app);

io.set('origins', 'localhost:*');
io.sockets.on('connection', function (socket) {
    require('routes/sockets')(socket);
});

server.listen(config.get('port'), function() {
    console.log('Express server listening on port ' + config.get('port'));
});

app.use(function(err, req, res, next) {
    if (app.get("env") === "development") {
	express.errorHandler()(err, req, res, next);
    } else {
	err = new HttpError(500);
	res.send(500);
    }
});
