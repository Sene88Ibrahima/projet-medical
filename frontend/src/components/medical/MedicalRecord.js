import React from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  IconButton, 
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../common/styles.css';

const MedicalRecord = ({ record, onEdit, onDelete, onView }) => {
  return (
    <Paper className="medical-record">
      <div className="medical-record-header">
        <Typography variant="h6" className="medical-record-title">
          Dossier Médical - {record.patientName}
        </Typography>
        <div className="medical-controls">
          <Tooltip title="Voir">
            <IconButton onClick={() => onView(record)} color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton onClick={() => onEdit(record)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => onDelete(record)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <Box className="medical-record-content">
        <TableContainer>
          <Table className="medical-table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type d'examen</TableCell>
                <TableCell>Médecin</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.examinations.map((exam, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exam.type}</TableCell>
                  <TableCell>{exam.doctor}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      style={{
                        color: exam.status === 'Terminé' ? 'var(--success-color)' : 'var(--text-secondary)'
                      }}
                    >
                      {exam.status}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {record.notes && (
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {record.notes}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default MedicalRecord; 