
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
        <h1 className="text-2xl font-display font-bold mb-4">Etkinlik bulunamadı</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Anasayfaya Dön
        </Button>
      </div>
    );
  }
  
  const categoryColorClass = getCategoryColor(event.category);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2 hover:bg-soft-blue transition-colors duration-300"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Geri Dön
        </Button>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-card animate-fade-in">
          <div className="relative h-72 md:h-[400px]">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="card-image-overlay" />
            <span className={`absolute top-4 right-4 event-category-badge ${categoryColorClass}`}>
              {getCategoryName(event.category)}
            </span>
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-display font-semibold mb-6">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-6 animate-fade-in-delay-1 opacity-0">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {event.description}
                </p>
                
                <div className="rounded-xl bg-gray-50 p-5 space-y-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-vivid-purple" size={18} />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-vivid-purple" size={18} />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-vivid-purple" size={18} />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="text-vivid-purple" size={18} />
                    <span className="font-medium">{event.organizer}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center animate-fade-in-delay-2 opacity-0">
                <div className="rounded-xl border p-8 text-center">
                  <h3 className="text-2xl font-display font-semibold mb-4">Katılım</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Bu etkinlik ücretsizdir ve tüm kampüse açıktır.
                  </p>
                  <Button className="w-full py-6 text-lg rounded-xl bg-vivid-purple hover:bg-vivid-purple/90 transition-all duration-300">
                    Katılıyorum
                  </Button>
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
