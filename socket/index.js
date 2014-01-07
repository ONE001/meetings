var config = require('config'),
    connect = require('connect'),
    async = require('async'),
    cookie = require('cookie'),
    sessionStore = require('lib/sessionStore'),
    HttpError = require('error').HttpError,
    User = require('models/user').User
;

function LoadSession(sid, callback) {
    sessionStore.load(sid, function(err, session) {
        return arguments.length === 0 ? callback(null, null) : callback(null, session);
    });
}

function LoadUser(session, callback) {
    if (!session.user) return callback(null, null);

    User.findById(session.user, function(err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null);
        callback(null, user);
    });
}

module.exports = function(server) {
    var io = require('socket.io').listen(server);

    // io.enable('browser client minification');  // send minified client
    // io.enable('browser client etag');          // apply etag caching logic based on version number
    // io.enable('browser client gzip');          // gzip the file
    // io.set('log level', 1);                    // reduce logging

    io.set('transports', config.get("socket:transports"));
    //io.set('origins', config.get("socket:origins"));
    io.set('heartbeats', config.get("socket:heartbeats"));

    io.set('authorization', function(handshake, callback) {
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:key')],
                    sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

                LoadSession(sid, callback);
            },
            function(session, callback) {
                if (!session)
                    callback(new HttpError(401, "No session"));

                handshake.session = session;
                LoadUser(session, callback);
            },
            function(user, callback) {
                if (!user)
                    callback(new HttpError(403, "Anonimous session may not connect"));

                handshake.user = user;
                callback(null);
            },
        ], function(err) {
            if (!err)
                return callback(null, true);

            if (err instanceof HttpError)
                return callback(null, false);

            callback(err);
        });
    });

    io.sockets.on('session:reload', function(sid) {
        var clients = io.sockets.clients();

        clients.forEach(function(client) {
            if (client.handshake.session.id != sid) return;

            LoadSession(sid, function(err, session) {
                if (err) {
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }

                if (!session) {
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });
        });
    });

    require('routes/sockets')(io);

    return io;
}
