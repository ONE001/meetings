var app = angular.module('MEETING', ['pascalprecht.translate']);

app.config(function ($translateProvider) {
  	$translateProvider.translations('en', {
	    TITLE: 'Meetings',
  	});
  	$translateProvider.translations('ru', {
	    TITLE: 'Встречи',
  	});
  	$translateProvider.preferredLanguage('en');
});

var socket = io.connect('http://localhost');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});