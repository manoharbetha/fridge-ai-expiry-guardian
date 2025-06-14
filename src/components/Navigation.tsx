
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Refrigerator, Brain, Home, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
              <Refrigerator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                Smart Fridge
              </div>
              <div className="text-xs text-gray-500">AI-Powered Manager</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={isActive('/') ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>

            <Button
              variant={isActive('/ai-features') ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={isActive('/ai-features') ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Link to="/ai-features" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Features
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
