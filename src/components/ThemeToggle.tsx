
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Component mount olduğunda tema durumunu kontrol et
  useEffect(() => {
    // HTML element'in dark class'ına sahip olup olmadığını kontrol et
    const isDarkClass = document.documentElement.classList.contains("dark");
    
    // LocalStorage'dan kaydedilmiş tema tercihini al
    const savedTheme = localStorage.getItem("theme");
    
    // Sistem tercihini kontrol et
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Mevcut durum belirleme
    const shouldBeDark = isDarkClass || savedTheme === "dark" || (!savedTheme && prefersDark);
    
    // State'i güncelle
    setIsDarkMode(shouldBeDark);
    
    // HTML element'in class'ını güncelle
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // isDarkMode değiştiğinde tema güncellemesi yap
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Açık temaya geç" : "Koyu temaya geç"}
      className="rounded-full"
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
};

export default ThemeToggle;
