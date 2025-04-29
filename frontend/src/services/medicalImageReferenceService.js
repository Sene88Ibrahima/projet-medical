import axios from 'axios';
import { getAuthHeader } from '../utils/authUtils';

const API_URL = 'http://localhost:8080/api/v1/medical-image-references';

/**
 * Service pour gérer les références d'images médicales via l'API backend.
 */
const medicalImageReferenceService = {
  /**
   * Crée une nouvelle référence d'image médicale.
   * 
   * @param {Object} reference - Données de la référence d'image à créer
   * @returns {Promise<Object>} - La référence d'image créée
   */
  createReference: async (reference) => {
    try {
      const response = await axios.post(API_URL, reference, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la référence d\'image:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les références d'images associées à un dossier médical.
   * 
   * @param {number} medicalRecordId - ID du dossier médical
   * @returns {Promise<Array>} - Liste des références d'images
   */
  getReferencesByMedicalRecordId: async (medicalRecordId) => {
    try {
      const response = await axios.get(`${API_URL}/medical-record/${medicalRecordId}`, { headers: getAuthHeader() });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des références d'images pour le dossier médical ${medicalRecordId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une référence d'image médicale.
   * 
   * @param {number} id - ID de la référence d'image à supprimer
   * @returns {Promise<void>}
   */
  deleteReference: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    } catch (error) {
      console.error(`Erreur lors de la suppression de la référence d'image ${id}:`, error);
      throw error;
    }
  }
};

export default medicalImageReferenceService;
