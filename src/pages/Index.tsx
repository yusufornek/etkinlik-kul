
import { useState } from "react";
import { events, Event } from "@/data/events";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import Navbar from "@/components/Navbar";
import Stories from "@/components/Stories";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Event["category"] | null>(null);

  const filteredEvents = selectedCategory
    ? events.filter((event) => event.category === selectedCategory)
    : events;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-display font-semibold mb-3 animate-fade-in">Kampüs Etkinlikleri</h1>
          <p className="text-gray-600 leading-relaxed animate-fade-in-delay-1 opacity-0">
            Kampüste gerçekleşecek ücretsiz etkinlikleri keşfedin
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Stories />
          
          <EventFilters
            onFilterChange={setSelectedCategory}
            currentFilter={selectedCategory}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className={`opacity-0 animate-fade-in-delay-${index < 6 ? (index % 3) + 1 : 2}`}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">Bu kategoride etkinlik bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
