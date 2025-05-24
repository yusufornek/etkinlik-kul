
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
}

export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/placeholder.svg';
  
  // Eğer tam URL ise (http:// veya https:// ile başlıyorsa) direkt döndür
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Eğer /uploads/ ile başlıyorsa backend URL'i ekle
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:8000${imageUrl}`;
  }
  
  // Diğer durumlar için olduğu gibi döndür
  return imageUrl;
}
