
import { useState } from "react";
import { events, Event } from "@/data/events";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Event["category"] | null>(null);

  const filteredEvents = selectedCategory
    ? events.filter((event) => event.category === selectedCategory)
    : events;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kampüs Etkinlikleri</h1>
          <p className="text-gray-600">
            Kampüste gerçekleşecek ücretsiz etkinlikleri keşfedin
          </p>
        </div>
        
        <EventFilters
          onFilterChange={setSelectedCategory}
          currentFilter={selectedCategory}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="animate-fade-in">
              <EventCard event={event} />
            </div>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Bu kategoride etkinlik bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
