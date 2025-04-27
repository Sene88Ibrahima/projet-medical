import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Configuration d'axios avec le token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const medicalImageService = {
  /**
   * Récupère toutes les images associées à un dossier médical
   */
  getImagesForRecord: async (recordId) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/medical-images/record/${recordId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des images:', error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier DICOM vers Orthanc et l'associe à un dossier médical
   */
  uploadDicomImage: async (file, recordId, description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recordId', recordId);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(`${API_URL}/api/v1/medical-images/upload`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image DICOM:', error);
      throw error;
    }
  },

  /**
   * Lie une image DICOM existante à un dossier médical
   */
  linkDicomImage: async (instanceId, recordId, description = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/medical-images/link?instanceId=${instanceId}&recordId=${recordId}&description=${encodeURIComponent(description)}`,
        {},
        {
          headers: getAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la liaison de l\'image DICOM:', error);
      throw error;
    }
  },

  /**
   * Met à jour les annotations d'une image médicale
   */
  updateAnnotations: async (imageId, annotations) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/medical-images/${imageId}/annotations`,
        annotations,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des annotations:', error);
      throw error;
    }
  },

  /**
   * Supprime une image médicale
   */
  deleteImage: async (imageId, deleteFromOrthanc = false) => {
    try {
      await axios.delete(`${API_URL}/api/v1/medical-images/${imageId}?deleteFromOrthanc=${deleteFromOrthanc}`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      throw error;
    }
  },

  /**
   * Construit l'URL pour accéder à l'aperçu d'une instance DICOM
   */
  getInstancePreviewUrl: (instanceId) => {
    return `${API_URL}/api/v1/dicom/instances/${instanceId}/preview`;
  }
};

export default medicalImageService;
