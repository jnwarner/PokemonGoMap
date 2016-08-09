var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var search = require('./res/js/util.js');

const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long');
var configFile = 'config/config.json';

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

//search.search(loginMethod, users, pass, location);

app.listen(port);
console.log('Server started at 127.0.0.1:' + port);

function handler (req, res) {
    fs.readFile(__dirname + '/map.html',
    function (err, data) {
			if (err) {
    		res.writeHead(500);
    		return res.end('Error loading... Curl up and cri everytime');
    	}
    	res.writeHead(200);
    	res.end(data);
  });
}

io.on('connection', function (socket) {
	console.log('A user connected');
});
