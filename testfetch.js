fetch("http://localhost/collections.json", { mode: "cors" })
  .then(function (response) {
    if (response.status !== 200) {
      console.log(
        "Looks like there was a problem. Status Code: " + response.status
      );
      return;
    }

    // Examine the text in the response
    response.json().then(function (data) {
      console.log(data.results.length);

      var listContent = [];
      data.results.forEach((result) => {
        var additionalInfos = result.additionalInfos;
        if (additionalInfos) {
          var marker;
          var coords = [];
          additionalInfos.forEach((info) => {
            /*  Object.entries(info).forEach(([key, value]) => {
                        console.log("key:  "+ key);
                        console.log("value:  "+ value);
                    });*/
            if (info.label == "Geo-coordinates") {
              coords.push({ coordinate: info.text });

              /**listContent.push({
                title: result.title,
                id: result.id,
                coordinate: info.text,
              });
              console.log("Coordinates: "+ coordinates)
                */

              var latLng = info.text.replace(" ", "").split(",");
              var lat = parseFloat(latLng[0]);
              var lng = parseFloat(latLng[1]);
              marker = L.marker([lat, lng]);
              marker.addTo(map);

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
            }
          });
          if (coords.length !== 0) {
            listContent.push({
              title: result.title,
              id: result.id,
              coordinates: coords,
              marker: marker,
            });
          }
        }
      });

      console.log(listContent);
      makeList(listContent);
    });
  })
  .catch(function (err) {
    console.log("Fetch Error :-S", err);
  });

var map = L.map("map").setView([40, 0], 2);
L.tileLayer(
  "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=hMlLEQcFQEshE4YQVA2W",
  {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  }
).addTo(map);

L.control
  .scale({
    metric: true,
    imperial: false,
    position: "topright",
  })
  .addTo(map);

function makeList(listContent) {
  var listContainer = document.getElementById("collectionsList");
  // Make a container element for the list

  /*(listContainer = document.createElement("div")),
    // Make the list
    (listElement = document.createElement("ul")),
    // Add it to the page
    document.getElementsByTagName("body")[0].appendChild(listContainer);
  listContainer.appendChild(listElement);*/

  listContent.forEach((element) => {
    // create an item for each one
    listItem = document.createElement("li");

    // Add the item text
    listItem.innerHTML = element.coordinates;
    listItem.innerHTML =
      '<a class = "animation" href="' +
      "https://edmond.mpdl.mpg.de/imeji/collection/" +
      element.id +
      '" target="_blank">' +
      element.title +
      "</a>";

    listItem.onmouseover = function () {
      console.log(element.title);
      console.log(element.coordinates);
      element.marker.openPopup();
    };
    /*
      listItem.onmouseover = function () {
      console.log(element.title);
      console.log(element.coordinates);

      element.coordinates.forEach((value) => {
        var latLng = value.coordinate.replace(" ", "").split(",");
        var lat = parseFloat(latLng[0]);
        var lng = parseFloat(latLng[1]);
        var marker = L.marker([lat, lng]);
        marker.addTo(map);
        marker
          .bindPopup(
            '<a class = "animation" href="' +
              "https://edmond.mpdl.mpg.de/imeji/collection/" +
              element.id +
              '" target="_blank">' +
              "<b>" +
              element.title +
              "</b><br>[" +
              value.coordinate +
              "]" +
              "</a>"
          )
          .openPopup();
      });
    };*/

    // Add listItem to the listElement
    listContainer.appendChild(listItem);
  });
}
