var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	fs = require('fs'),
	pogobuf = require('pogobuf'),
	POGOProtos = require('node-pogo-protos'),
	bluebird = require('bluebird'),
	Long = require('long');

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

app.listen(port);
console.log('Server started on 127.0.0.1:' + port);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/map.html');
});

app.use('/res', express.static(__dirname + '/res'));
app.use('/res/js', express.static(__dirname + '/res/js'));
app.use('/res/poke-cons', express.static(__dirname + '/res/poke-cons'));
app.use('/res/icons', express.static(__dirname + '/res/icons'));
app.use('/node_modules/socket.io/node_modules/socket.io-client/socket.io.js', express.static(__dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js'));
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/node_modules/socket.io-server'));


//search.search(loginMethod, users, pass, location);


io.on('connection', function (socket) {
	console.log('A user connected');
});
