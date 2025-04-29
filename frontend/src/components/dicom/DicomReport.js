import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const DicomReport = ({ instanceId, onSave }) => {
  const [report, setReport] = useState({
    findings: '',
    impression: '',
    recommendations: '',
    observations: [],
  });
  const [newObservation, setNewObservation] = useState('');
  const [savedStatus, setSavedStatus] = useState(null);

  // Réinitialiser le formulaire quand on change d'image
  useEffect(() => {
    setReport({
      findings: '',
      impression: '',
      recommendations: '',
      observations: [],
    });
    setNewObservation('');
    setSavedStatus(null);
  }, [instanceId]);

  const handleAddObservation = () => {
    if (newObservation.trim()) {
      setReport(prev => ({
        ...prev,
        observations: [...prev.observations, {
          text: newObservation.trim(),
          timestamp: new Date().toISOString(),
        }],
      }));
      setNewObservation('');
    }
  };

  const handleRemoveObservation = (index) => {
    setReport(prev => ({
      ...prev,
      observations: prev.observations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave({
          instanceId,
          ...report,
          timestamp: new Date().toISOString(),
        });
      }
      setSavedStatus({ type: 'success', message: 'Rapport sauvegardé avec succès' });
    } catch (error) {
      setSavedStatus({ type: 'error', message: 'Erreur lors de la sauvegarde du rapport' });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rapport médical
      </Typography>

      {savedStatus && (
        <Alert 
          severity={savedStatus.type} 
          onClose={() => setSavedStatus(null)}
          sx={{ mb: 2 }}
        >
          {savedStatus.message}
        </Alert>
      )}

      <TextField
        label="Constatations"
        multiline
        rows={4}
        value={report.findings}
        onChange={(e) => setReport(prev => ({ ...prev, findings: e.target.value }))}
        placeholder="Décrivez vos constatations principales..."
        fullWidth
      />

      <TextField
        label="Impression générale"
        multiline
        rows={2}
        value={report.impression}
        onChange={(e) => setReport(prev => ({ ...prev, impression: e.target.value }))}
        placeholder="Donnez votre impression diagnostique..."
        fullWidth
      />

      <TextField
        label="Recommandations"
        multiline
        rows={2}
        value={report.recommendations}
        onChange={(e) => setReport(prev => ({ ...prev, recommendations: e.target.value }))}
        placeholder="Ajoutez vos recommandations..."
        fullWidth
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Observations spécifiques
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Nouvelle observation"
          value={newObservation}
          onChange={(e) => setNewObservation(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddObservation()}
          fullWidth
        />
        <Button 
          variant="contained" 
          onClick={handleAddObservation}
          disabled={!newObservation.trim()}
        >
          Ajouter
        </Button>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {report.observations.map((obs, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleRemoveObservation(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={obs.text}
              secondary={new Date(obs.timestamp).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Chip 
          label={`${report.observations.length} observation(s)`} 
          variant="outlined" 
        />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!report.findings && !report.impression && report.observations.length === 0}
        >
          Sauvegarder le rapport
        </Button>
      </Box>
    </Paper>
  );
};

export default DicomReport; 