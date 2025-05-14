import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';

const PortalSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Hospital Management System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link 
            to="/admin/login" 
            className="bg-white rounded-lg shadow-xl p-8 hover:transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Shield size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Admin Portal</h2>
              <p className="text-gray-600">System administration and backup management</p>
            </div>
          </Link>
          
          <Link 
            to="/staff/login" 
            className="bg-white rounded-lg shadow-xl p-8 hover:transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Users size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Staff Portal</h2>
              <p className="text-gray-600">Patient registration and management</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;