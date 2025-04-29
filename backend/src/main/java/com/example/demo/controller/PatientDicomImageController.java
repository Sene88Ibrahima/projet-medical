package com.example.demo.controller;

import com.example.demo.dto.PatientDicomImageDTO;
import com.example.demo.service.PatientDicomImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Contrôleur REST pour gérer les images DICOM associées aux patients.
 */
@RestController
@RequestMapping("/api/v1/dicom")
public class PatientDicomImageController {

    @Autowired
    private PatientDicomImageService patientDicomImageService;

    /**
     * Télécharge une image DICOM pour un patient.
     *
     * @param file Fichier DICOM à télécharger
     * @param patientId ID du patient
     * @param description Description de l'image
     * @return DTO de l'image DICOM créée
     */
    @PostMapping("/patient-upload")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientDicomImageDTO> uploadDicomImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "description", required = false) String description) {
        PatientDicomImageDTO createdDto = patientDicomImageService.uploadDicomImage(file, patientId, description);
        return new ResponseEntity<>(createdDto, HttpStatus.CREATED);
    }

    /**
     * Crée une nouvelle référence d'image DICOM pour un patient.
     *
     * @param dto DTO contenant les informations de l'image DICOM
     * @return DTO de l'image DICOM créée
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientDicomImageDTO> createPatientDicomImage(
            @RequestBody PatientDicomImageDTO dto) {
        PatientDicomImageDTO createdDto = patientDicomImageService.createPatientDicomImage(dto);
        return new ResponseEntity<>(createdDto, HttpStatus.CREATED);
    }

    /**
     * Récupère toutes les images DICOM associées à un patient.
     *
     * @param patientId ID du patient
     * @return Liste des DTOs des images DICOM
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'NURSE', 'PATIENT')")
    public ResponseEntity<List<PatientDicomImageDTO>> getPatientDicomImages(
            @PathVariable Long patientId) {
        List<PatientDicomImageDTO> dtos = patientDicomImageService.getPatientDicomImages(patientId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    /**
     * Récupère une image DICOM par son ID.
     *
     * @param id ID de l'image DICOM
     * @return DTO de l'image DICOM
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'NURSE', 'PATIENT')")
    public ResponseEntity<PatientDicomImageDTO> getDicomImageById(
            @PathVariable Long id) {
        PatientDicomImageDTO dto = patientDicomImageService.getDicomImageById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    /**
     * Supprime une image DICOM.
     *
     * @param id ID de l'image DICOM à supprimer
     * @param deleteFromOrthanc Si true, supprime également l'instance de Orthanc
     * @return Réponse vide avec statut 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteDicomImage(
            @PathVariable Long id,
            @RequestParam(value = "deleteFromOrthanc", defaultValue = "false") boolean deleteFromOrthanc) {
        patientDicomImageService.deleteDicomImage(id, deleteFromOrthanc);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
