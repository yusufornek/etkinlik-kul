
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <header className="frosted-navbar sticky top-0 w-full z-40">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-display font-medium">KampüsEtkinlik</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="default" size="sm">
            Giriş Yap
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
