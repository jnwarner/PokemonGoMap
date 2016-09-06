var fs = require("fs");
var file = "map.db";
var exists = fs.existsSync(file);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

module.exports = {
    init: function() {
        db.serialize(function() {
            if (!exists) {
                // Create active pokemon table
                db.run('CREATE TABLE active (name VARCHAR(15), id INTEGER, lat REAL, lng REAL, expire TIME, attkiv SMALLINT, defiv SMALLINT, stamiv SMALLINT, percentiv FLOAT)', function(err) {
                    if (err) {
                        console.log('Error creating "active" table: \n' + err);
                    }
                });

                // Create pokemon table
                db.run('CREATE TABLE pokemon (name VARCHAR(15), id INTEGER, lat REAL, lng REAL, expire TIME, attkiv SMALLINT, defiv SMALLINT, stamiv SMALLINT, percentiv FLOAT, active BOOLEAN)', function(err) {
                    if (err) {
                        console.log('Error creating "all" table: \n' + err);
                    }
                });

                // Create gym table
                db.run('CREATE TABLE gyms (name VARCHAR(30), team VARCHAR(8), lat REAL, lng REAL, inbattle BOOLEAN)', function(err) {
                    if (err) {
                        console.log('Error creating "gyms" table: \n' + err);
                    }
                });

                // Create pokestop table
                db.run('CREATE TABLE pokestops (id BIGINT, name VARCHAR(30), lat REAL, lng REAL, expire TIMESTAMP)', function(err) {
                    if (err) {
                        console.log('Error creating "pokestops" table: \n' + err);
                    }
                });
            }
        });
    },
    
    insertPokemon: function(pokemon) {
        var matches = 0;
        db.each('SELECT * FROM active WHERE id = ' + pokemon.id + 
               ' AND lat = ' + pokemon.lat +
               ' AND lng = ' + pokemon.lng, function(err, row) {
            if (err) {
                db.run('INSERT INTO active (name, id, lat, lng, expire, attkiv, defiv, stamiv, percentiv) VALUES (' + pokemon.name + ', ' + pokemon.id + ', ' + pokemon.lat + ', ' + pokemon.lng + ', ' + pokemon.expire + ', ' + pokemon.attkIV + ', ' + pokemon.defIV + ', ' + pokemon.stamIV + ', ' + pokemon.percentIV + ')');
                console.log(err);
            }
        });
    }
}
