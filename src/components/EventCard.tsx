import { Event } from "@/types";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { formatDate, getImageUrl } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link to={`/event/${event.id}`} className="event-card block overflow-hidden bg-card text-card-foreground border border-border">
      <div className="relative h-56 overflow-hidden rounded-t-xl">
        <img
          src={getImageUrl(event.image_url)}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="card-image-overlay" />
        <span className={`absolute top-3 right-3 event-category-badge ${event.category.color_class} ${event.category.text_color_class}`}>
          {event.category.name}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-medium mb-2 line-clamp-1 text-foreground">{event.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" aria-hidden="true" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" aria-hidden="true" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
