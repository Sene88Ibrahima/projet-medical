package com.example.demo.service;

import com.example.demo.dto.MedicalImageReferenceDTO;
import com.example.demo.model.MedicalImageReference;
import com.example.demo.model.MedicalRecord;
import com.example.demo.repository.MedicalImageReferenceRepository;
import com.example.demo.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gu00e9rer les ru00e9fu00e9rences d'images mu00e9dicales.
 */
@Service
public class MedicalImageReferenceService {

    @Autowired
    private MedicalImageReferenceRepository medicalImageReferenceRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    /**
     * Cru00e9e une nouvelle ru00e9fu00e9rence d'image mu00e9dicale.
     *
     * @param dto DTO contenant les informations de la ru00e9fu00e9rence d'image
     * @return DTO de la ru00e9fu00e9rence d'image cru00e9u00e9e
     */
    @Transactional
    public MedicalImageReferenceDTO createMedicalImageReference(MedicalImageReferenceDTO dto) {
        // Vu00e9rifier si le dossier mu00e9dical existe
        MedicalRecord medicalRecord = medicalRecordRepository.findById(dto.getMedicalRecordId())
                .orElseThrow(() -> new RuntimeException("Dossier mu00e9dical non trouvé avec l'ID: " + dto.getMedicalRecordId()));

        // Vu00e9rifier si l'instance DICOM est du00e9ju00e0 associu00e9e u00e0 ce dossier mu00e9dical
        if (medicalImageReferenceRepository.existsByOrthancInstanceIdAndMedicalRecordId(
                dto.getOrthancInstanceId(), dto.getMedicalRecordId())) {
            throw new RuntimeException("Cette image est du00e9ju00e0 associu00e9e u00e0 ce dossier mu00e9dical");
        }

        // Cru00e9er une nouvelle ru00e9fu00e9rence d'image
        MedicalImageReference reference = new MedicalImageReference();
        reference.setMedicalRecord(medicalRecord);
        reference.setOrthancInstanceId(dto.getOrthancInstanceId());
        reference.setOrthancSeriesId(dto.getOrthancSeriesId());
        reference.setOrthancStudyId(dto.getOrthancStudyId());
        reference.setDescription(dto.getDescription());
        reference.setCreatedAt(LocalDateTime.now());

        // Sauvegarder la ru00e9fu00e9rence
        MedicalImageReference savedReference = medicalImageReferenceRepository.save(reference);

        // Convertir et retourner le DTO
        return convertToDTO(savedReference);
    }

    /**
     * Ru00e9cupu00e8re toutes les ru00e9fu00e9rences d'images associu00e9es u00e0 un dossier mu00e9dical.
     *
     * @param medicalRecordId ID du dossier mu00e9dical
     * @return Liste des DTOs des ru00e9fu00e9rences d'images
     */
    @Transactional(readOnly = true)
    public List<MedicalImageReferenceDTO> getMedicalImageReferencesByMedicalRecordId(Long medicalRecordId) {
        // Vu00e9rifier si le dossier mu00e9dical existe
        if (!medicalRecordRepository.existsById(medicalRecordId)) {
            throw new RuntimeException("Dossier mu00e9dical non trouvé avec l'ID: " + medicalRecordId);
        }

        // Ru00e9cupu00e9rer les ru00e9fu00e9rences d'images
        List<MedicalImageReference> references = medicalImageReferenceRepository.findByMedicalRecordId(medicalRecordId);

        // Convertir et retourner les DTOs
        return references.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Supprime une ru00e9fu00e9rence d'image mu00e9dicale.
     *
     * @param id ID de la ru00e9fu00e9rence d'image u00e0 supprimer
     */
    @Transactional
    public void deleteMedicalImageReference(Long id) {
        // Vu00e9rifier si la ru00e9fu00e9rence existe
        if (!medicalImageReferenceRepository.existsById(id)) {
            throw new RuntimeException("Ru00e9fu00e9rence d'image non trouvée avec l'ID: " + id);
        }

        // Supprimer la ru00e9fu00e9rence
        medicalImageReferenceRepository.deleteById(id);
    }

    /**
     * Convertit une entitu00e9 MedicalImageReference en DTO.
     *
     * @param reference Entitu00e9 u00e0 convertir
     * @return DTO correspondant
     */
    private MedicalImageReferenceDTO convertToDTO(MedicalImageReference reference) {
        MedicalImageReferenceDTO dto = new MedicalImageReferenceDTO();
        dto.setId(reference.getId());
        dto.setMedicalRecordId(reference.getMedicalRecord().getId());
        dto.setOrthancInstanceId(reference.getOrthancInstanceId());
        dto.setOrthancSeriesId(reference.getOrthancSeriesId());
        dto.setOrthancStudyId(reference.getOrthancStudyId());
        dto.setDescription(reference.getDescription());
        dto.setCreatedAt(reference.getCreatedAt());
        return dto;
    }
}
