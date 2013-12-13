module.exports = function(socket) {
    console.log(socket.handshake.headers);
    //socket.emit("user", )

    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
	console.log(data);
    });
};
