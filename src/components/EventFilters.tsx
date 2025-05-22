
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Event } from "@/data/events";

interface EventFiltersProps {
  onFilterChange: (category: Event["category"] | null) => void;
  currentFilter: Event["category"] | null;
}

const EventFilters = ({ onFilterChange, currentFilter }: EventFiltersProps) => {
  const filters: Array<{ label: string; value: Event["category"] | null }> = [
    { label: "Tümü", value: null },
    { label: "Film", value: "film" },
    { label: "Eğitim", value: "education" },
    { label: "Sosyal", value: "social" },
    { label: "Spor", value: "sports" },
    { label: "Sanat", value: "arts" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.label}
          onClick={() => onFilterChange(filter.value)}
          variant={currentFilter === filter.value ? "default" : "outline"}
          size="sm"
          className="rounded-full"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default EventFilters;
