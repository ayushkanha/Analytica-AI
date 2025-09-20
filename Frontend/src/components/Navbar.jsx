import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Navbar = ({ activePage, setActivePage, handleNavigateToCleaning }) => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const handleNavClick = (page) => {
    if (page === 'cleaning') {
      handleNavigateToCleaning();
    } else {
      setActivePage(page);
    }
    setIsProductDropdownOpen(false);
  };

  return (
    // Wrapper to give padding and keep the navbar in the document flow
    <header className="w-full p-4 font-inter absolute top-0 z-50 px-40 py-5 pt-10">
      {/* The navbar itself with the translucent, glowing effect */}
      <div className="group container mx-auto flex items-center justify-between p-3 bg-black/30 backdrop-blur-md rounded-4xl border-0.1 border-white shadow-[0_0_25px_rgba(46,75,165,1)] relative">
        
        {/* Logo and App Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer pl-4"
          onClick={() => handleNavClick('home')}
        >
          <img src="/logo.png" alt="Analytica Logo" className="h-8 w-8" />
          <span className="text-2xl font-bold text-white">Analytica</span>
        </div>

        {/* Navigation Links - Centered */}
        <div className="hidden md:flex items-center space-x-6 text-gray-300 text- sm font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-white transition-colors duration-200 ${
              activePage === 'home' ? 'text-white font-medium' : ''
            }`}
          >
            Home
          </button>

          {/* Product Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProductDropdownOpen(true)}
            onMouseLeave={() => setIsProductDropdownOpen(false)}
          >
            <button
              className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
            >
              <span>Product</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProductDropdownOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-48 bg-transparent"
              >
                <div 
                  className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg z-50"
                >
                  <button
                    onClick={() => handleNavClick('cleaning')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    Clean Data
                  </button>
                    <button
                    onClick={() => handleNavClick('analysis')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    Analyze Data
                  </button>
                  <button
                    onClick={() => setActivePage('dashboard')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    Dashboard
                  </button>
                  {/* <button
                    onClick={() => handleNavClick('reports')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200 rounded-b-lg"
                  >
                    Reports
                  </button> */}
                </div>
              </div>
            )}
          </div>
          {/* Placeholder links from the image */}
          <button className="hover:text-white transition-colors duration-200">Solution</button>

          <button className="hover:text-white transition-colors duration-200">About us</button>
          <button className="hover:text-white transition-colors duration-200">Contact</button>
        </div>

        {/* Auth Buttons */}
        <div className='pr-4'>
          <SignedOut>
            <SignInButton afterSignInUrl="/home">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-white/20 text-sm font-medium">
                <User className="w-4 h-4" />
                <span className="text-shadow-[0_0_10px_rgba(255,255,255,0.8)] hover:text-shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-200">Sign Up</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" className=" pt-1" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;