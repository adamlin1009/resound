"use client";

import L from "leaflet";
import React, { useEffect, useRef } from "react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

type Props = {
  center?: number[];
  city?: string;
  state?: string;
  zipCode?: string;
};

function Map({ center, city, state, zipCode }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Default to center of US if no coordinates provided
    const mapCenter = center || [39.8283, -98.5795]; // Geographic center of US
    const zoom = center ? 10 : 4;
    // Clean up any existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Only create map if container exists and has dimensions
      if (containerRef.current && containerRef.current.offsetHeight > 0) {
        try {
          // Create new map
          const map = L.map(containerRef.current).setView(mapCenter as L.LatLngTuple, zoom);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Add marker if we have coordinates
          if (center) {
            const marker = L.marker(center as L.LatLngTuple).addTo(map);
            
            // Add popup content
            const popupContent = `
              <div style="text-align: center;">
                <div style="font-weight: 600;">
                  ${city && state ? `${city}, ${state}` : state || 'Location'}
                </div>
                ${zipCode ? `<div style="font-size: 14px; color: #666;">${zipCode}</div>` : ''}
              </div>
            `;
            marker.bindPopup(popupContent);
          }

          mapRef.current = map;
          
          // Force invalidate size after a brief delay
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          // Error handled internally
        }
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, city, state, zipCode]);

  return (
    <div 
      ref={containerRef}
      className="h-[35vh] rounded-lg"
      style={{ 
        zIndex: 0,
        minHeight: '280px',
        width: '100%'
      }}
    />
  );
}

export default React.memo(Map, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary map re-renders
  return (
    prevProps.center?.[0] === nextProps.center?.[0] &&
    prevProps.center?.[1] === nextProps.center?.[1] &&
    prevProps.city === nextProps.city &&
    prevProps.state === nextProps.state &&
    prevProps.zipCode === nextProps.zipCode
  );
});
