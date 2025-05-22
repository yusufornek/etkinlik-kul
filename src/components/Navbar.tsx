
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="frosted-navbar py-4 px-4 md:px-6 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-display font-semibold">
          KampüsEtkinlik
        </Link>
        <div className="text-sm font-medium">
          <Link to="/" className="ml-4 transition-colors hover:text-vivid-purple">
            Anasayfa
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
