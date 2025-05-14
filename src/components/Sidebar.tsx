import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Database, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate to home/portal selection page after logout
  };
  
  return (
    <aside className="w-64 bg-indigo-900 text-white shadow-lg h-screen sticky top-0">
      <div className="flex items-center justify-center h-16 border-b border-indigo-800">
        <h1 className="text-xl font-semibold">Hasta Kayıt Sistemi</h1>
      </div>
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`
              }
            >
              <Home size={18} className="mr-3" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/patients" 
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`
              }
            >
              <Users size={18} className="mr-3" />
              <span>Hastalar</span>
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink 
                to="/backup" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`
                }
              >
                <Database size={18} className="mr-3" />
                <span>Yedekleme</span>
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link 
                to="/register" 
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-indigo-800"
              >
                <UserPlus size={18} className="mr-3" />
                <span>Kullanıcı Ekle</span>
              </Link>
            </li>
          )}
        </ul>
        <div className="absolute bottom-8 w-full left-0 px-4">
          <div className="mb-4 px-3">
            <p className="text-xs text-indigo-300 mb-1">Giriş Yapan Kullanıcı</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium mr-2">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-indigo-300 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg w-full text-left transition-colors hover:bg-indigo-800"
          >
            <LogOut size={18} className="mr-3" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;