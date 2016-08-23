const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long'),
	  nodeGeocoder = require('node-geocoder');
	  //map = require('./map.js');

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
        return login.login(user, pass)
        .then (token => {
            client.setAuthInfo(auth, token);
            return client.init();
        })
        .then(() => {
            console.log('[LOGIN] | ' + user);
        })
        .catch(console.error);
    }
}