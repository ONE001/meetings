module.exports = function(io) {

    io.sockets.on('connection', function(socket) {
        socket.on('ready', function() {
            var events = require('routes/events')(io, socket);

            require('routes/users')(io, socket, events);
            require('routes/messages')(io, socket, events);
        });
    });

};
