package com.example.demo.controller;

import com.example.demo.dto.MedicalImageReferenceDTO;
import com.example.demo.service.MedicalImageReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour gérer les références d'images médicales.
 */
@RestController
@RequestMapping("/api/v1/medical-image-references")
public class MedicalImageReferenceController {

    @Autowired
    private MedicalImageReferenceService medicalImageReferenceService;

    /**
     * Crée une nouvelle référence d'image médicale.
     *
     * @param dto DTO contenant les informations de la référence d'image
     * @return DTO de la référence d'image créée
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'NURSE')")
    public ResponseEntity<MedicalImageReferenceDTO> createMedicalImageReference(
            @RequestBody MedicalImageReferenceDTO dto) {
        MedicalImageReferenceDTO createdDto = medicalImageReferenceService.createMedicalImageReference(dto);
        return new ResponseEntity<>(createdDto, HttpStatus.CREATED);
    }

    /**
     * Récupère toutes les références d'images associées à un dossier médical.
     *
     * @param medicalRecordId ID du dossier médical
     * @return Liste des DTOs des références d'images
     */
    @GetMapping("/medical-record/{medicalRecordId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'NURSE', 'PATIENT')")
    public ResponseEntity<List<MedicalImageReferenceDTO>> getMedicalImageReferencesByMedicalRecordId(
            @PathVariable Long medicalRecordId) {
        List<MedicalImageReferenceDTO> dtos = medicalImageReferenceService
                .getMedicalImageReferencesByMedicalRecordId(medicalRecordId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    /**
     * Supprime une référence d'image médicale.
     *
     * @param id ID de la référence d'image à supprimer
     * @return Réponse vide avec statut 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteMedicalImageReference(@PathVariable Long id) {
        medicalImageReferenceService.deleteMedicalImageReference(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
