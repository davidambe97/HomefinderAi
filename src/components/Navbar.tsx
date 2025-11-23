import { Home, Search, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-white/20 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 shadow-lg shadow-blue-500/30">
            <Home className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">HomeFinder AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/search">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
