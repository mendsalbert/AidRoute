"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, AlertTriangle, Zap, Activity } from "lucide-react";

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Import Leaflet for custom icons
let L: any = null;
if (typeof window !== "undefined") {
  import("leaflet").then((leaflet) => {
    L = leaflet.default;
  });
}

interface DisasterEvent {
  link?: string;
  eventType: string;
  typeName: string;
  location: string;
  urgency: string;
  severity: number;
  title: string;
  pubDate?: string;
  lat?: number;
  lng?: number;
}

interface DisasterMapProps {
  events: DisasterEvent[];
  onEventSelect: (event: DisasterEvent) => void;
  selectedEvent?: DisasterEvent | null;
}

// Custom marker component
const DisasterMarker = ({
  event,
  onSelect,
}: {
  event: DisasterEvent;
  onSelect: (event: DisasterEvent) => void;
}) => {
  const [customIcon, setCustomIcon] = useState<any>(null);

  const getMarkerColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "#ef4444"; // red-500
      case "high":
        return "#f97316"; // orange-500
      case "medium":
        return "#eab308"; // yellow-500
      default:
        return "#22c55e"; // green-500
    }
  };

  useEffect(() => {
    if (L) {
      const color = getMarkerColor(event.urgency);
      const icon = L.divIcon({
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        className: "custom-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });
      setCustomIcon(icon);
    }
  }, [event.urgency]);

  if (!customIcon) {
    return null;
  }

  return (
    <Marker
      position={[event.lat || 0, event.lng || 0]}
      icon={customIcon}
      eventHandlers={{
        click: () => onSelect(event),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getMarkerColor(event.urgency) }}
            ></div>
            <span className="font-medium text-sm">{event.typeName}</span>
          </div>
          <p className="text-sm font-medium mb-1">{event.location}</p>
          <p className="text-xs text-gray-600 mb-2">{event.title}</p>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-gray-600">
              Severity: {event.severity}/5
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export function DisasterMap({
  events,
  onEventSelect,
  selectedEvent,
}: DisasterMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add coordinates to events if they don't have them
  const eventsWithCoords = events.map((event) => {
    if (event.lat && event.lng) {
      return event;
    }

    // Realistic coordinates for common disaster locations
    const locationCoords: { [key: string]: { lat: number; lng: number } } = {
      // Earthquakes
      Turkey: { lat: 39.9334, lng: 32.8597 },
      "Turkey, Syria": { lat: 37.0, lng: 37.0 },
      Japan: { lat: 35.6762, lng: 139.6503 },
      California: { lat: 36.7783, lng: -119.4179 },
      Haiti: { lat: 18.9712, lng: -72.2852 },
      Nepal: { lat: 28.3949, lng: 84.124 },
      Indonesia: { lat: -6.2088, lng: 106.8456 },
      Chile: { lat: -35.6751, lng: -71.543 },
      "New Zealand": { lat: -41.2865, lng: 174.7762 },

      // Hurricanes/Cyclones
      Caribbean: { lat: 18.2208, lng: -66.5901 },
      Florida: { lat: 27.7663, lng: -82.6404 },
      Louisiana: { lat: 30.9843, lng: -91.9623 },
      Texas: { lat: 29.7604, lng: -95.3698 },
      "North Carolina": { lat: 35.7596, lng: -79.0193 },
      "South Carolina": { lat: 33.8361, lng: -81.1637 },
      Georgia: { lat: 32.1656, lng: -82.9001 },
      Alabama: { lat: 32.3182, lng: -86.9023 },
      Mississippi: { lat: 32.3547, lng: -89.3985 },

      // Floods
      Bangladesh: { lat: 23.685, lng: 90.3563 },
      India: { lat: 20.5937, lng: 78.9629 },
      Pakistan: { lat: 30.3753, lng: 69.3451 },
      China: { lat: 35.8617, lng: 104.1954 },
      Thailand: { lat: 15.87, lng: 100.9925 },
      Vietnam: { lat: 14.0583, lng: 108.2772 },
      Philippines: { lat: 12.8797, lng: 121.774 },
      Myanmar: { lat: 21.9162, lng: 95.956 },

      // Wildfires
      Australia: { lat: -25.2744, lng: 133.7751 },
      "California, USA": { lat: 36.7783, lng: -119.4179 },
      Oregon: { lat: 43.8041, lng: -120.5542 },
      Washington: { lat: 47.7511, lng: -120.7401 },
      Montana: { lat: 46.8797, lng: -110.3626 },
      Idaho: { lat: 44.0682, lng: -114.742 },
      Nevada: { lat: 38.4199, lng: -117.1219 },
      Arizona: { lat: 33.4484, lng: -112.074 },
      "New Mexico": { lat: 34.5199, lng: -105.8701 },
      Colorado: { lat: 39.0598, lng: -105.3111 },
      Utah: { lat: 39.3209, lng: -111.0937 },
      Wyoming: { lat: 41.1403, lng: -104.8198 },

      // Volcanoes
      Hawaii: { lat: 19.8968, lng: -155.5828 },
      Iceland: { lat: 64.9631, lng: -19.0208 },
      Italy: { lat: 41.8719, lng: 12.5674 },
      "Indonesia, Java": { lat: -7.7956, lng: 110.3695 },
      "Philippines, Luzon": { lat: 14.5995, lng: 120.9842 },
      "Japan, Kyushu": { lat: 32.7503, lng: 129.8779 },
      Mexico: { lat: 19.4326, lng: -99.1332 },
      Ecuador: { lat: -1.8312, lng: -78.1834 },
      "Chile, Andes": { lat: -33.4489, lng: -70.6693 },
      Peru: { lat: -12.0464, lng: -77.0428 },

      // Droughts
      Somalia: { lat: 5.1521, lng: 46.1996 },
      Ethiopia: { lat: 9.145, lng: 40.4897 },
      Kenya: { lat: -0.0236, lng: 37.9062 },
      Sudan: { lat: 12.8628, lng: 30.2176 },
      Chad: { lat: 15.4542, lng: 18.7322 },
      Niger: { lat: 17.6078, lng: 8.0817 },
      Mali: { lat: 17.5707, lng: -3.9962 },
      "Burkina Faso": { lat: 12.2383, lng: -1.5616 },
      Senegal: { lat: 14.4974, lng: -14.4524 },
      Mauritania: { lat: 21.0079, lng: -10.9408 },
    };

    // Try to find exact match first
    let coords = locationCoords[event.location];

    // If no exact match, try partial matching
    if (!coords) {
      for (const [location, coord] of Object.entries(locationCoords)) {
        if (
          event.location.toLowerCase().includes(location.toLowerCase()) ||
          location.toLowerCase().includes(event.location.toLowerCase())
        ) {
          coords = coord;
          break;
        }
      }
    }

    // If still no match, generate coordinates based on location hash
    if (!coords) {
      const locationHash = event.location.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      coords = {
        lat: 20 + (Math.abs(locationHash) % 40) - 20, // -20 to +20 degrees
        lng: -100 + (Math.abs(locationHash) % 200) - 100, // -100 to +100 degrees
      };
    }

    return {
      ...event,
      lat: coords.lat,
      lng: coords.lng,
    };
  });

  if (!isClient) {
    return (
      <div className="bg-secondary/20 rounded-lg p-4 h-80 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 rounded-lg h-80 relative overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {eventsWithCoords.map((event, index) => (
          <DisasterMarker
            key={event.link || index}
            event={event}
            onSelect={onEventSelect}
          />
        ))}
      </MapContainer>

      {/* Map overlay with legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-medium mb-2">Disaster Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Data</span>
        </div>
      </div>
    </div>
  );
}
