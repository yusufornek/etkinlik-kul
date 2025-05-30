import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle'; // Adjust path as necessary

describe('ThemeToggle component', () => {
  beforeEach(() => {
    // Reset localStorage and HTML class for each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');

    // Mock matchMedia for consistent testing environment
    // (Vitest/JSDOM doesn't fully implement matchMedia by default)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        // Default mock: system does NOT prefer dark mode (prefers light)
        matches: query === '(prefers-color-scheme: dark)' ? false : false, 
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders correctly and shows Moon icon by default (light theme)', () => {
    render(<ThemeToggle />);
    // By default, with no localStorage and assuming system preference is light (mocked as light)
    // it should be light theme, so Moon icon should be visible to switch to dark.
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Check for Moon icon (lucide-react might render specific paths or class names)
    // For simplicity, checking aria-label which changes based on theme
    expect(button).toHaveAttribute('aria-label', 'Koyu temaya geç'); 
    // Check if Sun icon is NOT present initially
    expect(screen.queryByLabelText('Açık temaya geç')).toBeNull();
  });

  it('toggles theme on click from light to dark', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Koyu temaya geç' });

    fireEvent.click(button);

    // Now it should be dark theme, Sun icon should be visible
    expect(button).toHaveAttribute('aria-label', 'Açık temaya geç');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggles theme on click from dark to light', () => {
    // Set initial theme to dark
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Açık temaya geç' });

    fireEvent.click(button);

    // Now it should be light theme, Moon icon should be visible
    expect(button).toHaveAttribute('aria-label', 'Koyu temaya geç');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('initializes to dark theme if localStorage is set to dark', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Açık temaya geç');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
  
  it('initializes to dark theme if system preference is dark and no localStorage', () => {
    // Mock system preference to dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // System prefers dark
        media: query,
        onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    // Ensure localStorage is empty
    localStorage.clear();
    document.documentElement.classList.remove('dark'); // ensure no class from previous tests

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Açık temaya geç'); // Should switch to light
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

   it('initializes to light theme if system preference is light and no localStorage', () => {
    // Mock system preference to light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // System prefers light (or no preference for dark)
        media: query,
        onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Koyu temaya geç'); // Should switch to dark
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
