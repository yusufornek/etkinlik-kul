
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn, getImageUrl } from "@/lib/utils";
import { storiesAPI } from "@/lib/api";
import { Story } from "@/types";

const Stories = () => {
  const [activeStoryId, setActiveStoryId] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);

  // API'den story'leri çek
  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: () => storiesAPI.getAll(true),
  });

  // Open a specific story by id
  const openStory = (id: number) => {
    setActiveStoryId(id);
    const index = stories.findIndex(story => story.id === id);
    if (index !== -1) {
      setCurrentStoryIndex(index);
    }
  };

  // Close the story view
  const closeStory = () => {
    setActiveStoryId(null);
  };

  // Navigate to the next story
  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setActiveStoryId(stories[nextIndex].id);
    } else {
      closeStory(); // Close if we're at the last story
    }
  };

  // Navigate to the previous story
  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setActiveStoryId(stories[prevIndex].id);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activeStoryId) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextStory();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevStory();
      } else if (e.key === 'Escape') {
        closeStory();
      }
    }
  };

  return (
    <div className="mb-12" onKeyDown={handleKeyDown} tabIndex={-1}>
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
          {stories.map((story) => (
            <CarouselItem 
              key={story.id} 
              className="pl-2 md:pl-4 basis-[180px] md:basis-[200px] cursor-pointer"
              onClick={() => openStory(story.id)}
            >
              <div className="relative h-full rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-5px] group">
                <AspectRatio ratio={9/16} className="bg-muted">
                  <div className="absolute inset-0">
                    <img 
                      src={getImageUrl(story.image_url)}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                </AspectRatio>
                
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{story.title}</h3>
                </div>
                
                <div className={cn(
                  "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300",
                  activeStoryId === story.id ? "opacity-100" : "group-hover:opacity-30"
                )}>
                  <div className="text-white text-center p-4">
                    <p className="text-sm">Görüntülemek için tıklayın</p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 md:-left-10 bg-white/80 hover:bg-white border-none shadow-md" />
        <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 md:-right-10 bg-white/80 hover:bg-white border-none shadow-md" />
      </Carousel>

      {/* Story Viewer Modal */}
      {activeStoryId && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={closeStory}>
          <div 
            className="relative w-full max-w-md h-[80vh] sm:h-[85vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Current Story */}
            {stories[currentStoryIndex] && (
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
                  {stories.map((story, index) => (
                    <div 
                      key={story.id} 
                      className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden"
                    >
                      <div 
                        className={`h-full bg-white transition-all ${
                          index < currentStoryIndex ? "w-full" : 
                          index === currentStoryIndex ? "w-full animate-[progress_5s_linear]" : 
                          "w-0"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Story Image */}
                <img 
                  src={getImageUrl(stories[currentStoryIndex].image_url)} 
                  alt={stories[currentStoryIndex].title}
                  className="h-full w-full object-cover"
                />
                
                {/* Story Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  {/* Close Button */}
                  <button 
                    onClick={closeStory}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={18} />
                  </button>
                  
                  {/* Navigation Controls */}
                  <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => {e.stopPropagation(); prevStory();}} />
                  <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => {e.stopPropagation(); nextStory();}} />
                  
                  {/* Story Info */}
                  <div className="absolute bottom-10 left-0 right-0 p-6 text-white">
                    <h2 className="text-2xl font-display font-semibold mb-2">
                      {stories[currentStoryIndex].title}
                    </h2>
                    {stories[currentStoryIndex].link_url && (
                      <a 
                        href={stories[currentStoryIndex].link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Detayları Gör
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Previous/Next Buttons (visible on hover) */}
                <div className="absolute inset-y-0 left-4 hidden sm:flex items-center opacity-0 hover:opacity-100 transition-opacity">
                  <button 
                    onClick={prevStory}
                    disabled={currentStoryIndex === 0}
                    className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white transition-colors ${
                      currentStoryIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/60'
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-4 hidden sm:flex items-center opacity-0 hover:opacity-100 transition-opacity">
                  <button 
                    onClick={nextStory}
                    disabled={currentStoryIndex === stories.length - 1}
                    className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white transition-colors ${
                      currentStoryIndex === stories.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/60'
                    }`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
