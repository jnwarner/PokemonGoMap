var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
const pokeio = require('pokemon-go-node-api');
var configFile = 'config/config.json';

var config = JSON.parse(
	fs.readFileSync(configFile)
);

var port = config.port;
var loginMethod = config.auth;

if (loginMethod.toLowerCase() == 'ptc') {
	var login = new pogobuf.PTCLogin();
} else {
	var login = new pogobuf.GoogleLogin();
}

var client = new pogobuf.Client();

app.listen(port);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
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
