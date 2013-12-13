var User = require('models/user').User,
    HttpError = require('error').HttpError,
    AuthError = require('models/user').AuthError;


module.exports = function(app) {
    app.use(app.router);

    app.get('/', function(req, res) {
        if (!req.session.user) {
            res.sendfile('views/login.html');
        } else {
            res.sendfile('views/index.html');
        }
    });

    app.post('/', function(req, res, next) {
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
                res.redirect('/');
	    });
	});
    });

    app.post('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    app.get('/templates/:template', function(req, res) {
        res.sendfile('views' + req.url);
    });
};
