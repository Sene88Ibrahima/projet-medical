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

  // Quand une étude est sélectionnée, mettre à jour l'URL et charger les séries
  useEffect(() => {
    if (!selectedStudy) {
      return;
    }
    
    // Utiliser l'ID correct (peut être id ou ID)
    const studyId = selectedStudy.ID || selectedStudy.id;
    
    if (studyId) {
      // Mettre à jour l'URL sans recharger la page
      if (patientId) {
        navigate(`/patients/${patientId}/dicom/${studyId}`, { replace: true });
      }
      
      // Charger les séries pour cette étude
      const fetchSeries = async () => {
        try {
          console.log("Chargement des séries pour l'étude:", studyId);
          const seriesData = await dicomService.getStudy(studyId);
          
          console.log("Données de l'étude récupérées:", seriesData);
          
          if (seriesData && seriesData.Series && seriesData.Series.length > 0) {
            console.log("Séries récupérées:", seriesData.Series);
            // Ajouter les séries à l'étude sélectionnée
            setSelectedStudy(prev => ({
              ...prev,
              series: seriesData.Series
            }));
            
            // Sélectionner la première série
            const firstSeries = seriesData.Series[0];
            setSelectedSeries(firstSeries);
          } else {
            console.log("Aucune série trouvée pour cette étude");
            setSelectedSeries(null);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des séries:", err);
          setError("Impossible de charger les séries pour cette étude.");
        }
      };
      
      fetchSeries();
    }
  }, [selectedStudy, patientId, navigate]);

  // Quand une série est sélectionnée, charger les instances
  useEffect(() => {
    if (!selectedSeries) {
      return;
    }
    
    // Utiliser l'ID correct (peut être id ou ID)
    const seriesId = selectedSeries.ID || selectedSeries.id;
    
    if (seriesId && !selectedSeries.instances) {
      const fetchInstances = async () => {
        try {
          console.log("Chargement des instances pour la série:", seriesId);
          const seriesDetails = await dicomService.getSeries(seriesId);
          
          console.log("Détails de la série récupérés:", seriesDetails);
          
          if (seriesDetails && seriesDetails.Instances && seriesDetails.Instances.length > 0) {
            console.log("Instances récupérées:", seriesDetails.Instances);
            // Ajouter les instances à la série sélectionnée
            setSelectedSeries(prev => ({
              ...prev,
              instances: seriesDetails.Instances
            }));
            
            // Sélectionner la première instance
            setSelectedInstance(seriesDetails.Instances[0]);
          } else {
            console.log("Aucune instance trouvée pour cette série");
            setSelectedInstance(null);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des instances:", err);
        }
      };
      
      fetchInstances();
    } else if (selectedSeries.instances && selectedSeries.instances.length > 0) {
      setSelectedInstance(selectedSeries.instances[0]);
    } else {
      setSelectedInstance(null);
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
                {studies.map((study, studyIndex) => (
                  <li 
                    key={study.ID || study.id || `study-${studyIndex}`}
                    className={selectedStudy && (selectedStudy.ID === study.ID || selectedStudy.id === study.id) ? 'selected' : ''}
                    onClick={() => handleStudySelect(study)}
                  >
                    <div className="study-item">
                      <strong>{study.PatientName || study.MainDicomTags?.PatientName || 'Étude sans description'}</strong>
                      <span className="study-date">
                        {study.MainDicomTags?.StudyDate || 'Invalid Date'}
                      </span>
                      <span className="study-modality">{study.MainDicomTags?.Modality || ''}</span>
                    </div>
                    
                    {selectedStudy && (selectedStudy.ID === study.ID || selectedStudy.id === study.id) && selectedStudy.series && (
                      <ul className="series-list">
                        {selectedStudy.series.map((series, seriesIndex) => (
                          <li 
                            key={series.ID || series.id || `series-${seriesIndex}`}
                            className={selectedSeries && (selectedSeries.ID === series.ID || selectedSeries.id === series.id) ? 'selected' : ''}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeriesSelect(series);
                            }}
                          >
                            <div className="series-item">
                              {series.MainDicomTags?.SeriesDescription || `Série ${series.MainDicomTags?.SeriesNumber || 'sans numéro'}`}
                              <span className="series-count">
                                {series.instances ? series.instances.length : 0} images
                              </span>
                            </div>
                            
                            {selectedSeries && (selectedSeries.ID === series.ID || selectedSeries.id === series.id) && selectedSeries.instances && (
                              <ul className="instances-list">
                                {selectedSeries.instances.map((instance, instanceIndex) => (
                                  <li 
                                    key={instance.ID || instance.id || `instance-${instanceIndex}`}
                                    className={selectedInstance && (selectedInstance.ID === instance.ID || selectedInstance.id === instance.id) ? 'selected' : ''}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInstanceSelect(instance);
                                    }}
                                  >
                                    Image {instance.MainDicomTags?.InstanceNumber || 'sans numéro'}
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
