
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Event } from "@/data/events";
import { Loader2 } from "lucide-react";

interface EventLocationMapProps {
  event: Event;
  className?: string;
}

const EventLocationMap = ({ event, className = "" }: EventLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Bu değeri kendi Mapbox token'ınızla değiştirin
  // Not: Bu bir geçici çözümdür. Gerçek uygulamalarda token'ı güvenli bir şekilde yönetin
  const MAPBOX_TOKEN = "pk.eyJ1IjoiZGVtbyIsImEiOiJja2FzMHc1Z3MwOXBvMzFudzh0d296YnpoIn0.dRTwNwEeeUVIYe1QQ6Zs9g";

  useEffect(() => {
    if (!event.coordinates || !mapContainer.current) return;

    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [event.coordinates.lng, event.coordinates.lat],
        zoom: 14,
        attributionControl: false
      });

      // Harita yüklendiğinde işaretçi ekle
      map.current.on("load", () => {
        setLoading(false);
        
        if (map.current && event.coordinates) {
          // Marker ekle
          new mapboxgl.Marker({ color: "#8B5CF6" })
            .setLngLat([event.coordinates.lng, event.coordinates.lat])
            .addTo(map.current);
          
          // Popup ekle
          new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat([event.coordinates.lng, event.coordinates.lat])
            .setHTML(`<strong>${event.title}</strong><p>${event.address || event.location}</p>`)
            .addTo(map.current);
        }
      });

      // Kontroller ekle
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [event.coordinates, event.title, event.address, event.location]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div
        ref={mapContainer}
        className={`w-full h-full min-h-[300px] bg-muted transition-opacity duration-500 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default EventLocationMap;
