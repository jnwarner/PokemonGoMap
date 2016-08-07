var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var pogobuf = require('pogobuf');
var configFile = 'config/config.json';

var config = JSON.parse(
	fs.readFileSync(configFile)
);

var port = config.port;
var apiKey = config.api_key;
var loginMethod = config.auth;
var users = config.accounts;
var pass = config.pass;
var lat = config.lat;
var long = config.long;

/*
if (loginMethod.toLowerCase() == 'ptc') {
	var login = new pogobuf.PTCLogin();
} else {
	var login = new pogobuf.GoogleLogin();
}

var client = new pogobuf.Client();

login.login(users, pass).then(token => {
	// Initialize client
	client.setAuthInfo(loginMethod, token);
	client.setPosition(lat, long);
	client.on('request', console.dir);
    client.on('response', console.dir);
	return client.init();
})
.catch(console.error);
*/

app.listen(port);
console.log("Server started at 127.0.0.1:" + port);

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
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
    	console.log(data);
	});
});