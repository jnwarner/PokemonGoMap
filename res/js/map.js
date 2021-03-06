var map;
var locationMarker;
var pokeMarkerCount = 0;
var gymCount = 0;
var pokestopCount = 0;

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

var player = {
    name: 'null',
    pokemon: pokemon
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

var activePokemon = [
    pokemon
];
var activeGyms = [
    gym
];
var activeStops = [
    pokeStop
];

var normalStyle = [];

var darkStyle = [{'featureType':'all','elementType':'labels.text.fill','stylers':[{'saturation':36},{'color':'#b39964'},{'lightness':40}]},{'featureType':'all','elementType':'labels.text.stroke','stylers':[{'visibility':'on'},{'color':'#000000'},{'lightness':16}]},{'featureType':'all','elementType':'labels.icon','stylers':[{'visibility':'off'}]},{'featureType':'administrative','elementType':'geometry.fill','stylers':[{'color':'#000000'},{'lightness':20}]},{'featureType':'administrative','elementType':'geometry.stroke','stylers':[{'color':'#000000'},{'lightness':17},{'weight':1.2}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#000000'},{'lightness':20}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#000000'},{'lightness':21}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#000000'},{'lightness':17}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#000000'},{'lightness':29},{'weight':0.2}]},{'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#000000'},{'lightness':18}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#181818'},{'lightness':16}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#000000'},{'lightness':19}]},{'featureType':'water','elementType':'geometry','stylers':[{'lightness':17},{'color':'#525252'}]}];

var pGoStyle = [{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#a1f199"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry.fill","stylers":[{"color":"#37bda2"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry.fill","stylers":[{"color":"#37bda2"}]},{"featureType":"poi.attraction","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"geometry.fill","stylers":[{"color":"#e4dfd9"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#37bda2"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#84b09e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#fafeb8"},{"weight":"1.25"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#5ddad6"}]}];

var coolStyle = [{'featureType':'all','elementType':'labels.text.fill','stylers':[{'color':'#ffffff'}]},{'featureType':'all','elementType':'labels.text.stroke','stylers':[{'color':'#000000'},{'lightness':13}]},{'featureType':'administrative','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'administrative','elementType':'geometry.stroke','stylers':[{'color':'#144b53'},{'lightness':14},{'weight':1.4}]},{'featureType':'landscape','elementType':'all','stylers':[{'color':'#08304b'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#0c4152'}]},{'featureType':'poi.park','elementType':'geometry','stylers':[{'color':'#02818D'}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#0b434f'},{'lightness':25}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#0b3d51'},{'lightness':16}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#000000'}]},{'featureType':'transit','elementType':'all','stylers':[{'color':'#146474'}]},{'featureType':'water','elementType':'all','stylers':[{'color':'#021019'}]}];

var selectedStyle = 'normalStyle';

var gym_types = ['Neutral', 'Mystic', 'Valor', 'Instinct'];

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 4,
			lng: 4
		},
		zoom: 17,
		styles: pGoStyle,
		fullscreenControl: true,
		rotateControl: true,
		streetViewControl: false,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.TOP_RIGHT,
			mapTypeIds: [
				google.maps.MapTypeId.ROADMAP,
				google.maps.MapTypeId.SATELLITE,
				'nolabels_style',
			],
		},
	})
}

function addScanMarker(loc) {
    var pos = new google.maps.LatLng(loc.lat, loc.lng);
    var scanMarker = new google.maps.Marker({
        position: pos,
        map: map,
        animation: null,
        draggable: true
    });
    
    var newPos = {
        lat: scanMarker.getPosition().lat,
        lng: scanMarker.getPosition().lng
    };
    
    scanMarker.addListener('dragend', function() {
        socket.emit('locChange', newPos);
        console.log('Changing scan location');
    });
}

function addGymMarker(newGym) {
    var notNew = false;
    for (var i = 0; i < activeGyms.length; i++) {
        if (activeGyms[i].name == newGym.name || activeGyms[i].team == newGym.name) {
            notNew = true;
        }
    }
    if (!notNew) {
        var team = newGym.team.toLowerCase();
        var imageSrc = '/res/icons/' + team + '.png';
        var image = {
            url: imageSrc,
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 16)
        }
        var infoContent = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h4 class="firstHeading"> ' + getTeam(team) + ' Gym</h4>' +
            '<div id="bodyContent">' +
            '<p>Pokemon Gym</p>' +
            '</div>' +
            '</div>';
        var infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        var pos = new google.maps.LatLng(newGym.lat, newGym.lng);
        var marker = new google.maps.Marker({
            position: pos,
            map: map,
            animation: null,
            icon: image,
            draggable: false
        });

        marker.addListener('mouseover', function() {
            infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', function() {
            infoWindow.close();
        });
        activeGyms.push(newGym);
    }
    
}

function addPokeStop(newStop) {
    console.log('pokestop');
    var notNew = false;
    for (var i = 0; i < activeStops.length; i++) {
        if (activeStops[i].name == newStop.name) {
            notNew = true;
        }
    }
    if (!notNew) {
        var imageSrc = '/res/icons/pokestop';
        if (newStop.lureExpire > 0) {
            imageSrc += 'Lure';
        }
        imageSrc += '.png';
        var image = {
            url: imageSrc,
            origin:new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 15),
            scaledSize: new google.maps.Size(30, 30)
        }
        var infoContent = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h4 class="firstHeading">Pokestop: ' + newStop.name + '</h4>' +
            '<div id="bodyContent">';
        if (newStop.lureExpire > 0) {
            infoContent += '<p>Expires at <span id="LureExpire">Lure Expire' +                      newStop.lureExpire + '</span></p>';
        }
        infoContent += '</div></div>';
        
        var infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        var pos = new google.maps.LatLng(newStop.lat, newStop.lng);
        var marker = new google.maps.Marker({
            position: pos,
            map: map,
            animation: null,
            icon: image,
            draggable: false
        });
        
        var mouseOverListener = marker.addListener('mouseover', function() {
            infoWindow.open(map, marker);
        });
        
        var mouseOutListener = marker.addListener('mouseout', function() {
            infoWindow.close();
        })
    }
}

function addPokeMarker(newPokemon) {
    var notNew = false;
    for (var i = 0; i < activePokemon.length; i++) {
        if (activePokemon[i].id == newPokemon.id &&
            activePokemon[i].lat == newPokemon.lat &&
            activePokemon[i].lng == newPokemon.lng &&
            getTimeRemaining(newPokemon.expire).minutes > 0) {
            notNew = true;
            break;
        }
    }
    if (!notNew) {
        var expire = newPokemon.expire;
        expire = getTimeRemaining(newPokemon.expire);
        expire = expire.minutes + 'm' + expire.seconds + 's';

        console.log('New Pokemon | ' + newPokemon.id + ' | Expires in: ' + expire);

        var imageSrc = 'res/poke-cons/' + newPokemon.id + '.ico';
        var image = {
            url: imageSrc,
            scaledSize: new google.maps.Size(75, 75),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20)
        }
        var infoContent = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h4 class="firstHeading">' + newPokemon.id + ' : ' + newPokemon.name + '</h4>' +
            '<div id="bodyContent">' +
            '<p>Expires at <span id="pokeExpire">' + expire + '</span></p>' +
            '</div>' +
            '</div>';
        var infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        var pos = new google.maps.LatLng(newPokemon.lat, newPokemon.lng);
        var marker = new google.maps.Marker({
            position: pos,
            map: map,
            //animation: google.maps.Animation.DROP,
            animation: null,
            icon: image,
            draggable: false
        });

        var mouseOverListener = marker.addListener('mouseover', function() {
            infoWindow.open(map, marker);
        });

        var mouseOutListener = marker.addListener('mouseout', function() {
            infoWindow.close();
        });

        activePokemon.push(newPokemon);
    }
}

function getTimeRemaining(ts){
    ts = (ts - new Date().getTime()) / 60000;
    ts = ts.toString().split('.');
    //ts = parseInt(ts[0]) + 'm'+ (parseInt(ts[1]) * 60).toString().substring(0,2) + 's';
    return {
        minutes: parseInt(ts[0]),
        seconds: (parseInt(ts[1]) * 60).toString().substring(0,2)
    }
}

function changeCenter(loc){
    map.setCenter(loc);
}

function getTeam(color) {
    switch (color) {
        case 'neutral':
            return 'Neutral';
            break;
        case 'blue':
            return 'Mystic';
            break;
        case 'red':
            return 'Valor';
            break;
        case 'yellow':
            return 'Instinct';
            break;
    }
}