// src/services/dicomService.js
import axios from 'axios';
import authHeader from './authHeader';

const API_URL = '/api/v1/dicom';

const dicomService = {
  // Récupérer toutes les études DICOM
  getAllStudies: async (patientId = null) => {
    const params = patientId ? { patientId } : {};
    try {
      console.log("Récupération des études DICOM avec params:", params);
      
      const response = await axios.get(`${API_URL}/studies`, { 
        params,
        headers: authHeader() 
      });
      
      console.log("Réponse brute du serveur pour les études:", response);
      
      // Vérifier si les données sont valides
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Format de données inattendu:", response.data);
        return [];
      }
      
      // Transformer les données pour s'assurer qu'elles sont correctement formatées
      const formattedData = response.data.map(study => {
        // Log détaillé pour chaque étude
        console.log("Étude brute:", study);
        
        // S'assurer que les propriétés existent
        return {
          id: study.ID || study.id || null,
          ID: study.ID || study.id || null, // Dupliquer pour compatibilité
          patientName: study.PatientName || (study.MainDicomTags && study.MainDicomTags.PatientName) || null,
          patientId: study.PatientID || (study.MainDicomTags && study.MainDicomTags.PatientID) || null,
          studyDescription: study.StudyDescription || (study.MainDicomTags && study.MainDicomTags.StudyDescription) || null,
          studyDate: study.StudyDate || (study.MainDicomTags && study.MainDicomTags.StudyDate) || null,
          MainDicomTags: study.MainDicomTags || {},
          series: study.Series || null
        };
      });
      
      console.log("Données formatées des études:", formattedData);
      return formattedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des études:', error);
      console.error('Détails de l\'erreur:', error.response ? error.response.data : 'Pas de réponse');
      throw error;
    }
  },

  // Récupérer les IDs d'études bruts
  getStudyIds: async (patientId = null) => {
    const params = patientId ? { patientId } : {};
    try {
      console.log("Récupération des IDs d'études DICOM avec params:", params);
      
      // Utiliser le nouvel endpoint dédié aux IDs d'études
      const response = await axios.get(`${API_URL}/study-ids`, { 
        params,
        headers: authHeader() 
      });
      
      console.log("Réponse brute du serveur pour les IDs d'études:", response);
      
      // Vérifier si les données sont valides
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Format de données inattendu:", response.data);
        return [];
      }
      
      // Plus besoin de transformer les données car le backend renvoie déjà les IDs au bon format
      const studyIds = response.data;
      
      console.log("IDs d'études reçus directement du backend:", studyIds);
      
      return studyIds;
    } catch (error) {
      console.error('Erreur lors de la récupération des IDs d\'études:', error);
      console.error('Détails de l\'erreur:', error.response ? error.response.data : 'Pas de réponse');
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
    // Assurer que nous avons une URL absolue pour cornerstone-wado-image-loader
    return window.location.origin + `${API_URL}/instances/${instanceId}/file`;
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
  },
  
  // Récupérer directement une image DICOM à partir de son ID d'instance
  getInstanceImage: async (instanceId) => {
    // Vérifier si l'ID d'instance est valide
    if (!instanceId) {
      console.error('ID d\'instance invalide');
      throw new Error('ID d\'instance invalide');
    }
    
    // Cache local pour éviter des requêtes répétées pour la même image
    if (window._dicomImageCache && window._dicomImageCache[instanceId]) {
      console.log(`Utilisation de l'image en cache pour l'instance ${instanceId}`);
      return window._dicomImageCache[instanceId];
    }
    
    // Initialiser le cache s'il n'existe pas
    if (!window._dicomImageCache) {
      window._dicomImageCache = {};
    }
    
    try {
      console.log(`Récupération de l'image DICOM pour l'instance ${instanceId}`);
      
      // Essayer d'abord de récupérer l'image JPEG (meilleur compromis performance/qualité)
      try {
        const response = await axios.get(`${API_URL}/instances/${instanceId}/image`, { 
          headers: authHeader(),
          responseType: 'blob'
        });
        const imageUrl = URL.createObjectURL(response.data);
        window._dicomImageCache[instanceId] = imageUrl; // Mettre en cache
        return imageUrl;
      } catch (jpegError) {
        console.warn(`Impossible de récupérer l'image JPEG: ${jpegError.message}`);
        
        // Essayer ensuite de récupérer l'aperçu
        try {
          const previewResponse = await axios.get(`${API_URL}/instances/${instanceId}/preview`, { 
            headers: authHeader(),
            responseType: 'blob'
          });
          const imageUrl = URL.createObjectURL(previewResponse.data);
          window._dicomImageCache[instanceId] = imageUrl; // Mettre en cache
          return imageUrl;
        } catch (previewError) {
          console.warn(`Impossible de récupérer l'aperçu: ${previewError.message}`);
          
          // En dernier recours, essayer le fichier DICOM brut
          try {
            const fileResponse = await axios.get(`${API_URL}/instances/${instanceId}/file`, { 
              headers: authHeader(),
              responseType: 'blob'
            });
            const imageUrl = URL.createObjectURL(fileResponse.data);
            window._dicomImageCache[instanceId] = imageUrl; // Mettre en cache
            return imageUrl;
          } catch (fileError) {
            throw new Error("Impossible de récupérer l'image DICOM sous aucun format");
          }
        }
      }
    } catch (error) {
      console.error(`Échec de récupération de l'image DICOM: ${error.message}`);
      throw new Error(`Échec de récupération de l'image DICOM: ${error.message}`);
    }
  },
};

export default dicomService;
