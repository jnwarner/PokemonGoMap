const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long');
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
                        catchablePokemon.pokemon_id) + ' id: ' + catchablePokemon.pokemon_id + ' IV: ' + catchablePokemon.individualAttack + ' popped up.');
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

}
