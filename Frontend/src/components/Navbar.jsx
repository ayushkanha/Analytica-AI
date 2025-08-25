import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';

const Navbar = ({ activePage, setActivePage }) => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsProductDropdownOpen(false);
  };

  return (
    <nav className="w-full bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="text-2xl font-bold text-teal-400 cursor-pointer"
          onClick={() => handleNavClick('home')}
        >
          AI Visualizer
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => handleNavClick('home')}
            className={`text-gray-200 hover:text-teal-400 transition-colors duration-200 ${
              activePage === 'home' ? 'text-teal-400' : ''
            }`}
          >
            Home
          </button>

          {/* Product Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
              className="flex items-center space-x-1 text-gray-200 hover:text-teal-400 transition-colors duration-200"
            >
              <span>Product</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isProductDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleNavClick('cleaning')}
                  className="block w-full text-left px-4 py-3 text-gray-200 hover:text-teal-400 hover:bg-gray-700 transition-colors duration-200"
                >
                  Clean Data
                </button>
                <button
                  onClick={() => handleNavClick('analysis')}
                  className="block w-full text-left px-4 py-3 text-gray-200 hover:text-teal-400 hover:bg-gray-700 transition-colors duration-200"
                >
                  Analyze Data
                </button>
                <button
                  onClick={() => handleNavClick('reports')}
                  className="block w-full text-left px-4 py-3 text-gray-200 hover:text-teal-400 hover:bg-gray-700 transition-colors duration-200 rounded-b-lg"
                >
                  Reports
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Login Button */}
        <button className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          <User className="w-4 h-4" />
          <span>Login</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

