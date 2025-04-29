import axios from 'axios';
import { getAuthHeader } from '../utils/authUtils';

const API_URL = 'http://localhost:8080/api/v1/dicom';

/**
 * Service pour gu00e9rer les images DICOM associu00e9es aux patients via l'API backend.
 */
const patientDicomService = {
  /**
   * Tu00e9lu00e9charge une image DICOM pour un patient.
   * 
   * @param {File} file - Fichier DICOM u00e0 tu00e9lu00e9charger
   * @param {number} patientId - ID du patient
   * @param {string} description - Description de l'image
   * @returns {Promise<Object>} - L'image DICOM cru00e9u00e9e
   */
  uploadDicomImage: async (file, patientId, description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('description', description);
      
      const response = await axios.post(`${API_URL}/patient-upload`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du tu00e9lu00e9chargement de l\'image DICOM:', error);
      throw error;
    }
  },

  /**
   * Cru00e9e une nouvelle ru00e9fu00e9rence d'image DICOM pour un patient.
   * 
   * @param {Object} dicomImage - Donnu00e9es de l'image DICOM u00e0 cru00e9er
   * @returns {Promise<Object>} - L'image DICOM cru00e9u00e9e
   */
  createDicomImage: async (dicomImage) => {
    try {
      const response = await axios.post(API_URL, dicomImage, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la cru00e9ation de l\'image DICOM:', error);
      throw error;
    }
  },

  /**
   * Ru00e9cupu00e8re toutes les images DICOM associu00e9es u00e0 un patient.
   * 
   * @param {number} patientId - ID du patient
   * @returns {Promise<Array>} - Liste des images DICOM
   */
  getPatientDicomImages: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/patient/${patientId}`, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration des images DICOM pour le patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Ru00e9cupu00e8re une image DICOM par son ID.
   * 
   * @param {number} id - ID de l'image DICOM
   * @returns {Promise<Object>} - L'image DICOM
   */
  getDicomImageById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'image DICOM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une image DICOM.
   * 
   * @param {number} id - ID de l'image DICOM u00e0 supprimer
   * @param {boolean} deleteFromOrthanc - Si true, supprime u00e9galement l'instance de Orthanc
   * @returns {Promise<void>}
   */
  deleteDicomImage: async (id, deleteFromOrthanc = false) => {
    try {
      await axios.delete(`${API_URL}/${id}?deleteFromOrthanc=${deleteFromOrthanc}`, { headers: getAuthHeader() });
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'image DICOM ${id}:`, error);
      throw error;
    }
  }
};

export default patientDicomService;
