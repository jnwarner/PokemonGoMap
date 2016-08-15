var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var pogobuf = require('pogobuf');
var POGOProtos = require('node-pogo-protos');

var configFile = 'config/config.json';
var search = require('./res/js/util.js');

var config = JSON.parse(
	fs.readFileSync(configFile)
);

var port = config.port;
var apiKey = config.api_key;
var loginMethod = config.auth;
var users = config.accounts;
var pass = config.pass;
var lat = config.lat;	//String will be converted to float in search (Same for long)
var long = config.long;

var location = [lat, long];

http.listen(port, function(){
	console.log('listening on 127.0.0.1:' + port);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/map.html');
});

app.use('/res', express.static(__dirname + '/res'));
app.use('/res/js', express.static(__dirname + '/res/js'));
app.use('/res/poke-cons', express.static(__dirname + '/res/poke-cons'));
app.use('/res/icons', express.static(__dirname + '/res/icons'));


search.search(loginMethod, users, pass, location, io);


io.on('connection', function (socket) {
	console.log('A client connected');
});

io.on('test', function(socket) {
    console.log('Test Socket Connected');
})