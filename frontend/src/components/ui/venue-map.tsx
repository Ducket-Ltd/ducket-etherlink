import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface VenueMapProps {
  lat?: number;
  lng?: number;
  className?: string;
}

// Component to update map center when coordinates change
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);

  return null;
}

export function VenueMap({ lat, lng, className }: VenueMapProps) {
  const hasCoordinates = lat !== undefined && lng !== undefined && lat !== 0 && lng !== 0;

  if (!hasCoordinates) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center text-muted-foreground ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm">Enter a venue address to see the location on the map</p>
        </div>
      </div>
    );
  }

  // Use a key based on coordinates to force re-mount when location changes significantly
  // This ensures the map properly renders when coordinates are first set
  const mapKey = `map-${lat.toFixed(4)}-${lng.toFixed(4)}`;

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      <MapContainer
        key={mapKey}
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: '200px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

export default VenueMap;
