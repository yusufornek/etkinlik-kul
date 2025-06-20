
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import EventFilters from "@/components/EventFilters";
import Navbar from "@/components/Navbar";
import Stories from "@/components/Stories";
import { eventsAPI, categoriesAPI } from "@/lib/api";
import { Event, Category } from "@/types";

const Index = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Kategorileri çek
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(true),
  });

  // Etkinlikleri çek
  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['events', selectedCategoryId],
    queryFn: () => eventsAPI.getAll({
      category_id: selectedCategoryId || undefined,
      active_only: true,
    }),
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-display font-semibold mb-3 animate-fade-in text-foreground">Kampüs Etkinlikleri</h1>
          <p className="text-muted-foreground leading-relaxed animate-fade-in-delay-1 opacity-0">
            Kampüste gerçekleşecek ücretsiz etkinlikleri keşfedin
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Stories />
          
          <EventFilters
            categories={categories}
            onFilterChange={setSelectedCategoryId}
            currentFilter={selectedCategoryId}
          />
          
          {isLoading && (
            <div role="status" className="text-center py-16">
              <p className="text-muted-foreground">Etkinlikler yükleniyor...</p>
            </div>
          )}
          
          {error && (
            <div role="alert" className="text-center py-16"> {/* Using role="alert" for errors */}
              <p className="text-red-500">Etkinlikler yüklenirken bir hata oluştu.</p>
            </div>
          )}
          
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <div key={event.id} className={`opacity-0 animate-fade-in-delay-${index < 6 ? (index % 3) + 1 : 2}`}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
              
              {events.length === 0 && (
                <div role="status" className="text-center py-16">
                  <p className="text-muted-foreground font-medium">Bu kategoride etkinlik bulunamadı.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;
