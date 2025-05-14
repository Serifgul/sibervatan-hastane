import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type PatientFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const PatientForm: React.FC<PatientFormProps> = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcId: '',
    phoneNumber: '',
    department: 'Cardiology',
    complaint: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Internal Medicine',
    'Obstetrics',
    'Ophthalmology',
    'Dermatology',
    'Oncology',
    'Emergency'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'İsim alanı zorunludur';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyisim alanı zorunludur';
    }
    
    if (!formData.tcId.trim()) {
      newErrors.tcId = 'TC Kimlik No alanı zorunludur';
    } else if (!/^\d{11}$/.test(formData.tcId)) {
      newErrors.tcId = 'TC Kimlik No 11 haneli olmalıdır';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon numarası alanı zorunludur';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!formData.department) {
      newErrors.department = 'Bölüm seçimi zorunludur';
    }
    
    if (!formData.complaint.trim()) {
      newErrors.complaint = 'Şikayet alanı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await api.addPatient(formData, user?.id || 0);
      
      if (response.success) {
        onSuccess();
      } else {
        setErrors({ submit: response.message || 'Hasta kaydı eklenirken bir hata oluştu' });
      }
    } catch (error) {
      console.error('Failed to add patient:', error);
      setErrors({ submit: 'Hasta kaydı eklenirken bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6">
      {errors.submit && (
        <div className="alert alert-danger mb-4">
          {errors.submit}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="form-label">İsim</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`form-input w-full ${errors.firstName ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className="form-label">Soyisim</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`form-input w-full ${errors.lastName ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="tcId" className="form-label">TC Kimlik No</label>
          <input
            type="text"
            id="tcId"
            name="tcId"
            value={formData.tcId}
            onChange={handleChange}
            className={`form-input w-full ${errors.tcId ? 'border-red-500' : ''}`}
            maxLength={11}
            disabled={isSubmitting}
          />
          {errors.tcId && <p className="text-red-500 text-xs mt-1">{errors.tcId}</p>}
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="form-label">Telefon Numarası</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`form-input w-full ${errors.phoneNumber ? 'border-red-500' : ''}`}
            placeholder="05XX XXX XXXX"
            disabled={isSubmitting}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="department" className="form-label">Bölüm</label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className={`form-input w-full ${errors.department ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="complaint" className="form-label">Şikayet</label>
        <textarea
          id="complaint"
          name="complaint"
          value={formData.complaint}
          onChange={handleChange}
          className={`form-input w-full min-h-[100px] ${errors.complaint ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        ></textarea>
        {errors.complaint && <p className="text-red-500 text-xs mt-1">{errors.complaint}</p>}
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          İptal
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </>
          ) : (
            'Hasta Ekle'
          )}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;