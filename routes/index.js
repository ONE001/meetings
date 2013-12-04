var User = require('models/user').User,
	HttpError = require('error').HttpError,
	AuthError = require('models/user').AuthError;


module.exports = function(app) {
	app.use(function(req, res, next) {
		if (!req.session.user) {
			if (req.method === "GET") {
				res.sendfile('views/login.html');
			} else if (req.method === "POST") {
				User.authorize(req.body.login, req.body.password, function(err, user) {
					if (err) {
						if (err instanceof AuthError) 
							return next(new HttpError(403, err.message));
						else 
							return next(err);
					}

					user.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					user.save(function() {
						req.session.user = user._id;
						next();
					});
				});
			}
		} else {
			next();
		}
	});

	app.use(function(req, res, next) {
		res.sendfile('views/index.html');
	});
};


/*function(err, user) {
		if (err) return callback(err);
		req.session.user = user._id;
		req.send({});
	}*/