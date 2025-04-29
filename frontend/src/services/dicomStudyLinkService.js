// src/services/dicomStudyLinkService.js
import axios from 'axios';
import authHeader from './authHeader';

const API_URL = '/api/v1/dicom-study-links';

const dicomStudyLinkService = {
  // Récupérer tous les liens d'études DICOM pour un dossier médical
  getLinksForMedicalRecord: async (medicalRecordId) => {
    try {
      const response = await axios.get(`${API_URL}/medical-record/${medicalRecordId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des liens d\'études DICOM:', error);
      throw error;
    }
  },

  // Récupérer tous les dossiers médicaux liés à une étude DICOM
  getLinksByOrthancStudyId: async (orthancStudyId) => {
    try {
      const response = await axios.get(`${API_URL}/orthanc-study/${orthancStudyId}`, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers médicaux liés:', error);
      throw error;
    }
  },

  // Créer un nouveau lien entre une étude DICOM et un dossier médical
  createLink: async (linkData) => {
    try {
      const response = await axios.post(API_URL, linkData, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du lien d\'étude DICOM:', error);
      throw error;
    }
  },

  // Supprimer un lien entre une étude DICOM et un dossier médical
  deleteLink: async (linkId) => {
    try {
      await axios.delete(`${API_URL}/${linkId}`, {
        headers: authHeader()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du lien d\'étude DICOM:', error);
      throw error;
    }
  }
};

export default dicomStudyLinkService;
