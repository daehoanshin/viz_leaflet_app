define([
  "jquery",
  "underscore",
  "api/SplunkVisualizationBase",
  "api/SplunkVisualizationUtils",
  "d3",
  "leaflet",
  "../lib/leaflet-providers.js",
], function (
  $,
  _,
  SplunkVisualizationBase,
  SplunkVisualizationUtils,
  d3,
  L,
  Lpv
) {
  return SplunkVisualizationBase.extend({
    contribUri: "/en-US/static/app/viz_leaflet_app/visualizations/leaflet/lib/",

    initialize: function () {
      SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
      // Save this.$el for convenience
      this.$el = $(this.el);

      // Add a css selector class
      this.$el.addClass("splunk-leaflet-kr");
    },

    getInitialDataParams: function () {
      return {
        outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
        count: 10000,
      };
    },

    // display view
    updateView: function (data, config) {
      try {
        console.log(data);
        var container = L.DomUtil.get("mapid");

        let markers = [];
        let marker = {};
        let copy = {};
        let datalength = data.rows.length;

        // data length 0 handle
        if (datalength == 0) {
          return;
        }

        data.rows.forEach((row, idx) => {
          data.fields.forEach((field, index) => {
            marker[field.name] = row[index];
            // deep copy
            copy = Object.assign({}, marker);
          });

          markers.push(copy);
        });

        L.Icon.Default.imagePath =
          location.origin + this.contribUri + "images/";

        /*** multi popup ***/
        L.Map = L.Map.extend({
          openPopup: function (popup) {
            //this.closePopup();  // just comment this
            this._popup = popup;

            return this.addLayer(popup).fire("popupopen", {
              popup: this._popup,
            });
          },
        });
        console.log(container._leaflet_id);
        // check logic : leaflet Error: Map container is already initialized
        if (container._leaflet_id == undefined) {
          var map = (this.map = new L.map("mapid", {
            continuousWorld: true,
            worldCopyJump: false,
            zoomControl: true,
            center: [36, 128],
            zoom: 7,
          }));
          // layer
          var baseLayers = {
            "VWorld Street Map": L.tileLayer.provider("VWorld.Street"),
            "VWorld Satellite Map": L.tileLayer
              .provider("VWorld.Satellite")
              .addTo(map),
            "OpenStreetMap German Style": L.tileLayer.provider(
              "OpenStreetMap.DE"
            ),
            "OpenStreetMap Black and White": L.tileLayer.provider(
              "OpenStreetMap.BlackAndWhite"
            ),
            "Esri WorldStreetMap": L.tileLayer.provider("Esri.WorldStreetMap"),
          };

          // overlay layer
          var overlayLayers = {
            "VWorld Hybrid Map": L.tileLayer
              .provider("VWorld.Hybrid")
              .addTo(map),
          };

          // layer add
          L.control
            .layers(baseLayers, overlayLayers, { collapsed: true })
            .addTo(map);

          if (datalength > 0) {
            // marker setting
            markers.forEach((marker) => {
              L.marker([marker.x, marker.y])
                .addTo(map)
                .bindPopup(marker.msg)
                .openPopup();
            });
          }

          container._leaflet_id = "init";
        }
      } catch (error) {
        console.log(error);
      }
      return this;
    },
  });
});
