import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DicomViewer from '../components/dicom/DicomViewer';
import dicomService from '../services/dicomService';
import './DicomViewerPage.css';

const DicomViewerPage = () => {
  const { patientId, studyId, instanceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [report, setReport] = useState('');
  
  // Charger les études du patient
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const data = await dicomService.getAllStudies(patientId);
        setStudies(data);
        
        // Si un studyId est fourni, sélectionner cette étude
        if (studyId) {
          const study = data.find(s => s.id === studyId);
          if (study) {
            setSelectedStudy(study);
          }
        } else if (data.length > 0) {
          // Sinon, sélectionner la première étude
          setSelectedStudy(data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des études:", err);
        setError("Impossible de charger les études DICOM. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchStudies();
    }
  }, [patientId, studyId]);

  // Quand une étude est sélectionnée, mettre à jour l'URL et sélectionner la première série
  useEffect(() => {
    if (selectedStudy) {
      // Mettre à jour l'URL sans recharger la page
      navigate(`/patients/${patientId}/dicom/${selectedStudy.id}`, { replace: true });
      
      // Sélectionner la première série si disponible
      if (selectedStudy.series && selectedStudy.series.length > 0) {
        setSelectedSeries(selectedStudy.series[0]);
      } else {
        setSelectedSeries(null);
      }
    }
  }, [selectedStudy, patientId, navigate]);

  // Quand une série est sélectionnée, sélectionner la première instance
  useEffect(() => {
    if (selectedSeries) {
      if (selectedSeries.instances && selectedSeries.instances.length > 0) {
        setSelectedInstance(selectedSeries.instances[0]);
      } else {
        setSelectedInstance(null);
      }
    }
  }, [selectedSeries]);

  // Gérer la sélection d'une étude
  const handleStudySelect = (study) => {
    setSelectedStudy(study);
  };

  // Gérer la sélection d'une série
  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
  };

  // Gérer la sélection d'une instance
  const handleInstanceSelect = (instance) => {
    setSelectedInstance(instance);
  };

  // Gérer les annotations
  const handleAnnotationChange = (annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  // Gérer le rapport médical
  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  // Sauvegarder le rapport médical
  const handleSaveReport = async () => {
    if (!selectedStudy || !report.trim()) return;
    
    try {
      // Ici, vous pourriez appeler une API pour sauvegarder le rapport
      console.log("Sauvegarde du rapport pour l'étude:", selectedStudy.id);
      console.log("Contenu:", report);
      
      // Simuler une sauvegarde réussie
      alert("Rapport médical sauvegardé avec succès!");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du rapport:", err);
      alert("Erreur lors de la sauvegarde du rapport. Veuillez réessayer.");
    }
  };

  return (
    <div className="dicom-page-container">
      <h2 className="page-title">Visualiseur d'images médicales DICOM</h2>
      
      {loading ? (
        <div className="loading-container">Chargement des données...</div>
      ) : error ? (
        <div className="error-container">{error}</div>
      ) : (
        <div className="dicom-content">
          {/* Navigation des études */}
          <div className="dicom-sidebar">
            <h3>Études DICOM</h3>
            {studies.length === 0 ? (
              <p>Aucune étude disponible pour ce patient.</p>
            ) : (
              <ul className="studies-list">
                {studies.map(study => (
                  <li 
                    key={study.id}
                    className={selectedStudy && selectedStudy.id === study.id ? 'selected' : ''}
                    onClick={() => handleStudySelect(study)}
                  >
                    <div className="study-item">
                      <strong>{study.description || 'Étude sans description'}</strong>
                      <span className="study-date">
                        {new Date(study.date).toLocaleDateString()}
                      </span>
                      <span className="study-modality">{study.modality}</span>
                    </div>
                    
                    {selectedStudy && selectedStudy.id === study.id && study.series && (
                      <ul className="series-list">
                        {study.series.map(series => (
                          <li 
                            key={series.id}
                            className={selectedSeries && selectedSeries.id === series.id ? 'selected' : ''}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeriesSelect(series);
                            }}
                          >
                            <div className="series-item">
                              {series.description || `Série ${series.number || 'sans numéro'}`}
                              <span className="series-count">
                                {series.instances ? series.instances.length : 0} images
                              </span>
                            </div>
                            
                            {selectedSeries && selectedSeries.id === series.id && series.instances && (
                              <ul className="instances-list">
                                {series.instances.map(instance => (
                                  <li 
                                    key={instance.id}
                                    className={selectedInstance && selectedInstance.id === instance.id ? 'selected' : ''}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInstanceSelect(instance);
                                    }}
                                  >
                                    Image {instance.number || 'sans numéro'}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Zone principale de visualisation */}
          <div className="dicom-main">
            <div className="dicom-viewer-container">
              <DicomViewer 
                instanceId={selectedInstance ? selectedInstance.id : null}
                onAnnotationChange={handleAnnotationChange}
              />
            </div>
            
            {/* Zone de rapport médical */}
            <div className="report-container">
              <h3>Rapport médical</h3>
              <textarea 
                className="report-textarea"
                value={report}
                onChange={handleReportChange}
                placeholder="Rédigez votre rapport médical ici..."
                rows={6}
              />
              <div className="report-actions">
                <button className="save-button" onClick={handleSaveReport}>
                  Sauvegarder le rapport
                </button>
              </div>
            </div>
            
            {/* Zone d'annotations */}
            <div className="annotations-container">
              <h3>Annotations ({annotations.length})</h3>
              {annotations.length === 0 ? (
                <p>Aucune annotation. Utilisez les outils d'annotation pour en ajouter.</p>
              ) : (
                <ul className="annotations-list">
                  {annotations.map((annotation, index) => (
                    <li key={index} className="annotation-item">
                      <div className="annotation-type">
                        {annotation.type === 'length' ? 'Mesure de distance' : annotation.type}
                      </div>
                      <div className="annotation-time">
                        {new Date(annotation.timestamp).toLocaleTimeString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicomViewerPage;
