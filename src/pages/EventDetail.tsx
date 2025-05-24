import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { eventsAPI } from "@/lib/api";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, User, ArrowLeft, CalendarCheck, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EventLocationMap from "@/components/EventLocationMap";
import { addToCalendar } from "@/lib/calendar";
import { Skeleton } from "@/components/ui/skeleton";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsAPI.getById(Number(id)),
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="bg-card rounded-xl overflow-hidden">
            <Skeleton className="h-72 md:h-[400px] w-full" />
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-display font-bold mb-4">Etkinlik bulunamadı</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Anasayfaya Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
        
        <div className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-card animate-fade-in">
          <div className="parallax-container relative h-72 md:h-[400px]">
            <div className="parallax-layer animate-parallax-slow">
              <img
                src={getImageUrl(event.image_url)}
                alt={event.title}
                className="h-full w-full object-cover scale-110"
              />
            </div>
            <div className="card-image-overlay" />
            <span className={`absolute top-4 right-4 event-category-badge ${event.category.color_class}`}>
              {event.category.name}
            </span>
            
            <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10 z-10 max-w-xl animate-parallax-medium">
              <h1 className="text-3xl md:text-4xl font-display font-semibold mb-4 text-white drop-shadow-lg">
                {event.title}
              </h1>
              <p className="text-white/90 text-lg hidden md:block drop-shadow-md">
                {event.description.substring(0, 120)}...
              </p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-6 animate-fade-in-delay-1 opacity-0">
                <p className="text-foreground/90 leading-relaxed text-lg">
                  {event.description}
                </p>
                
                <div className="rounded-xl bg-secondary/50 p-5 space-y-4 border border-border">
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
                    <span className="font-medium">{event.address || event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="text-vivid-purple" size={18} />
                    <span className="font-medium">{event.organizer}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 justify-center animate-fade-in-delay-2 opacity-0">
                <div className="rounded-xl border p-8 text-center bg-card">
                  <h3 className="text-2xl font-display font-semibold mb-4">Katılım</h3>
                  {event.requires_registration ? (
                    <>
                      <p className="text-foreground/70 mb-8 leading-relaxed">
                        Bu etkinlik için kayıt gerekmektedir.
                      </p>
                      {event.registration_link ? (
                        <a 
                          href={event.registration_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2"
                        >
                          <Button className="w-full py-6 text-lg rounded-xl bg-vivid-purple hover:bg-vivid-purple/90 transition-all duration-300">
                            Kayıt Ol
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <p className="text-foreground/70">
                          Kayıt bilgileri yakında açıklanacaktır.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-foreground/70 mb-8 leading-relaxed">
                        Bu etkinlik için kayıt gerekmemektedir. Tüm kampüse açıktır.
                      </p>
                      <Button className="w-full py-6 text-lg rounded-xl bg-vivid-purple hover:bg-vivid-purple/90 transition-all duration-300" disabled>
                        Kayıt Gerekmiyor
                      </Button>
                    </>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2 justify-center py-5">
                      <CalendarCheck className="h-4 w-4" />
                      Takvime Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Takvime Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p>{formatDate(event.date)} - {event.time}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => addToCalendar('google', event)}
                        >
                          Google Takvim
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => addToCalendar('outlook', event)}
                        >
                          Outlook
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => addToCalendar('apple', event)}
                        >
                          Apple Takvim
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {event.latitude && event.longitude && (
              <div className="mt-12 animate-fade-in-delay-2 opacity-0">
                <h3 className="text-2xl font-display font-medium mb-4">Konum</h3>
                <EventLocationMap event={event} className="h-[400px] w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
