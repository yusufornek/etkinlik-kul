
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Home } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="frosted-navbar sticky top-0 w-full z-40">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-display font-medium">İstanbul Üniversitesi Kampüs Etkinlikleri</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {!isHomePage && (
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Anasayfa
            </Link>
          )}
          <Link to="/hakkinda" className="text-sm font-medium hover:text-primary transition-colors">
            Hakkında
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
