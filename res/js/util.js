const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long'),
	  nodeGeocoder = require('node-geocoder'),
	  map = require('./map.js');

module.exports = {
    search: function (auth, user, pass, location, io) {
        var client = new pogobuf.Client(),
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
            //client.setPosition(lat, lng);
            return client.init();
        })
        .then(() => {
            console.log('Begining loops at 10 second interval.');
            var i = -1;
            setInterval(() => {
            i++;
            var travel = this.offset(location, 3);
            //console.log(i + ' length '+travel.length);
            if(i >= travel.length){
                i = 0;
            }
            lat = parseFloat(travel[i][0]);
            lng = parseFloat(travel[i][1]);
            //console.log("lat: "+lat+" long: "+lng);
            client.setPosition(lat, lng);
            client.playerUpdate();
            var cellIDs = pogobuf.Utils.getCellIDs(lat, lng, 5);
            
            return bluebird.resolve(client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0)))
            .then(mapObjects => {
                return mapObjects.map_cells;
            })
            .each(cells => {
                return bluebird.resolve(cells.catchable_pokemons).each(catchablePokemon => {
                    var ts = (catchablePokemon.expiration_timestamp_ms.toNumber());

                    var newPokemon = {
                        name: pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, catchablePokemon.pokemon_id),
                        id: catchablePokemon.pokemon_id,
                        position: [catchablePokemon.latitude, catchablePokemon.longitude],
                        expire: ts,
                        attkIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).att,
                        defIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).def,
                        stamIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).stam,
                        percentIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon)
                    };

                    ts = ts - new Date().getTime() / 60000;
                    ts = ts.toString().split('.');
                    ts = parseInt(ts[0]) + 'm'+(parseInt(ts[1])*60).toString().substring(0,2)+'s';

                    console.log(' - A ' + catchablePokemon.pokemon_id + ' ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, catchablePokemon.pokemon_id) + ' at lat:' + catchablePokemon.latitude+' long:' + catchablePokemon.longitude + ' expires:' + ts);

                    io.emit('pokemon', newPokemon);
                });
            });
            /*.then(mapObjects => {
                login.batchStart();
                
                mapObjects.map_cells.map(cell => cell.forts)
                    .reduce((a, b) =>a.concat(b))
                    .filter(fort => fort.type ===0)
                    .forEach(fort => client.getGymDetails(fort.id, fort.latitude, fort.longitude));
                    
                return  login.batchCall();
            });*/
        }, 10 * 1000);
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
    
    distance: function(origin, dist, dir) { //Direction N = 0, E = 90, S = 180, W = 270
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
}
