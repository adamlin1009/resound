"use client";

import L from "leaflet";
import React from "react";
// Comment out Leaflet UI imports if MapContainer is not used
// import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"; 

// Comment out image imports if Marker is not used
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css"; // Keep base Leaflet CSS if needed for other parts, or comment out if truly unused
// import Flag from "react-world-flags"; // Comment out if Popup/Flag is not used

// Leaflet icon setup can also be commented out if no markers are rendered
// @ts-ignore
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: markerIcon.src,
//   iconRetinaUrl: markerIcon2x.src,
//   shadowUrl: markerShadow.src,
// });

type Props = {
  center?: number[];
  locationValue?: string;
};

function Map({ center, locationValue }: Props) {
  // The MapContainer and its logic are commented out as per previous request.
  // To make this a valid component for dynamic import, explicitly return null.
  return null;

  // Original commented-out map code:
  /*
  const mapKey = React.useMemo(() => {
    if (center && Array.isArray(center)) {
      return `${locationValue ?? 'default'}-${center.join('-')}`;
    }
    return `default-map`;
  }, [locationValue, center]);

  return (
    <MapContainer
      key={mapKey}
      center={(center as L.LatLngExpression) || [51, -0.09]}
      zoom={center ? 4 : 2}
      scrollWheelZoom={false}
      className="h-[35vh] rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locationValue ? (
        <>
          {center && (
            <Marker position={center as L.LatLngExpression}>
              <Popup>
                <div className="flex justify-center items-center animate-bounce">
                  <Flag code={locationValue} className="w-10" />
                </div>
              </Popup>
            </Marker>
          )}
        </>
      ) : (
        <>{center && <Marker position={center as L.LatLngExpression} />}</>
      )}
    </MapContainer>
  );
  */
}

export default Map;
