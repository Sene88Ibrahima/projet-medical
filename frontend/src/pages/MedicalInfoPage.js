import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MultiStepMedicalInfoForm from '../components/MultiStepMedicalInfoForm';
import { saveMedicalInfo } from '../services/medicalInfoService';

/**
 * Page affichée au patient lors de sa première connexion afin de compléter ses informations médicales de base.
 */
const MedicalInfoPage = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await saveMedicalInfo(data);
      // Mettre à jour le flag dans le contexte + localStorage
      const updated = { ...user, medicalInfoCompleted: true };
      await updateUserData(updated);
      // Rediriger vers le dashboard patient
      navigate('/dashboard/patient');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des infos médicales', err);
      alert('Une erreur est survenue, veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <MultiStepMedicalInfoForm onSubmit={handleSubmit} />
    </div>
  );
};

export default MedicalInfoPage;
