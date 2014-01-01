module.exports = function(io) {
    function find_client(socket_id) {
        var client;
        io.sockets.clients().forEach(function(c) {
            if (c.id != socket_id) return;
            client = c;
        });
        return client;
    }

    io.sockets.on('connection', function(socket) {
        var client = find_client(socket.id);

        require('routes/users')(client);
        require('routes/messages')(client);
    });
};
