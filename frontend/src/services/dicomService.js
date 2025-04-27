// src/services/dicomService.js
import axios from 'axios';
import authHeader from './authHeader';

const API_URL = '/api/v1/dicom';

const dicomService = {
  // Récupérer toutes les études DICOM
  getAllStudies: async (patientId = null) => {
    const params = patientId ? { patientId } : {};
    try {
      const response = await axios.get(`${API_URL}/studies`, { 
        params,
        headers: authHeader() 
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des études:', error);
      throw error;
    }
  },

  // Récupérer une étude spécifique
  getStudy: async (studyId) => {
    try {
      const response = await axios.get(`${API_URL}/studies/${studyId}`, { 
        headers: authHeader() 
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'étude ${studyId}:`, error);
      throw error;
    }
  },

  // Récupérer une série spécifique
  getSeries: async (seriesId) => {
    try {
      const response = await axios.get(`${API_URL}/series/${seriesId}`, { 
        headers: authHeader() 
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la série ${seriesId}:`, error);
      throw error;
    }
  },

  // Récupérer une instance spécifique
  getInstance: async (instanceId) => {
    try {
      const response = await axios.get(`${API_URL}/instances/${instanceId}`, { 
        headers: authHeader() 
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'instance ${instanceId}:`, error);
      throw error;
    }
  },

  // Télécharger un fichier DICOM
  uploadDicomFile: async (file, patientId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (patientId) {
      formData.append('patientId', patientId);
    }
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier DICOM:', error);
      throw error;
    }
  },

  // Modifier une instance (annotations, etc.)
  modifyInstance: async (instanceId, modificationData) => {
    try {
      const response = await axios.post(
        `${API_URL}/instances/${instanceId}/modify`, 
        modificationData,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la modification de l'instance ${instanceId}:`, error);
      throw error;
    }
  },

  // Anonymiser une étude
  anonymizeStudy: async (studyId, keepTags = []) => {
    try {
      const response = await axios.post(
        `${API_URL}/studies/${studyId}/anonymize`,
        null,
        { 
          params: { keepTags: keepTags.join(',') },
          headers: authHeader() 
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'anonymisation de l'étude ${studyId}:`, error);
      throw error;
    }
  },

  // Supprimer une étude
  deleteStudy: async (studyId) => {
    try {
      await axios.delete(
        `${API_URL}/studies/${studyId}`,
        { headers: authHeader() }
      );
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'étude ${studyId}:`, error);
      throw error;
    }
  },

  // URL pour accéder directement à l'image via Orthanc
  getInstanceImageUrl: (instanceId) => {
    return `${API_URL}/instances/${instanceId}/image`;
  },

  // URL pour accéder directement au fichier DICOM brut
  getInstanceFileUrl: (instanceId) => {
    return `${API_URL}/instances/${instanceId}/file`;
  },

  // Récupérer le fichier DICOM brut d'une instance
  getInstanceFile: async (instanceId) => {
    try {
      const response = await axios.get(`${API_URL}/instances/${instanceId}/file`, { 
        headers: authHeader(),
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du fichier DICOM pour l'instance ${instanceId}:`, error);
      throw error;
    }
  }
};

export default dicomService;
