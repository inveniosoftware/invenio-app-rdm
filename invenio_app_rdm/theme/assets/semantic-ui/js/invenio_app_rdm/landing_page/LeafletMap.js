import React, { Component } from "react";
import { MapContainer, TileLayer, WMSTileLayer, } from "react-leaflet";

export class LeafletMap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { wmsresource } = this.props;
    const position = [37.492, 15.070];
    const wmsopts = wmsresource.wms_params;

    return (
      <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <WMSTileLayer
          url= { wmsresource.wms_url }
          params= { wmsopts }
          opacity= { 0.4 }
        />
      </MapContainer>
    );
  }
};
