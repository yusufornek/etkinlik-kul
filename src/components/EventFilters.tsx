import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface EventFiltersProps {
  categories: Category[];
  onFilterChange: (categoryId: number | null) => void;
  currentFilter: number | null;
}

const EventFilters = ({ categories, onFilterChange, currentFilter }: EventFiltersProps) => {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <Button
        onClick={() => onFilterChange(null)}
        variant={currentFilter === null ? "default" : "outline"}
        size="sm"
        className={`rounded-full transition-all duration-300 ${
          currentFilter === null 
            ? "bg-vivid-purple hover:bg-vivid-purple/90" 
            : "hover:bg-soft-blue hover:text-vivid-purple"
        }`}
      >
        Tümü
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => onFilterChange(category.id)}
          variant={currentFilter === category.id ? "default" : "outline"}
          size="sm"
          className={`rounded-full transition-all duration-300 ${
            currentFilter === category.id 
              ? "bg-vivid-purple hover:bg-vivid-purple/90" 
              : "hover:bg-soft-blue hover:text-vivid-purple"
          }`}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default EventFilters;
