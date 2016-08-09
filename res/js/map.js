var map;
var locationMarker;
var pokeMarkerCount = 0;
var gymCount = 0;
var pokestopCount = 0;


var iconBase = '/res/icons/';
var icons = {
	neutral: {
		icon: iconBase + 'neutral.png'
	},
	mystic: {
		icon: iconBase + 'mystic.png'
	},
	valor: {
		icon: iconBase + 'valor.png'
	},
	instinct: {
		icon: iconBase + 'instinct.png'
	}
};

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
		zoom: 8,
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

function addGymMarker(lat, lng, team) {				// Maybe in future take gym object
	team = team.toLowerCase();
	var imageSrc = '/res/icons/' + team + '.png';
	var image = {
		url: imageSrc,
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(32, 16)
	}
	var infoContent = '<div id="content">' + 
		'<div id="siteNotice">' +
		'</div>' + 
		'<h4 class="firstHeading"> ' + team + ' Gym</h4>' +
		'<div id="bodyContent">' +
		'<p>Pokemon Gym</p>' + 
		'</div>' + 
		'</div>';
	var infoWindow = new google.maps.InfoWindow({
		content: infoContent
	});
	var pos = new google.maps.LatLng(lat, lng);
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		animation: google.maps.Animation.DROP,
		icon: image, 		// Won't load image
		draggable: false
	});

	marker.addListener('mouseover', function() {
		infoWindow.open(map, marker);
	});

	marker.addListener('mouseout', function() {
		infoWindow.close();
	})
}

function addPokeMarker(lat, lng, type, expire) {
	var imageSrc = 'res/poke-cons/' + type + '.ico';
	var image = {
		url: imageSrc,
		scaledSize: new google.maps.Size(40, 40),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(20, 20)
	}
	var infoContent = '<div id="content">' + 
		'<div id="siteNotice">' +
		'</div>' + 
		'<h4 class="firstHeading">Pokemon: ' + type + '</h4>' +
		'<div id="bodyContent">' +
		'<p>Expires at ' + expire + '</p>' + 
		'</div>' + 
		'</div>';
	var infoWindow = new google.maps.InfoWindow({
		content: infoContent
	});
	var pos = new google.maps.LatLng(lat, lng);
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		animation: google.maps.Animation.DROP,
		icon: image,
		draggable: false
	});

	marker.addListener('mouseover', function() {
		infoWindow.open(map, marker);
	});

	marker.addListener('mouseout', function() {
		infoWindow.close();
	})
}