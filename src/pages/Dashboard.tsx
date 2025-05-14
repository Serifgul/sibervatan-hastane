import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlusCircle, RefreshCw, Users, Database, Activity } from 'lucide-react';
import PatientForm from '../components/PatientForm';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    departments: 0,
    lastBackup: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from backend
      const patientsRes = await api.getPatients(user?.id || 0, user?.role === 'admin');
      
      const patients = patientsRes.patients || [];
      
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newPatients = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= today;
      });
      
      const departments = new Set(patients.map(p => p.department)).size;
      
      // For last backup, we'd get this from the backup logs
      let lastBackup = 'N/A';
      
      if (user?.role === 'admin') {
        const logsRes = await api.getBackupLog('backup.log', true);
        if (logsRes.success && logsRes.logs && logsRes.logs.length > 0) {
          const latestSuccessfulBackup = logsRes.logs.find(log => log.status === 'success');
          if (latestSuccessfulBackup) {
            lastBackup = new Date(latestSuccessfulBackup.timestamp).toLocaleString();
          }
        }
      }
      
      setStats({
        totalPatients: patients.length,
        newPatients: newPatients.length,
        departments,
        lastBackup
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hoşgeldiniz, {user?.username}</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowForm(true)}
        >
          <PlusCircle size={18} className="mr-1" /> Yeni Hasta Ekle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <Users size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Toplam Hastalar</p>
            {isLoading ? (
              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <PlusCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Bugünkü Hastalar</p>
            {isLoading ? (
              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.newPatients}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Activity size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Aktif Bölümler</p>
            {isLoading ? (
              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.departments}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <Database size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Son Yedekleme</p>
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-sm font-medium">{stats.lastBackup}</p>
            )}
          </div>
        </div>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Yeni Hasta Ekle</h2>
            </div>
            <PatientForm 
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchStats();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;