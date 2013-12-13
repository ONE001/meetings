var app = angular.module('MEETINGS', ['pascalprecht.translate']);

app.socket = io.connect('http://localhost');

app.socket.on('connect', function () {
    console.info('connection established');
});

// socket.on('news', function (data) {
// 	console.log(data);
//     socket.emit('my other event', { my: 'data' });
// });
// socket.emit('my other event', { my: 'data' });
