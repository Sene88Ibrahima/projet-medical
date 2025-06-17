import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

/**
 * MedicalReportPanel – handles creation/import and management of medical reports
 * Inspired by the Tailwind template provided by the user. Implemented with MUI
 * so it seamlessly integrates with the existing codebase while keeping the UX.
 */
const MedicalReportPanel = ({ instanceId, onSave }) => {
  const [reports, setReports] = useState([]);
  const [mode, setMode] = useState('list'); // 'list' | 'editor'
  const [editorData, setEditorData] = useState({
    id: null,
    title: `Nouveau rapport - ${new Date().toLocaleDateString('fr-FR')}`,
    findings: '',
    impression: '',
    recommendations: '',
    conclusion: '',
  });
  const [alert, setAlert] = useState(null);

  /** ***************************
   *  Helpers
   *****************************/
  const resetEditor = () => {
    setEditorData({
      id: null,
      title: `Nouveau rapport - ${new Date().toLocaleDateString('fr-FR')}`,
      findings: '',
      impression: '',
      recommendations: '',
      conclusion: '',
    });
  };

  /** ***************************
   *  List mode handlers
   *****************************/
  const handleCreateNote = () => {
    resetEditor();
    setMode('editor');
  };

  const handleImportReport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const newReport = {
        id: Date.now().toString(),
        title: file.name,
        type: 'imported',
        reportDate: new Date().toLocaleDateString('fr-FR'),
        fileUrl: URL.createObjectURL(file),
      };
      setReports((prev) => [...prev, newReport]);
    };
    input.click();
  };

  const handleViewReport = (report) => {
    if (report.type === 'imported' && report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      // created – open in editor
      setEditorData({
        id: report.id,
        title: report.title,
        ...JSON.parse(report.content),
      });
      setMode('editor');
    }
  };

  const handleDeleteReport = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  /** ***************************
   *  Editor handlers
   *****************************/
  const handleFieldChange = (field) => (e) => {
    setEditorData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const persistEditorData = (publish = false) => {
    const payload = {
      id: editorData.id ?? Date.now().toString(),
      title: editorData.title,
      type: 'created',
      reportDate: new Date().toLocaleDateString('fr-FR'),
      content: JSON.stringify({
        findings: editorData.findings,
        impression: editorData.impression,
        recommendations: editorData.recommendations,
        conclusion: editorData.conclusion,
      }),
    };

    // update or add
    setReports((prev) => {
      const exists = prev.find((r) => r.id === payload.id);
      if (exists) {
        return prev.map((r) => (r.id === payload.id ? payload : r));
      }
      return [...prev, payload];
    });

    // external callback
    if (onSave) {
      try {
        onSave({ instanceId, ...payload });
      } catch (_) {
        // eslint-disable-next-line no-console
        console.error('onSave failed');
      }
    }

    setAlert({ type: 'success', message: publish ? 'Rapport publié' : 'Rapport sauvegardé' });
    setMode('list');
  };

  /** ***************************
   *  Renderers
   *****************************/
  if (mode === 'editor') {
    return (
      <Paper elevation={3} sx={{ p: 2, width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setMode('list')} size="small" sx={{ alignSelf: 'flex-start' }}>
          Retour
        </Button>
        <TextField label="Titre du rapport" value={editorData.title} onChange={handleFieldChange('title')} fullWidth />
        <TextField label="Constatations" multiline rows={3} value={editorData.findings} onChange={handleFieldChange('findings')} fullWidth />
        <TextField label="Impression diagnostique" multiline rows={2} value={editorData.impression} onChange={handleFieldChange('impression')} fullWidth />
        <TextField label="Recommandations" multiline rows={2} value={editorData.recommendations} onChange={handleFieldChange('recommendations')} fullWidth />
        <TextField label="Conclusion" multiline rows={2} value={editorData.conclusion} onChange={handleFieldChange('conclusion')} fullWidth />

        {alert && (
          <Alert severity={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => persistEditorData(false)} fullWidth>
            Sauvegarder
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={() => persistEditorData(true)} fullWidth>
            Publier
          </Button>
        </Stack>
      </Paper>
    );
  }

  // LIST MODE
  return (
    <Paper elevation={3} sx={{ p: 2, width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Gestion des rapports</Typography>

      <Stack spacing={1} direction="column">
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNote} fullWidth>
          Prise de note
        </Button>
        <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleImportReport} fullWidth>
          Importer rapport
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {reports.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          Aucun rapport associé
        </Typography>
      )}

      {reports.length > 0 && (
        <List disablePadding>
          {reports.map((report) => (
            <ListItem key={report.id} divider secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleViewReport(report)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => window.alert('Partage non implémenté')}>
                  <ShareIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteReport(report.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            }>
              <ListItemText
                primary={report.title}
                secondary={`${report.type === 'created' ? 'Rapport créé' : 'Rapport importé'} • ${report.reportDate}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MedicalReportPanel;
