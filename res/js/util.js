const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long'),
<<<<<<< HEAD
	  socket = require('socket.io')();

module.exports = {
	search: function (auth, user, pass, location) {
		if (auth.toLowerCase() == 'ptc') {
			var login = new pogobuf.PTCLogin();
		} else {
			var login = new pogobuf.GoogleLogin();
		}

		var client = new pogobuf.Client();

		if(location.length < 2){
		  //TODO
		}else{
			var lat = parseFloat(location[0]);
			var long = parseFloat(location[1]);
		}

		login.login(user, pass).then(token => {
		  // Initialize client
			client.setAuthInfo(auth, token);
			client.setPosition(lat, long);
			client.on('request', console.dir);
			client.on('response', console.dir);
			console.log('Logging into '+user+' with login method '+auth+' at Lat '+lat+' Long '+long);
			return client.init();
		}).then(() => {
			console.log('Authenticated, waiting for first map refresh (10s)');
			setInterval(() => {
				var cellIDs = pogobuf.Utils.getCellIDs(lat, long, 5);
				return bluebird.resolve(client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0))).then(mapObjects => {
					return mapObjects.map_cells;
				}).each(cell => {
					console.log('Cell ' + cell.s2_cell_id.toString());
					console.log('Has ' + cell.catchable_pokemons.length + ' catchable Pokemon');
					return bluebird.resolve(cell.catchable_pokemons).each(catchablePokemon => {
						console.log(' - A ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId,
							catchablePokemon.pokemon_id) + ' id: ' + catchablePokemon.pokemon_id + ' IV: ' + catchablePokemon.getIVsFromPokemon + ' popped up.');
						console.log(catchablePokemon);
					});
				});
			}, 10 * 1000);
		}).catch(console.error);
		},

		/*offset: function(origin){ //Current Position
		  var length = 56.568542494923802; //radius length of square (Take Proximity circle == 80meter diameter)
		  var l2 = length + (length/2);
		  var travel = [this.distance(origin, l2, 0), this.distance(origin, -l2, 0), this.distance(origin, l2, length/2), this.distance(origin, l2, -length/2), this.distance(origin, -l2, length/2), this.distance(origin, -l2, -length/2)];
		  return travel;
		},

		distance: function(origin, x,y){
		var R = 6378137;
		var lat = origin[0];
		var long = origin[1];
		var newLat = y/R;
		var newLong = x/(R*Math.cos(Math.PI*lat/180));

		//OffsetPosition, decimal degrees
		var latO = lat + newLat * 180/Math.PI;
		var longO = long + newLong * 180/Math.PI;
		return [latO, longO];
		}*/
=======
		nodeGeocoder = require('node-geocoder');
module.exports = {
  search: function (auth, user, pass, location) {
		var login = new pogobuf.PTCLogin(),
    client = new pogobuf.Client(),
    geocoder = nodeGeocoder();
    if (auth.toLowerCase() == 'ptc') {
    	var login = new pogobuf.PTCLogin();
    } else {
    	var login = new pogobuf.GoogleLogin();
    }
		geocoder.geocode('Columbia, Missouri')
    .then(loc => {
        if (!location.length) {
            throw Error('No location found');
        }
        lat = parseFloat(location[0]);//.latitude;
        lng = parseFloat(location[1]);//.longitude;
        return login.login(user, pass);
    })
    .then(token => {
        client.setAuthInfo('ptc', token);
        client.setPosition(lat, lng);
        return client.init();
    })
    .then(() => {
        var cellIDs = pogobuf.Utils.getCellIDs(lat, lng, 5);
        return bluebird.resolve(client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0)));
    })
    .then(mapObjects => {
        return mapObjects.map_cells;
    })
    .each(pokes => {
        // Display gym information
				if(pokes.catchable_pokemons.length > 0){
					console.log(pokes.catchable_pokemons.length);
				}
				return bluebird.resolve(pokes.catchable_pokemons).each(catchablePokemon => {
					console.log(catchablePokemon.pokemon_id);
					console.log(' - A ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, catchablePokemon.pokemon_id) + ' is asking you to catch it.');
					var ts = (catchablePokemon.expiration_timestamp_ms.toNumber()-new Date().getTime())/1000;

					console.log(ts);
					console.log(catchablePokemon.latitude);
					console.log(catchablePokemon.longitude);
					//console.log(new Date().getTime());
					//console.log(catchablePokemon.expiration_timestamp_ms);
				});
    })
    .catch(console.error);},

  offset: function(origin, step){ //Current Position
      var length = 0.07;//42494923802; //radius length of square (Take Proximity circle == .07KM diameter)

			var xdist = Math.sqrt(3)*0.07;
			var ydist = 3*(0.07/2);

			var l2 = length + (length/2);
      var travel = [];
			travel.push(origin);

			var ring = 1;
			while(ring < step){
				origin = this.distance(origin, ydist, 0);
				origin = this.distance(origin, xdist/2, 270);
				travel.push(origin);
				for(k=0; k<6; k++){
					for(i=0; i<ring; i++){
						if(k == 0){ //RIGHT
							origin = this.distance(origin, xdist, 90);
						}
						if(k == 1){ //DOWN + RIGHT
							origin = this.distance(origin, ydist, 180);
							origin = this.distance(origin, xdist/2, 90);
						}
            if(k == 2){ //DOWN + LEFT
							origin = this.distance(origin, ydist, 180);
							origin = this.distance(origin, xdist/2, 270);
						}
						if(k == 3){ //LEFT
							origin = this.distance(origin, xdist, 270);
						}
						if(k == 4){ //UP + LEFT
							origin = this.distance(origin, ydist, 0);
							origin = this.distance(origin, xdist/2, 270);
						}
						if(k == 5){ //UP + RIGHT
							origin = this.distance(origin, ydist, 0);
							origin = this.distance(origin, xdist/2, 90);
						}
						travel.push(origin);
					}
				}
				ring += 1;
			}

			return travel;
  },

  distance: function(origin, dist, dir){ //Direction N = 0, E = 90, S = 180, W = 270
		var R = 6378.1;
    var latOld = this.toRad(origin[0]);
    var longOld = this.toRad(origin[1]);
		dir = this.toRad(dir);
		var latNew = Math.asin(Math.sin(latOld)*Math.cos(dist/R) + Math.cos(latOld)*Math.sin(dist/R)*Math.cos(dir));
		var longNew = longOld + Math.atan2(Math.sin(dir)*Math.sin(dist/R)*Math.cos(latOld), Math.cos(dist/R)-Math.sin(latOld)*Math.sin(latNew));
    return [this.toDeg(latNew),this.toDeg(longNew)];
  },

	toRad: function(number){
		return (number * (Math.PI/180));
	},
	toDeg: function(number){
		return (number * (180/Math.PI));
	}
>>>>>>> origin/master

}
