import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TopBar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const logoUrl = `${import.meta.env.VITE_FRONT_URL}logo_harx.jpg`;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo Harx */}
        <div className="flex items-center">
          <img 
            src={logoUrl} 
            alt="Harx Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              console.error('Erreur de chargement du logo:', e);
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Bouton de logout */}
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar; 