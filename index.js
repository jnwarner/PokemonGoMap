var express = require('express');               // Import Express
var app = require('express')();                 // Initialize Ixpress
var http = require('http').Server(app);         // Initialize Http server
var io = require('socket.io')(http);            // Import Socket.io
var fs = require('fs');                         // Import File Read/Write
var pogobuf = require('pogobuf');               // Import Pogobuf
var POGOProtos = require('node-pogo-protos');   // Import Pogo-Protos
var chalk = require('chalk');

var bot = require('./res/js/client.js');

var configFile = 'config/config.json';          // Import Config File
var search = require('./res/js/util.js');       // Import Search Functions

var dbmng = require('./res/js/dbManager.js');

dbmng.init();

var config = JSON.parse(                        
	fs.readFileSync(configFile)                 // Read Config File
);
    
var port = config.port;                         // Get Http Port
var apiKey = config.api_key;                    // Get API Key
var loginMethod = config.auth;                  // Get Auth Service
var users = config.accounts;                    // Get Account Usernames
var pass = config.pass;                         // Get Account Passwds
var lat = config.lat;	                        // Get Latitude
var lng = config.lng;                           // Get Longitude

var location = {
    lat: lat,
    lng: lng
};

// Constructors
var pokemon = {
    name: 'null',
    id: 0,
    lat: 0,
    lng: 0,
    expire: 0.1,
    attkIV: 0,
    defIV: 0,
    stamIV: 0,
    percentIV: 0
};

var gym = {
    name: 'null',
    team: 'null',
    inBattle: false,
    members: [0, 0],
    lat: 0,
    lng: 0
};

var pokeStop = {
    name: 'null',
    lat: 0,
    lng: 0,
    lureExpire: 0
};

http.listen(port, function(){                       // Start Http Server
	console.log(chalk.magenta('[SERVER] - Started on 127.0.0.1:' + port));  // Log Server Start
});

app.get('/', function(req, res) {               // Route index to map.html
	res.sendFile(__dirname + '/map.html');      // Load map.html
});

app.use('/res', express.static(__dirname + '/res'));                        // Load route to resources
app.use('/res/js', express.static(__dirname + '/res/js'));                  // Load route to js
app.use('/res/poke-cons', express.static(__dirname + '/res/poke-cons'));    // Load route to pokemon icons
app.use('/res/icons', express.static(__dirname + '/res/icons'));            // Load route to map icons



//search.search(loginMethod, users, pass, location, io);   // Begin search with client


io.on('connection', function (socket) {                  // On client connection...
	console.log(chalk.magenta('[SERVER] - Client connected'));                   // Log connection
    var initInfo = {
        location: location,
        pokemon: [],
        gyms: [],
        stops: []
    };
    //initInfo.stops.push({
    //    name: 'testStop',
    //    lat: lat,
    //    lng: lng,
    //    lureExpire: 0
    //});
    socket.emit('init', initInfo);                       // Send init packet
});

io.on('test', function(socket) {                         // Test socket connection
    console.log('Test Socket Connected');                // Log test connection
});

if (bot.init(loginMethod, users, pass, location, io)) {
    bot.scan(location);
}