// src/components/ShareDialog.js
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import userService from '../services/userService';

/**
 * Generic dialog to select one or many doctors and perform a share action.
 * Props:
 *   open        : boolean
 *   onClose     : () => void
 *   onConfirm   : (selectedIds:number[]) => Promise<void>|void
 */
const ShareDialog = ({ open, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]); // {label, id}
  const [value, setValue] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const doctors = await userService.getAllDoctors();
        setOptions(doctors.map((d) => ({ label: `${d.lastName} ${d.firstName}`, id: d.id })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const handleConfirm = async () => {
    if (!value.length) return;
    try {
      setSubmitting(true);
      await onConfirm(value.map((v) => v.id));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Partager avec des confrères</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Autocomplete
            multiple
            options={options}
            getOptionLabel={(opt) => opt.label}
            value={value}
            onChange={(_, newVal) => setValue(newVal)}
            renderInput={(params) => <TextField {...params} label="Choisir des médecins" placeholder="Recherche…" />}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button disabled={submitting || !value.length} onClick={handleConfirm} variant="contained">
          Partager
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
