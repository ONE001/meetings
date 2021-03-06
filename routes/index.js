var User = require('models/user').User,
    HttpError = require('error').HttpError,
    AuthError = require('models/user').AuthError
;

module.exports = function(app, dir) {
    var path = dir + '/views';
    app.use(app.router);

    app.get('/', function(req, res) {
        if (!req.session.user)
            res.sendfile(path + '/login.html');
        else
            res.sendfile(path + '/index.html');
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

    app.post('/logout', function(req, res, next) {
        var sid = req.session.id;
        req.session.destroy(function(err) {
            req.app.get('io').sockets.$emit("session:reload", sid);
            if (err) next(err);
            res.redirect('/');
        });
    });

    app.get('/templates/:template', function(req, res) {
        res.sendfile(path + req.url);
    });
};
