import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hall, ExternalHall } from '../types';
import { Link } from 'react-router-dom';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const venueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const externalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface VenueMapProps {
  halls: Hall[];
  externalHalls?: ExternalHall[];
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

function MapBoundsUpdater({ halls, userLocation }: { halls: Hall[]; userLocation?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    
    halls.forEach(hall => {
      if (hall.latitude && hall.longitude) {
        points.push([hall.latitude, hall.longitude]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [halls, userLocation, map]);

  return null;
}

export default function VenueMap({ halls, externalHalls = [], userLocation, center, zoom = 12 }: VenueMapProps) {
  const defaultCenter: L.LatLngExpression = center 
    ? [center.lat, center.lng] 
    : userLocation 
      ? [userLocation.lat, userLocation.lng]
      : halls.length > 0 && halls[0].latitude 
        ? [halls[0].latitude, halls[0].longitude]
        : [17.385, 78.4867]; // Default: Hyderabad

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater halls={halls} userLocation={userLocation} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <span className="font-semibold text-red-600">You are here</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Partner venue markers */}
        {halls.map(hall => (
          hall.latitude && hall.longitude && (
            <Marker 
              key={`hall-${hall.id}`} 
              position={[hall.latitude, hall.longitude]}
              icon={venueIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{hall.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{hall.address}, {hall.city}</p>
                  {hall.distance !== null && (
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      {hall.distance} km away
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Partner Venue
                    </span>
                  </div>
                  <Link
                    to={`/halls/${hall.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* External venue markers */}
        {externalHalls.map(hall => (
          hall.latitude && hall.longitude && (
            <Marker 
              key={`external-${hall.placeId}`} 
              position={[hall.latitude, hall.longitude]}
              icon={externalIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{hall.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{hall.address}</p>
                  {hall.rating && (
                    <p className="text-sm text-amber-600 mb-2">
                      ★ {hall.rating} ({hall.userRatingsTotal} reviews)
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Listed Venue
                    </span>
                  </div>
                  <a
                    href={hall.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg bg-slate-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
