<template>
  <div class="parent">
    <div class="titleBar">
      <img src="~../assets/icon.svg">
    </div>
    <div id="mymap"></div>
    <span>
      <messagebox ref="msgbox"/>
    </span>
    <bus-button id="busbutton" v-on:bus-click="busClicked()" v-if="busButtonActive" />
  </div>
</template>

<script lang="ts">
// This component handles everything on the shuttle tracker that is publicly facing.

import Vue from 'vue';
import InfoService from '../structures/serviceproviders/info.service';
import Vehicle from '../structures/vehicle';
import Route from '../structures/route';
import Stop from '../structures/stop';
import messagebox from './adminmessage.vue';
import * as L from 'leaflet';
import { setTimeout, setInterval } from 'timers';
import getMarkerString from '../structures/leaflet/rotatedMarker';
import { Position } from 'geojson';
import Fusion from '@/fusion';
import UserLocationService from '@/structures/userlocation.service';
import BusButton from '@/components/busbutton.vue';
import AdminMessageUpdate from '@/structures/adminMessageUpdate';

const StopSVG = require('@/assets/circle.svg') as string;
const UserSVG = require('@/assets/user.svg') as string;

const StopIcon = L.icon({
  iconUrl: StopSVG,
  iconSize: [12, 12], // size of the icon
  iconAnchor: [6, 6], // point of the icon which will correspond to marker's location
  shadowAnchor: [6, 6], // the same for the shadow
  popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
});

export default Vue.extend({
  name: 'Public',
  data() {
    return {
      vehicles: [],
      routes: [],
      stops: [],
      ready: false,
      Map: undefined,
      existingRouteLayers: [],
      userShuttleidCount: 0,
      initialized: false,
      legend: new L.Control({ position: 'bottomleft' }),
      locationMarker: undefined,
      fusion: new Fusion(),
    } as {
        vehicles: Vehicle[];
        routes: Route[];
        stops: Stop[];
        ready: boolean;
        Map: L.Map | undefined; // Leaflets types are not always useful
        existingRouteLayers: L.Polyline[];
        initialized: boolean;
        legend: L.Control;
        locationMarker: L.Marker | undefined;
        userShuttleidCount: number;
        fusion: Fusion;
      };
  },
  mounted() {
    const ls = UserLocationService.getInstance();

    const a = new InfoService();
    this.$store.dispatch('grabRoutes');
    this.$store.dispatch('grabStops');
    this.$store.dispatch('grabVehicles');
    this.$store.dispatch('grabUpdates');
    this.$store.dispatch('grabAdminMesssage');
    setInterval(() => {
      this.$store.dispatch('grabUpdates');
    }, 5000);

    this.$nextTick(() => {
      this.ready = true;
      this.Map = L.map('mymap', {
        zoomControl: false,
        attributionControl: false,
      });

      this.Map.addControl(L.control.attribution({
          position: 'bottomright',
          prefix: '',
        }),
      );
      L.tileLayer(
        'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
        {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
            'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
            'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ' +
            '<a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
          maxZoom: 17,
          minZoom: 14,
        },
      ).addTo(this.Map);

      this.Map.invalidateSize();
      this.showUserLocation();
    });
    this.renderRoutes();
    this.$store.subscribe((mutation: any, state: any) => {
      if (mutation.type === 'setRoutes') {
        this.renderRoutes();
        this.updateLegend();
      }
      if (mutation.type === 'setStops') {
        this.renderStops();
      }
      if (mutation.type === 'setVehicles') {
        this.addVehicles();
      }
    });

    this.fusion.start();
    this.fusion.registerMessageReceivedCallback(this.saucyspawn);
  },
  computed: {
    message(): AdminMessageUpdate {
        return this.$store.state.adminMessage;
    },
    busButtonActive(): boolean {
      return this.$store.getters.getBusButtonVisible;
    },
  },
  methods: {
    spawn() {
      this.spawnShuttleAtPosition(UserLocationService.getInstance().getCurrentLocation());
    },
    saucyspawn(message: any) {
      if (message.type !== 'bus_button') {
        return;
      }
      this.spawnShuttleAtPosition(message.message);
    },
    updateLegend() {
      this.legend.onAdd = (map: L.Map) => {
        const div = L.DomUtil.create('div', 'info legend');
        let legendstring = '';
        this.$store.state.Routes.forEach((route: Route) => {
          if (route.shouldShow()) {
            legendstring +=
              `<li><img class="legend-icon" src=` +
              getMarkerString(route.color) +
              `
			      width="12" height="12"> ` +
              route.name;
          }
        });
        div.innerHTML =
          `<ul style="list-style:none">
					<li><img class="legend-icon" src='` +
          UserSVG +
          `' width="12" height="12"> You</li>` +
          legendstring +
          `<li><img class="legend-icon" src="` +
          StopSVG +
          `" width="12" height="12"> Shuttle Stop</li>
				</ul>`;
        return div;
      };
      if (this.Map !== undefined) {
        this.legend.addTo(this.Map);
      }
    },
    routePolyLines(): L.Polyline[] {
      return this.$store.getters.getRoutePolyLines;
    },
    renderRoutes() {
      if (this.routePolyLines().length > 0 && !this.initialized) {
        if (
          this.Map !== undefined &&
          !this.$store.getters.getBoundsPolyLine.isEmpty()
        ) {
          this.initialized = true;
          this.Map.fitBounds(this.$store.getters.getBoundsPolyLine.getBounds());
        }
      }
      this.existingRouteLayers.forEach((line) => {
        if (this.Map !== undefined) {
          this.Map.removeLayer(line);
        }
      });
      this.existingRouteLayers = new Array<L.Polyline>();
      this.routePolyLines().forEach((line: L.Polyline) => {
        if (this.Map !== undefined) {
          this.Map.addLayer(line);
          this.existingRouteLayers.push(line);
        }
      });
    },
    renderStops() {
      this.$store.state.Stops.forEach((stop: Stop) => {
        const marker = L.marker([stop.latitude, stop.longitude], {
          icon: StopIcon,
        });
        if (this.Map !== undefined) {
          var stop_link = stop.name.link('/register');

          marker.bindPopup(stop_link);
          marker.addTo(this.Map);
        }
      });
    },
    addVehicles() {
      this.$store.state.Vehicles.forEach((veh: Vehicle) => {
        if (this.Map !== undefined) {
          veh.addToMap(this.Map);
        }
      });
    },
    spawnShuttleAtPosition(position: any) {
      if (!this.$store.getters.getBusButtonShowBuses) {
        return;
      }
      this.userShuttleidCount ++;
      const busIcon = L.divIcon({
        html: `<span class="shuttleusericon shuttleusericon` + String(this.userShuttleidCount) +  `" >🚐</span>`,

        iconSize: [20, 20], // size of the icon
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        shadowAnchor: [6, 6], // the same for the shadow
        popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
      });
      const x = L.marker(
        [position.latitude, position.longitude],
        {
          icon: busIcon,
          zIndexOffset: 1000,
        },
      );
      if (this.Map !== undefined) {
        x.addTo(this.Map);
        setTimeout(() => {
          if (this.Map !== undefined) {
            this.Map.removeLayer(x);
          }
        }, 2000);
      }
    },
    showUserLocation() {
      const userIcon = new L.Icon({
        iconUrl: UserSVG,

        iconSize: [12, 12], // size of the icon
        iconAnchor: [6, 6], // point of the icon which will correspond to marker's location
        shadowAnchor: [6, 6], // the same for the shadow
        popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
      });


      UserLocationService.getInstance().registerCallback((position) => {
        if (this.locationMarker === undefined) {
          this.locationMarker = L.marker(
              [position.coords.latitude, position.coords.longitude],
              {
                icon: userIcon,
                zIndexOffset: 1000,
              },
            );

        } else {
          this.locationMarker.setLatLng([position.coords.latitude, position.coords.longitude]);
        }
        const locationMarkerOptions = {
            name: 'You are here',
            marker: this.locationMarker,
          };
        locationMarkerOptions.marker.bindPopup(locationMarkerOptions.name);
        if (this.Map !== undefined) {
            locationMarkerOptions.marker.addTo(this.Map);
          }
      });

    },
    busClicked() {
      this.fusion.sendBusButton();
    },
  },
  components: {
    messagebox,
    BusButton,
  },
});
</script>

<style lang="scss">
.parent {
  padding: 0px;
  margin: 0px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

#mymap {
  flex: 1;
  z-index: 0
}

.titleBar {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  border-bottom: 0.5px solid #eee;
  box-shadow: 0 -3px 8px 0 #ddd;
  user-select: none;
  background: white;
  z-index: 1;

  img {
    flex: 1;
    height: 70%;
  }
}

.info.legend {
  box-shadow: rgba(0, 0, 0, 0.8) 0px 1px 1px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px;
  bottom: 25px;

  & ul {
    margin-top: 2px;
    margin-bottom: 2px;
    padding-left: 0px;
  }
}

.shuttleusericon{
  background-color: transparent;
  border: none;
  animation: fadeOutUp 2s ease;
  display: block;
  font-size: 20px; 
  bottom: 0px; 
  right: 0px;
  z-index: 2000 !important;
}

@keyframes fadeOutUp {
   0% {
      opacity: 1;
      transform: translateY(0);
   }
   100% {
      opacity: 0;
      transform: translateY(-40px);
   }
} 

.leaflet-div-icon {
  background: transparent !important;
  border: none !important;
  width: 20px !important;
  height: 20px !important;

}
#busbutton{
  position: absolute; 
  right: 25px; 
  bottom: 35px; 
  z-index: 2000;
}
</style>
