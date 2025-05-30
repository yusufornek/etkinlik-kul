import { describe, it, expect } from 'vitest';
import { cn, getImageUrl } from './utils'; // Added getImageUrl

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isHidden = false;
    expect(cn('base', isActive && 'active', isHidden && 'hidden')).toBe('base active');
  });

  it('should override conflicting classes with tailwind-merge', () => {
    // Example from tailwind-merge: p-2 p-4 -> p-4
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle empty or falsy inputs', () => {
    expect(cn('base', null, undefined, false, '')).toBe('base');
    expect(cn(null, undefined)).toBe('');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['p-2', 'm-2'], ['p-4', 'mx-1'])).toBe('m-2 p-4 mx-1');
  });
});

describe('getImageUrl utility function', () => {
  it('should return placeholder if imageUrl is null or undefined', () => {
    expect(getImageUrl(null)).toBe('/placeholder.svg');
    expect(getImageUrl(undefined)).toBe('/placeholder.svg');
  });

  it('should return the same URL if it starts with http:// or https://', () => {
    expect(getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    expect(getImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
  });

  it('should prepend backend URL if imageUrl starts with /uploads/', () => {
    // Assuming default backend URL for testing purposes.
    // This might need to be configurable if VITE_API_BASE_URL is used in actual getImageUrl
    // For now, hardcoding based on the function's current implementation.
    expect(getImageUrl('/uploads/image.jpg')).toBe('http://localhost:8000/uploads/image.jpg');
  });

  it('should return the original URL for other cases', () => {
    expect(getImageUrl('other/image.jpg')).toBe('other/image.jpg');
    expect(getImageUrl('./local-image.png')).toBe('./local-image.png');
  });
});
