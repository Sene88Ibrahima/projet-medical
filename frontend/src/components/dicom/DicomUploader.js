import React, { useState } from 'react';
import medicalImageService from '../../services/medicalImageService';
import './DicomUploader.css';

const DicomUploader = ({ recordId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const validateFile = (file) => {
    // Vérifier si un fichier est sélectionné
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return false;
    }

    // Vérifier la taille du fichier (max 50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 50 MB)');
      return false;
    }

    // Vérifier le type de fichier (idéalement .dcm, mais nous acceptons d'autres types)
    if (!file.name.toLowerCase().endsWith('.dcm') && 
        file.type !== 'application/dicom') {
      // Afficher un avertissement mais continuer
      console.warn('Le fichier sélectionné n\'est peut-être pas un fichier DICOM valide');
    }

    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!validateFile(file)) {
      return;
    }

    if (!recordId) {
      setError('ID de dossier médical manquant');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simuler une progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);

      // Télécharger le fichier
      const result = await medicalImageService.uploadDicomImage(file, recordId, description);
      
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      // Réinitialiser le formulaire
      setFile(null);
      setDescription('');
      
      // Notifier le composant parent
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError(err.response?.data?.message || 'Échec du téléchargement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dicom-uploader card">
      <div className="card-header">
        <h5>Télécharger une image DICOM</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            Image téléchargée avec succès !
          </div>
        )}
        
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label htmlFor="dicom-file" className="form-label">Fichier DICOM</label>
            <input
              type="file"
              className="form-control"
              id="dicom-file"
              onChange={handleFileChange}
              disabled={loading}
              accept=".dcm,application/dicom"
            />
            <div className="form-text">Sélectionnez un fichier DICOM (.dcm)</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              disabled={loading}
              placeholder="Description de l'image (optionnel)"
            />
          </div>
          
          {loading && (
            <div className="mb-3">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !file}
          >
            {loading ? 'Téléchargement en cours...' : 'Télécharger'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DicomUploader;
