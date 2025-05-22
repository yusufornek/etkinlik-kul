
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-gray-100 py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          KampüsEtkinlik
        </Link>
        <div className="text-sm font-medium">
          <Link to="/" className="ml-4 transition-colors hover:text-gray-600">
            Anasayfa
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
