// main.js
/* Global vars, constants */
const endpointsJson = "osrm_endpoints.json";

const MAP_ORIGIN = [17.963,77.432];
const MAP_ZOOM = 5;
var osrmLayer = new L.geoJson(null);
var markersLayer = new L.geoJson(null);
var globalEndpoints = {};

//##### MAP ####################
/* make leaflet map */
// background layers, using Leaflet-providers plugin. See https://github.com/leaflet-extras/leaflet-providers
var OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
var cartoVoyager = L.tileLayer.provider('CartoDB.VoyagerLabelsUnder');
var cartoPositron = L.tileLayer.provider('CartoDB.Positron');
var esriWorld = L.tileLayer.provider('Esri.WorldImagery');
var gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});
var gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']});

var baseLayers = {
    "CartoDB_Voyager":cartoVoyager,
    "CartoDB_Positron":cartoPositron,
    "ESRI satellite":esriWorld,
    "gstreets":gStreets,
    "gHybrid":gHybrid,
    "OSM":OSM
};

var map = L.map('map', {
    layers: [cartoPositron],
    contextmenu: true,
    contextmenuWidth: 140,
    contextmenuItems: [
        //{text: 'Center map here',  callback: centerMap }, '-', 
        //{ text: 'Start here', callback: pin_fromPlace }, 
        //{ text: 'End here', callback: pin_toPlace }, '-', 
        { text: 'Directions: Start here', callback: osrm_pin_fromPlace }, 
        { text: 'Directions: End here', callback: osrm_pin_toPlace }
        ]    
}).setView(MAP_ORIGIN, MAP_ZOOM);

$('.leaflet-container').css('cursor','crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs

var overlays = {
    "OSRM result": osrmLayer,
    "Start/end points": markersLayer
};
var layerControl = L.control.layers(baseLayers, overlays, {collapsed: true}).addTo(map); 

// Marker for positioning new stop or changing location of stop
function makeMarker(col='red') {
    return L.circleMarker(null, { radius: 5, color: null, weight: 1, opacity: 1, fillOpacity: 0.9, interactive: true, fillColor: col});
}

var osrm_startMarker = makeMarker('green');
var osrm_stopMarker = makeMarker('red');


function osrm_pin_fromPlace (e) {
    $('#osrm_fromPlace').val(`${e.latlng.lat.toFixed(5)},${e.latlng.lng.toFixed(5)}`);
    osrm_startMarker.setLatLng(e.latlng).addTo(markersLayer);
    if (!map.hasLayer(markersLayer)) map.addLayer(markersLayer);
}

function osrm_pin_toPlace (e) {
    $('#osrm_toPlace').val(`${e.latlng.lat.toFixed(5)},${e.latlng.lng.toFixed(5)}`);
    osrm_stopMarker.setLatLng(e.latlng).addTo(markersLayer);
    if (!map.hasLayer(markersLayer)) map.addLayer(markersLayer);
    mapOSRM();
}


function mapOSRM() {
    osrmLayer.clearLayers();
    if(!$('#osrmSelect').val()) { alert("Please select an OSRM server from the dropdown"); return;}
    
    var baseurl = globalEndpoints[$('#osrmSelect').val()]["url"];
    if(!baseurl) { alert("Invalid server. Check logs"); console.log(globalEndpoints); return;}


    $('#status').html(`Fetching from ${baseurl}..`);
    let fromRev = $('#osrm_fromPlace').val().split(',').reverse().join(',');
    let toRev = $('#osrm_toPlace').val().split(',').reverse().join(',');
    // var url = `${baseurl}route/v1/foot/${fromRev};${toRev}?overview=full&alternatives=true&steps=false&hints=;&geometries=geojson`;
    var url = `${baseurl}route/v1/foot/${fromRev};${toRev}?overview=full&alternatives=false&steps=false&geometries=polyline6`;
    $('#url').html(url);
    console.log(url);
    t1 = new Date();
    $.get(url, function( data ) {
        t2 = new Date();
        $('#dump').val(JSON.stringify(data));
        var geo = data['routes'][0]['geometry'];
        // console.log(geo);
        var geoLL = polyDecode(geo); // convert polyline to lat-long coords.
        var shapeLine = L.polyline.antPath(geoLL, {color: "blue", weight:3, opacity:0.7, interactive:true, delay:4000});//.bindTooltip(tooltipContent, {sticky:true});
        shapeLine.addTo(osrmLayer);

        if (!map.hasLayer(osrmLayer)) map.addLayer(osrmLayer);
        map.fitBounds(osrmLayer.getBounds(), {padding:[2,2], maxZoom:15});
        $('#status').html(`distance: ${(data.routes[0].distance/1000).toFixed(1)} km, duration: ${(data.routes[0].duration/60).toFixed(1)} mins, api time taken: ${(t2-t1)/1000} secs`);

    }).fail(function(data) {
        alert( `API call failed. Check logs.` );
        if(data.responseJSON) console.log(data.responseJSON);
        else console.log(data);
    });
}

$(document).ready(function() {
    //$.ajaxSetup({ cache: false });
    $.get(endpointsJson, function(data) {
        globalEndpoints = data;
        console.log(globalEndpoints);
        var content = '<option value="">Choose the OSRM server</option>';
        
        Object.entries(globalEndpoints).forEach(
            ([key, value]) => {
                if(value['active']) content += `<option value="${key}">${key}</option>`;
            }
        );
        /*
        data.endpoints.forEach(r => {
            content += `<option value="${r.url}">${r.title}</option>`;
        });
        */
        $('#osrmSelect').html(content);
    }).fail(function() {
        alert( `error loading ${endpointsJson}` );
    });

    $('#osrmSelect').change(function() {
        var chosen = $(this).val();
        if(!chosen) return;
        // console.log(chosen);
        var chosenDetails = globalEndpoints[chosen];
        var content = '';
        if(chosenDetails['title']) content += `<b>${chosenDetails['title']}</b>`;
        if(chosenDetails['description']) content += ` <small>${chosenDetails['description']}</small>`;

        if(chosenDetails['frontend']) content += ` | <a href="${chosenDetails['frontend']}" target="_blank">Open its own Frontend</a>`;
        if(chosenDetails['maintainer']) content += ` | maintained by ${chosenDetails['maintainer']}`;

        if(chosenDetails['center'] && chosenDetails['zoom']) map.flyTo(chosenDetails['center'], chosenDetails['zoom'], {duration:1, easeLinearity:0.75});

        $('#aboutServer').html(content);
    })
});
