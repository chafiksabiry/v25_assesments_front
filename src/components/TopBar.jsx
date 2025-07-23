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
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar; 