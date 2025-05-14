import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Hospital Management System');
  
  useEffect(() => {
    // Update page title based on current route
    const path = location.pathname;
    
    if (path.includes('/dashboard')) {
      setPageTitle('Dashboard');
    } else if (path.includes('/patients')) {
      setPageTitle('Hasta Listesi');
    } else if (path.includes('/backup')) {
      setPageTitle('Sistem Yedekleme');
    }
  }, [location]);
  
  return (
    <header className="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
      <div className="text-lg font-semibold text-gray-800">
        {pageTitle}
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;