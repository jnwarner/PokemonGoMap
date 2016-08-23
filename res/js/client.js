const pogobuf = require('pogobuf'),
	  POGOProtos = require('node-pogo-protos'),
	  bluebird = require('bluebird'),
	  Long = require('long'),
	  nodeGeocoder = require('node-geocoder');
const chalk = require('chalk');
var client = new pogobuf.Client();
var geocoder = nodeGeocoder();
var usr = '';
var io = Object;

module.exports = {
    init: function (auth, user, pass, location, skt) {
        auth = auth.toLowerCase();
        usr = user;
        io = skt;
        
        if (auth == 'ptc') { 
            var login = new pogobuf.PTCLogin();
        } else {
            var login = new pogobuf.GoogleLogin();
        }
        
        if (typeof location.lat == 'undefined' && typeof location.lng == 'undefined') {
            console.log(chalk.red('[ERROR] - Location Not Defined'));
        }
        
        return login.login(user, pass)
        .then (token => {
            client.setAuthInfo(auth, token);
            client.setPosition(location.lat, location.lng);
            return client.init();
        })
        .then(() => {
            console.log(chalk.green('[LOGIN] - Successful Login: ' + user));
        })
        .catch(console.error);
    },
    
    listPokes: function(loc) {
        //console.log(chalk.yellow('[STATUS] - ' + usr + ' is Scanning...'));
        setInterval(() => {
            var cellIDs = pogobuf.Utils.getCellIDs(loc.lat, loc.lng);
            return bluebird.resolve(client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0)))
            .then(mapObjects => {
                return mapObjects.map_cells;
            }).each(cell => {
                //console.log('Cell ' + cell.s2_cell_id.toString());
                //console.log('Has ' + cell.catchable_pokemons.length + ' catchable Pokemon');
                return bluebird.resolve(cell.catchable_pokemons).each(catchablePokemon => {
                    //var ts = (catchablePokemon.expiration_timestamp_ms.toNumber());
                    var ts = 'NULL';
                    var newPokemon = {
                        name: pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, catchablePokemon.pokemon_id),
                        id: catchablePokemon.pokemon_id,
                        lat: catchablePokemon.latitude,
                        lng: catchablePokemon.longitude,
                        expire: ts,
                        attkIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).att,
                        defIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).def,
                        stamIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon).stam,
                        percentIV: pogobuf.Utils.getIVsFromPokemon(catchablePokemon)
                    };
                    
                    io.emit('pokemon', newPokemon);
                    
                    ts = (ts - new Date().getTime()) / 60000;
                    ts = ts.toString().split('.');
                    ts = parseInt(ts[0]) + 'm'+(parseInt(ts[1])*60).toString().substring(0,2)+'s';
                    
                    console.log(chalk.blue('[POKEMON] - ' + 
                        pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId,
                        catchablePokemon.pokemon_id) + ' Found by ' + usr/* + ' - Expires in: ' + ts*/));
                });
            });
        }, 10 * 1000);
    },
    
    listGyms: function(loc) {
        setInterval(() => {
            var cellIDs = pogobuf.Utils.getCellIDs(loc.lat, loc.lng);
            return client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0))
        .then((mapObjects) => {
            client.batchStart();
            
            mapObjects.map_cells.map(cell => cell.forts)
                .reduce((a, b) => a.concat(b))
                .filter(fort => fort.type === 0)
                .forEach(fort => client.getGymDetails(fort.id, fort.latitude, fort.longitude));
            
            return client.batchCall();
        })
        .then(gyms => {
            gyms.forEach(gym => {
            var fortData = gym.gym_state.fort_data,
                memberships = gym.gym_state.memberships;

            console.log(gym.name);
            console.log('-'.repeat(gym.name.length));

            var team = 'Owned by team: ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.TeamColor,
                fortData.owned_by_team);
            if (fortData.is_in_battle) team += ' [IN BATTLE]';
            console.log(team);

            console.log('Points: ' + fortData.gym_points);

            if (memberships && memberships.length) {
                var highest = memberships[memberships.length - 1];

                console.log('Highest Pokémon: ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId,
                    highest.pokemon_data.pokemon_id) + ', ' + highest.pokemon_data.cp + ' CP');
                console.log('Trainer: ' + highest.trainer_public_profile.name + ', level ' +
                    highest.trainer_public_profile.level);
            }
                            
            var newGym = {
                name: gym.name,
                team: pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.TeamColor, fortData.owned_by_team),
                inBattle: fortData.is_in_battle,
                members: memberships,
                lat: fortData.latitude,
                lng: fortData.longitude
            }
            
            io.emit('gym', newGym);

            console.log();
            })
        })
        }, 10 * 1000);
    }
}