import React, { useState } from 'react';
import dicomService from '../../services/dicomService';
import './DicomUploader.css';

const DicomUploader = ({ patientId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      // Réinitialiser la progression
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier DICOM à télécharger.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Simuler la progression de l'upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Appel au service pour télécharger le fichier
      const response = await dicomService.uploadDicomFile(selectedFile, patientId);
      
      // Compléter la progression une fois terminé
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notifier du succès
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      // Réinitialiser après un court délai
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
      }, 2000);

    } catch (err) {
      setError("Erreur lors du téléchargement du fichier DICOM. Veuillez réessayer.");
      console.error("Erreur d'upload:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dicom-uploader">
      <h3>Télécharger des images DICOM</h3>
      
      <div className="upload-area">
        <input
          type="file"
          id="dicom-file-input"
          accept=".dcm"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label htmlFor="dicom-file-input" className="file-input-label">
          {selectedFile ? selectedFile.name : "Choisir un fichier DICOM"}
        </label>
        
        <button 
          className="upload-button"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? "Téléchargement en cours..." : "Télécharger"}
        </button>
      </div>
      
      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-text">{progress}%</div>
        </div>
      )}
      
      {error && <div className="upload-error">{error}</div>}
      
      <div className="upload-info">
        <h4>Instructions</h4>
        <ol>
          <li>Sélectionnez un fichier DICOM (.dcm) à partir de votre ordinateur</li>
          <li>Cliquez sur "Télécharger" pour l'envoyer au serveur</li>
          <li>L'image sera automatiquement associée au dossier du patient</li>
        </ol>
        <p className="upload-note">
          <strong>Note:</strong> Assurez-vous que les fichiers DICOM ne contiennent pas d'informations
          personnelles sensibles qui ne devraient pas être partagées.
        </p>
      </div>
    </div>
  );
};

export default DicomUploader;
