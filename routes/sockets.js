module.exports = function(io) {

    io.sockets.on('connection', function(socket) {
        io.sockets.clients().forEach(function(client) {
            if (client.id != socket.id) return;

            client.emit('user', client.handshake.user);
        });

        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
	    console.log(data);
        });

    });
};
