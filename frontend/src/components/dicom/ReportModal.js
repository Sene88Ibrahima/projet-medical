import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import ShareDialog from '../ShareDialog';
import { useState } from 'react';
import MedicalReportPanel from './MedicalReportPanel';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Full-screen modal displaying the MedicalReportPanel.
 * Mirrors styling/behaviour of ArticleModal for UI consistency.
 */
const ReportModal = ({ open, onClose, selectedInstance }) => {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative', background: 'linear-gradient(90deg,#1976d2 0%,#42a5f5 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Fermer">
            <CloseIcon />
          </IconButton>
          <IconButton onClick={() => setShareOpen(true)} sx={{ position: 'absolute', top: 8, right: 48, color: '#fff' }}>
            <ShareIcon />
          </IconButton>
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Consultation du rapport
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Body */}
      <MedicalReportPanel instanceId={selectedInstance?.id} />
    <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} onConfirm={(ids)=> console.log('share report',ids)} />
</Dialog>
  );
};

ReportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedInstance: PropTypes.object,
};

ReportModal.defaultProps = {
  selectedInstance: null,
};

export default ReportModal;
