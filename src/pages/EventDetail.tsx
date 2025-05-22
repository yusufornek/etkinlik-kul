
import { useParams, Link, useNavigate } from "react-router-dom";
import { events, getCategoryColor, getCategoryName } from "@/data/events";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, User, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = events.find((e) => e.id === id);
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Etkinlik bulunamadı</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Anasayfaya Dön
        </Button>
      </div>
    );
  }
  
  const categoryColorClass = getCategoryColor(event.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Geri Dön
        </Button>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="relative h-64 md:h-96">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <span className={`absolute top-4 right-4 event-category-badge ${categoryColorClass}`}>
              {getCategoryName(event.category)}
            </span>
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  {event.description}
                </p>
                
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-500" size={18} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-500" size={18} />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-500" size={18} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="text-gray-500" size={18} />
                    <span>{event.organizer}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="rounded-lg border p-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">Katılım</h3>
                  <p className="text-gray-600 mb-6">
                    Bu etkinlik ücretsizdir ve tüm kampüse açıktır.
                  </p>
                  <Button className="w-full">Katılıyorum</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
