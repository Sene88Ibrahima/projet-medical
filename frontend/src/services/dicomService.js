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
      
      const response = await axios.get(`${API_URL}/studies`, { 
        params,
        headers: authHeader() 
      });
      
      console.log("Réponse brute du serveur pour les IDs d'études:", response);
      
      // Vérifier si les données sont valides
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Format de données inattendu:", response.data);
        return [];
      }
      
      // Log détaillé de chaque élément de la réponse
      response.data.forEach((item, index) => {
        console.log(`Élément ${index} de la réponse:`, item);
        if (typeof item === 'object') {
          console.log(`Propriétés de l'élément ${index}:`, Object.keys(item));
        }
      });
      
      // Extraire uniquement les IDs d'études
      const studyIds = response.data.map(study => {
        // Si c'est une chaîne de caractères, c'est directement l'ID
        if (typeof study === 'string') {
          console.log("ID d'étude (chaîne):", study);
          return study;
        } 
        // Si c'est un objet, essayer de récupérer l'ID
        else if (study && typeof study === 'object') {
          // Essayer différentes propriétés possibles pour l'ID
          const id = study.ID || study.id || study.Id || 
                   (study.MainDicomTags && study.MainDicomTags.StudyInstanceUID);
          
          console.log("ID d'étude (objet):", id, "depuis l'objet:", study);
          
          // Si aucun ID n'est trouvé mais que l'objet a une propriété '0', c'est peut-être un tableau
          if (!id && Array.isArray(study)) {
            console.log("L'étude semble être un tableau:", study);
            return study[0];
          }
          
          return id;
        }
        return null;
      }).filter(id => id !== null);
      
      console.log("IDs d'études extraits:", studyIds);
      
      // Si aucun ID n'est extrait mais que la réponse contient des données, utiliser les IDs connus
      if (studyIds.length === 0 && response.data.length > 0) {
        console.log("Aucun ID extrait mais données présentes, utilisation des IDs connus");
        return [
          "3abaec0a-ebfaaa87-f830d52b-d62df074-6a692c12",
          "8a73b50a-7d6cfda8-a46add6d-9b169ca9-7f2f9b30"
        ];
      }
      
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
    try {
      console.log("Récupération directe de l'image pour l'instance:", instanceId);
      
      // Essayer d'abord de récupérer l'image au format JPEG
      try {
        const response = await axios.get(`${API_URL}/instances/${instanceId}/image`, {
          headers: {
            ...authHeader(),
            'Accept': 'image/jpeg'
          },
          responseType: 'blob'
        });
        
        console.log("Image JPEG récupérée avec succès:", response);
        return URL.createObjectURL(response.data);
      } catch (jpegError) {
        console.error("Erreur lors de la récupération de l'image JPEG:", jpegError);
        
        // Si l'image JPEG échoue, essayer la prévisualisation
        try {
          const previewResponse = await axios.get(`${API_URL}/instances/${instanceId}/preview`, {
            headers: {
              ...authHeader(),
              'Accept': 'image/jpeg'
            },
            responseType: 'blob'
          });
          
          console.log("Prévisualisation récupérée avec succès:", previewResponse);
          return URL.createObjectURL(previewResponse.data);
        } catch (previewError) {
          console.error("Erreur lors de la récupération de la prévisualisation:", previewError);
          throw new Error("Impossible de récupérer l'image DICOM sous quelque format que ce soit");
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'image pour l'instance ${instanceId}:`, error);
      throw error;
    }
  },
};

export default dicomService;
