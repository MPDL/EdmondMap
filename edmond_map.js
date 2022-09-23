// Add a Leaflet map to the page
var map = L.map("map").setView([40, 0], 2);
L.tileLayer(
  "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=hMlLEQcFQEshE4YQVA2W",
  {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  }
).addTo(map);
// Add a scale into the top right of the map
L.control
  .scale({
    metric: true,
    imperial: false,
    position: "topright",
  })
  .addTo(map);

let items = [];
let list = []

function getItems(offset, limit) {
  //Fetch collections.json from server, parse it and visualize in the map.
  fetch("/collections.json", {
  //fetch("https://edmond.mpdl.mpg.de/api/search?q=geolocationLatitude:*&per_page=" + limit + "&start=" + offset + "&type=dataset&metadata_fields=citation:geolocation", {
    mode: "cors",
  })
    .then(function (response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
        return;
      }
      // Examine the text in the response
      response.json().then(function (result) {
        items = result.data.items;

      //only for local testing
      items = items.slice(offset,offset+items_per_page);

      updateListAndMap();

        //Iterating over items in data and creating listcontent items
        /*
        result.data.items.forEach((item) => {
          var listContentElement = createListContentElement(item);
          if (listContentElement != null) {
            listContent.push(listContentElement);
          }
        });
*/
        //list = listContent;
        //paginate(0)
      });
    })
    .catch(function (err) {
      console.log("Fetch Error :-S", err);
    });
}

function updateListAndMap() {
  
  list=[];
  //TODO: Clear all markers from map


  //Clear list
  var listContainer = document.getElementById("collectionsList").innerHTML = '';

  items.forEach((item) => {
    var listContentElement = createListContentElement(item);
    if (listContentElement != null) {
      list.push(listContentElement);
    }
  });

  makeList(list);


}




/**
 * Creates new listContentElement Object from given result
 * only if result contains coordinates.
 * @param {*} item Result Object from json file
 * @returns listContentElement or null if result has no coordinates
 */
function createListContentElement(item) {
  var citationFields = item.metadataBlocks.citation.fields;
  var marker;
  var coords = [];
  citationFields.forEach((field) => {
    if (field.typeName == "geolocation") {
      field.value.forEach((coordValue) => {
        lat = coordValue.geolocationLatitude.value;
        lng = coordValue.geolocationLongitude.value;
        coord={ 
          latitude: lat, 
          longitude: lng 
        }
        coords.push(coord);
        marker = createMarker(coord, item);
      })

    }
  });
  // Check if coordinates exist and return listContentElement Object
  if (coords.length !== 0) {
    return {
      name: item.name,
      url: item.url,
      coordinates: coords,
      marker: marker,
    };
  } else return null;

}

/**
 * Creates marker from info and result, by parsing coordinates and creating marker
 * with name, text and link to edmond page
 * @param {} coord contains coordinates from json
 * @param {*} result contains name and text of given entry
 * @returns created marker
 */
function createMarker(coord, item) {
  // Parse and add coordinates to a marker
  var lat = parseFloat(coord.latitude);
  var lng = parseFloat(coord.longitude);
  marker = L.marker([lat, lng]);
  marker.addTo(map);
  // Create link to an Edmond page through the marker popup
  marker.bindPopup(
    '<a class = "animation" href="' +
    item.url+
    '" target="_blank">' +
    "<b>" +
    item.name +
    "</b><br>[" +
    coord.latitude+","+coord.longitude +
    "]" +
    "</a>"
  );
  return marker;
}

/**
 * Creates listItems from given List of content and adds them to the listContainer
 * @param {*} listContent list of all entries with all informations needed to create listitems
 */
function makeList(listContent) {
  var listContainer = document.getElementById("collectionsList");
  listContent.forEach((element) => {
    listItem = document.createElement("tr");
    // listItem.innerHTML = element.coordinates;
    listItem.innerHTML =
      '<a class = "animation" href="' +
      element.url +
      '" target="_blank">' +
      element.name +
      "</a>";
    // A marker appears on the map with the data popup
    listItem.onmouseover = function () {
      element.marker.openPopup();
    };
    // Add listItem to the listElement
    listContainer.appendChild(listItem);
  });
}

let count = 0;
const items_per_page = 10;
const pagination_numbers_container = document.querySelector('.pagination-numbers');
const next = document.querySelector('.next');
const previous = document.querySelector('.previous');

next.addEventListener('click', (e) => paginate("next"));
previous.addEventListener('click', (e) => paginate("previous"));

let offset = 0
const paginate = (p) => {
  
  //var listContainer = document.getElementById("collectionsList");
  //listContainer.innerHTML = '';
  
  if(p === 'next') offset += items_per_page;
  else if(p === 'previous' && offset>0) offset -= items_per_page;
  else offset = 0;
 
 // makeList(list.slice(offset,offset+items_per_page))
  getItems(offset, items_per_page);
  //updateListAndMap();
}


paginate();


