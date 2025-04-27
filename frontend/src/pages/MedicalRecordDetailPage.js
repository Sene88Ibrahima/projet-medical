import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DicomViewer from '../components/dicom/DicomViewer';
import DicomUploader from '../components/dicom/DicomUploader';
import axios from 'axios';
import medicalImageService from '../services/medicalImageService';

const MedicalRecordDetailPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [annotationSaving, setAnnotationSaving] = useState(false);

  // Vérifier si l'utilisateur est un médecin ou un administrateur
  const canEditImages = user && (user.role === 'DOCTOR' || user.role === 'ADMIN');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails du dossier médical
        const recordResponse = await axios.get(`/api/v1/medical-records/${recordId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecord(recordResponse.data);
        
        // Récupérer les images associées
        const imagesResponse = await medicalImageService.getImagesForRecord(recordId);
        setImages(imagesResponse);
        
        // Sélectionner la première image si disponible
        if (imagesResponse.length > 0) {
          setSelectedImage(imagesResponse[0]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du dossier médical:", err);
        setError("Impossible de charger le dossier médical. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [recordId]);

  const handleImageUploadSuccess = (newImage) => {
    // Ajouter la nouvelle image à la liste
    setImages(prev => [...prev, newImage]);
    
    // Sélectionner la nouvelle image
    setSelectedImage(newImage);
  };

  const handleAnnotationChange = async (annotation) => {
    if (!selectedImage || !canEditImages) return;
    
    try {
      setAnnotationSaving(true);
      
      // Sauvegarder les annotations
      const updatedImage = await medicalImageService.updateAnnotations(
        selectedImage.id,
        JSON.stringify(annotation)
      );
      
      // Mettre à jour l'image sélectionnée
      setSelectedImage(updatedImage);
      
      // Mettre à jour la liste des images
      setImages(prev => prev.map(img => 
        img.id === selectedImage.id ? updatedImage : img
      ));
      
      // Notification de succès
      alert("Annotations sauvegardées avec succès");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des annotations:", err);
      alert("Erreur lors de la sauvegarde des annotations");
    } finally {
      setAnnotationSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!canEditImages) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      try {
        await medicalImageService.deleteImage(imageId, true);
        
        // Supprimer l'image de la liste
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);
        
        // Si l'image supprimée était sélectionnée, sélectionner la première image restante
        if (selectedImage && selectedImage.id === imageId) {
          setSelectedImage(updatedImages.length > 0 ? updatedImages[0] : null);
        }
        
        // Notification de succès
        alert("Image supprimée avec succès");
      } catch (err) {
        console.error("Erreur lors de la suppression de l'image:", err);
        alert("Erreur lors de la suppression de l'image");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Dossier médical #{recordId}</h2>
          {record && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Informations générales</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Patient:</strong> {record.patientName}</p>
                    <p><strong>Médecin:</strong> {record.doctorName}</p>
                    <p><strong>Date de création:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Diagnostic:</strong> {record.diagnosis}</p>
                    <p><strong>Traitement:</strong> {record.treatment}</p>
                    <p><strong>Notes:</strong> {record.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-md-4">
          {canEditImages && (
            <DicomUploader 
              recordId={recordId} 
              onUploadSuccess={handleImageUploadSuccess} 
            />
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <h4>Images médicales</h4>
          <div className="list-group">
            {images.length === 0 ? (
              <div className="text-muted p-3 bg-light rounded">Aucune image disponible</div>
            ) : (
              images.map(image => (
                <button
                  key={image.id}
                  className={`list-group-item list-group-item-action ${selectedImage?.id === image.id ? 'active' : ''}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{image.description || 'Image sans titre'}</h6>
                    <small>{new Date(image.uploadedAt).toLocaleDateString()}</small>
                  </div>
                  <small>{image.imageType || 'Type non spécifié'}</small>
                  {canEditImages && (
                    <button 
                      className="btn btn-sm btn-danger float-end mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="col-md-9">
          <h4>Visualiseur DICOM</h4>
          {selectedImage ? (
            <DicomViewer
              instanceId={selectedImage.orthancInstanceId}
              onAnnotationChange={canEditImages ? handleAnnotationChange : null}
            />
          ) : (
            <div className="card">
              <div className="card-body text-center p-5">
                <p className="mb-0">Sélectionnez une image à visualiser ou téléchargez-en une nouvelle.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetailPage;
