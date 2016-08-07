var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
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
var lat = parseFloat(config.lat);
var long = parseFloat(config.long);

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
	console.log('Logging into '+users+' with loginMethod '+loginMethod+' at Lat '+lat+' Long '+long);
	return client.init();
}).then(() => {
	console.log('Authenticated, waiting for first map refresh (10s)');
    setInterval(() => {
        var cellIDs = pogobuf.Utils.getCellIDs(lat, long);
        return bluebird.resolve(client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0))).then(mapObjects => {
            return mapObjects.map_cells;
        }).each(cell => {
            console.log('Cell ' + cell.s2_cell_id.toString());
            console.log('Has ' + cell.catchable_pokemons.length + ' catchable Pokemon');
            return bluebird.resolve(cell.catchable_pokemons).each(catchablePokemon => {
                console.log(' - A ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId,
                    catchablePokemon.pokemon_id) + ' is asking you to catch it.');
            });
        });
    }, 10 * 1000);
});

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
