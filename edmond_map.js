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

//Fetch collections.json from server, parse it and visualize in the map.
//fetch("https://qa-edmond.mpdl.mpg.de/edmond-map/EdmondMap/collections.json", {
fetch("http://localhost/collections.json", {
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
    response.json().then(function (data) {
      var listContent = [];
      //Iterating over results in data and creating listcontent items
      data.results.forEach((result) => {
        var listContentElement = createListContentElement(result);
        if (listContentElement != null) {
          listContent.push(listContentElement);
        }
      });

      makeList(listContent);
    });
  })
  .catch(function (err) {
    console.log("Fetch Error :-S", err);
  });

/**
 * Creates new listContentElement Object from given result
 * only if result contains coordinates.
 * @param {*} result Result Object from json file
 * @returns listContentElement or null if result has no coordinates
 */
function createListContentElement(result) {
  var additionalInfos = result.additionalInfos;
  if (additionalInfos) {
    var marker;
    var coords = [];
    additionalInfos.forEach((info) => {
      if (info.label == "Geo-coordinates") {
        coords.push({ coordinate: info.text });
        marker = createMarker(info, result);
      }
    });
    // Check if coordinates exist and return listContentElement Object
    if (coords.length !== 0) {
      return {
        title: result.title,
        id: result.id,
        coordinates: coords,
        marker: marker,
      };
    } else return null;
  }
}

/**
 * Creates marker from info and result, by parsing coordinates and creating marker
 * with title, text and link to edmond page
 * @param {} info contains coordinates from json
 * @param {*} result contains name and text of given entry
 * @returns created marker
 */
function createMarker(info, result) {
  // Parse and add coordinates to a marker
  var latLng = info.text.replace(" ", "").split(",");
  var lat = parseFloat(latLng[0]);
  var lng = parseFloat(latLng[1]);
  marker = L.marker([lat, lng]);
  marker.addTo(map);
  // Create link to an Edmond page through the marker popup
  marker.bindPopup(
    '<a class = "animation" href="' +
      "https://edmond.mpdl.mpg.de/imeji/collection/" +
      result.id +
      '" target="_blank">' +
      "<b>" +
      result.title +
      "</b><br>[" +
      info.text +
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
    listItem = document.createElement("li");
    listItem.innerHTML = element.coordinates;
    listItem.innerHTML =
      '<a class = "animation" href="' +
      "https://edmond.mpdl.mpg.de/imeji/collection/" +
      element.id +
      '" target="_blank">' +
      element.title +
      "</a>";
    // A marker appears on the map with the data popup
    listItem.onmouseover = function () {
      element.marker.openPopup();
    };
    // Add listItem to the listElement
    listContainer.appendChild(listItem);
  });
}
