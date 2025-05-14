import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';
import PatientForm from '../components/PatientForm';

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  tcId: string;
  phoneNumber: string;
  department: string;
  complaint: string;
  createdAt: string;
  createdBy: number;
};

const Patients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  useEffect(() => {
    fetchPatients();
  }, []);
  
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await api.getPatients(user?.id || 0, user?.role === 'admin');
      
      if (response.success && response.patients) {
        setPatients(response.patients);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredPatients = patients.filter(patient => {
    const searchString = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchString) ||
      patient.lastName.toLowerCase().includes(searchString) ||
      patient.tcId.includes(searchString) ||
      patient.phoneNumber.includes(searchString) ||
      patient.department.toLowerCase().includes(searchString)
    );
  });
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hasta Listesi</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={() => setShowForm(true)}
        >
          <PlusCircle size={18} className="mr-1" /> Yeni Hasta Ekle
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="card-header flex justify-between items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Hasta ara..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className="btn btn-secondary flex items-center" 
            onClick={fetchPatients}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
              <p>Hastalar yükleniyor...</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>TC Kimlik No</th>
                    <th>Telefon</th>
                    <th>Bölüm</th>
                    <th>Kayıt Tarihi</th>
                    <th>Şikayet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map(patient => (
                    <tr 
                      key={patient.id}
                      onClick={() => handlePatientClick(patient)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</td>
                      <td>{patient.tcId}</td>
                      <td>{patient.phoneNumber}</td>
                      <td>{patient.department}</td>
                      <td>{formatDate(patient.createdAt)}</td>
                      <td className="truncate max-w-xs">{patient.complaint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">
              {searchTerm ? 'Aramanıza uygun hasta bulunamadı.' : 'Henüz hasta kaydı bulunmamaktadır.'}
            </p>
          )}
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
                fetchPatients();
              }}
            />
          </div>
        </div>
      )}
      
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Hasta Detayları</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedPatient(null)}
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">İsim</p>
                  <p className="font-medium">{selectedPatient.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Soyisim</p>
                  <p className="font-medium">{selectedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TC Kimlik No</p>
                  <p className="font-medium">{selectedPatient.tcId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{selectedPatient.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bölüm</p>
                  <p className="font-medium">{selectedPatient.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                  <p className="font-medium">{formatDate(selectedPatient.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Şikayet</p>
                <p className="bg-gray-50 p-3 rounded">{selectedPatient.complaint}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedPatient(null)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;