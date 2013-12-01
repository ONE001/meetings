var express = require('express'),
	http = require('http'),
	path = require('path'),
	app = express(),
	config = require('config')
;

app.set('views', path.join(__dirname, 'views'));

app.use(express.favicon());

if (app.get('env') == 'development') {
	app.use(express.logger('dev'));
} else {
	app.use(express.logger('default'));	
}

app.use(express.cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.session());

http.createServer(app).listen(config.get('port'), function() {
  console.log('Express server listening on port ' + config.get('port'));
});

app.use(function(req, res, next) {
	res.sendfile('views/index.html');
});

app.use(function(err, req, res, next) {
	if (app.get("env") === "development") {
		var errorHandler = express.errorHandler();
		errorHandler(err, req, res, next);
	} else {
		res.send(500);
	}
});