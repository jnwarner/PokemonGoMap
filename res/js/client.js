const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long'),
	  nodeGeocoder = require('node-geocoder'),
	  map = require('./map.js');

module.exports = {
    init: function (auth, user, pass, location) {
        auth = auth.toLowerCase();
        var client = new pogobuf.Client();
        var geocoder = nodeGeocoder();
        
        if (auth == 'ptc') { 
            var login = new pogobuf.PTCLogin();
        } else {
            var login = new pogobuf.GoogleLogin();
        }
        var token = login.login(user, pass);
        client.setAuthInfo(auth, token);
        console.log(client.init());
        
    }
}