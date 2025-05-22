
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

// Örnek Story verileri
const stories = [
  {
    id: "1",
    title: "Bugünün Manşetleri",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&h=800",
    category: "sosyal"
  },
  {
    id: "2",
    title: "Sergi: 'Yakından: Karaya Çıkma'",
    imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=500&h=800",
    category: "sanat"
  },
  {
    id: "3",
    title: "Çar Minar",
    imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=500&h=800",
    category: "education"
  },
  {
    id: "4",
    title: "81. Yılında Kırım Tatar Sürgünü",
    imageUrl: "https://images.unsplash.com/photo-1518877593221-1f28583780b4?auto=format&fit=crop&w=500&h=800",
    category: "education"
  },
  {
    id: "5",
    title: "Nekbe sürecinde kapılarına kilit vuruldu",
    imageUrl: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=500&h=800",
    category: "film"
  }
];

const Stories = () => {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-medium text-gray-800">Güncel Stories</h2>
      </div>
      
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {stories.map((story) => {
            const categoryColorClass = story.category === "film" 
              ? "bg-soft-pink text-vivid-purple" 
              : story.category === "education" 
                ? "bg-soft-green text-green-700"
                : story.category === "social"
                  ? "bg-soft-blue text-vivid-blue"
                  : story.category === "sports"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-purple-100 text-vivid-purple";
                    
            return (
              <CarouselItem 
                key={story.id} 
                className="pl-2 md:pl-4 basis-[180px] md:basis-[200px] cursor-pointer"
                onClick={() => setActiveStoryId(activeStoryId === story.id ? null : story.id)}
              >
                <div className="relative h-full rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-5px] group">
                  <AspectRatio ratio={9/16} className="bg-muted">
                    <div className="absolute inset-0">
                      <img 
                        src={story.imageUrl}
                        alt={story.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                  </AspectRatio>
                  
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">{story.title}</h3>
                    <span className={`${categoryColorClass} text-xs py-1 px-2 rounded-full`}>
                      {story.category}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300",
                    activeStoryId === story.id ? "opacity-100" : "group-hover:opacity-30"
                  )}>
                    {activeStoryId === story.id && (
                      <div className="text-white text-center p-4">
                        <p className="text-sm">İçeriği görmek için tıklayın</p>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 md:-left-10 bg-white/80 hover:bg-white border-none shadow-md" />
        <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 md:-right-10 bg-white/80 hover:bg-white border-none shadow-md" />
      </Carousel>
    </div>
  );
};

export default Stories;
