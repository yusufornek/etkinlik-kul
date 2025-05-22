
import { Event, getCategoryColor, getCategoryName } from "@/data/events";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const categoryColorClass = getCategoryColor(event.category);
  
  return (
    <Link to={`/event/${event.id}`} className="event-card block overflow-hidden bg-white">
      <div className="relative h-56 overflow-hidden rounded-t-xl">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="card-image-overlay" />
        <span className={`absolute top-3 right-3 event-category-badge ${categoryColorClass}`}>
          {getCategoryName(event.category)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-medium mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-vivid-purple" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-vivid-purple" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-vivid-purple" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
