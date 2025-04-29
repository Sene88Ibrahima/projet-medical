package com.example.demo.service;

import com.example.demo.dto.PatientDicomImageDTO;
import com.example.demo.model.PatientDicomImage;
import com.example.demo.model.User;
import com.example.demo.repository.PatientDicomImageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gérer les images DICOM associées aux patients.
 */
@Service
public class PatientDicomImageService {

    @Autowired
    private PatientDicomImageRepository patientDicomImageRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DicomService dicomService;

    /**
     * Crée une nouvelle référence d'image DICOM pour un patient.
     *
     * @param dto DTO contenant les informations de l'image DICOM
     * @return DTO de l'image DICOM créée
     */
    @Transactional
    public PatientDicomImageDTO createPatientDicomImage(PatientDicomImageDTO dto) {
        // Vérifier si le patient existe
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'ID: " + dto.getPatientId()));

        // Vérifier si l'instance DICOM est déjà associée à ce patient
        if (patientDicomImageRepository.existsByOrthancInstanceIdAndPatientId(
                dto.getOrthancInstanceId(), dto.getPatientId())) {
            throw new RuntimeException("Cette image est déjà associée à ce patient");
        }

        // Créer une nouvelle référence d'image
        PatientDicomImage image = new PatientDicomImage();
        image.setPatient(patient);
        image.setOrthancInstanceId(dto.getOrthancInstanceId());
        image.setOrthancSeriesId(dto.getOrthancSeriesId());
        image.setOrthancStudyId(dto.getOrthancStudyId());
        image.setDescription(dto.getDescription());
        image.setCreatedAt(LocalDateTime.now());

        // Sauvegarder l'image
        PatientDicomImage savedImage = patientDicomImageRepository.save(image);

        // Convertir et retourner le DTO
        return convertToDTO(savedImage);
    }

    /**
     * Télécharge une image DICOM pour un patient.
     *
     * @param file Fichier DICOM à télécharger
     * @param patientId ID du patient
     * @param description Description de l'image
     * @return DTO de l'image DICOM créée
     */
    @Transactional
    public PatientDicomImageDTO uploadDicomImage(MultipartFile file, Long patientId, String description) {
        // Vérifier si le patient existe
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'ID: " + patientId));

        try {
            // Télécharger l'image vers Orthanc
            String instanceId = dicomService.uploadDicomFile(file);
            
            // Récupérer les informations de l'instance
            String seriesId = null;
            String studyId = null;
            try {
                // Essayer de récupérer les informations de l'instance
                seriesId = dicomService.getSeriesIdForInstance(instanceId);
                studyId = dicomService.getStudyIdForInstance(instanceId);
            } catch (Exception e) {
                // En cas d'erreur, continuer avec des valeurs nulles
                System.err.println("Erreur lors de la récupération des détails de l'instance: " + e.getMessage());
            }
            
            // Créer une nouvelle référence d'image
            PatientDicomImage image = new PatientDicomImage();
            image.setPatient(patient);
            image.setOrthancInstanceId(instanceId);
            image.setOrthancSeriesId(seriesId);
            image.setOrthancStudyId(studyId);
            image.setDescription(description);
            image.setCreatedAt(LocalDateTime.now());

            // Sauvegarder l'image
            PatientDicomImage savedImage = patientDicomImageRepository.save(image);

            // Convertir et retourner le DTO
            return convertToDTO(savedImage);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du téléchargement de l'image DICOM: " + e.getMessage(), e);
        }
    }

    /**
     * Récupère toutes les images DICOM associées à un patient.
     *
     * @param patientId ID du patient
     * @return Liste des DTOs des images DICOM
     */
    @Transactional(readOnly = true)
    public List<PatientDicomImageDTO> getPatientDicomImages(Long patientId) {
        // Vérifier si le patient existe
        if (!userRepository.existsById(patientId)) {
            throw new RuntimeException("Patient non trouvé avec l'ID: " + patientId);
        }

        // Récupérer les images DICOM
        List<PatientDicomImage> images = patientDicomImageRepository.findByPatientId(patientId);

        // Convertir et retourner les DTOs
        return images.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Supprime une image DICOM.
     *
     * @param id ID de l'image DICOM à supprimer
     * @param deleteFromOrthanc Si true, supprime également l'instance de Orthanc
     */
    @Transactional
    public void deleteDicomImage(Long id, boolean deleteFromOrthanc) {
        // Récupérer l'image DICOM
        PatientDicomImage image = patientDicomImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image DICOM non trouvée avec l'ID: " + id));

        // Supprimer l'instance de Orthanc si demandé
        if (deleteFromOrthanc) {
            try {
                dicomService.deleteInstance(image.getOrthancInstanceId());
            } catch (Exception e) {
                // Continuer même si la suppression de l'instance échoue
                System.err.println("Erreur lors de la suppression de l'instance Orthanc: " + e.getMessage());
            }
        }

        // Supprimer l'image de la base de données
        patientDicomImageRepository.deleteById(id);
    }

    /**
     * Récupère une image DICOM par son ID.
     *
     * @param id ID de l'image DICOM
     * @return DTO de l'image DICOM
     */
    @Transactional(readOnly = true)
    public PatientDicomImageDTO getDicomImageById(Long id) {
        PatientDicomImage image = patientDicomImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image DICOM non trouvée avec l'ID: " + id));
        return convertToDTO(image);
    }

    /**
     * Convertit une entité PatientDicomImage en DTO.
     *
     * @param image Entité à convertir
     * @return DTO correspondant
     */
    private PatientDicomImageDTO convertToDTO(PatientDicomImage image) {
        PatientDicomImageDTO dto = new PatientDicomImageDTO();
        dto.setId(image.getId());
        dto.setPatientId(image.getPatient().getId());
        dto.setPatientFirstName(image.getPatient().getFirstName());
        dto.setPatientLastName(image.getPatient().getLastName());
        dto.setOrthancInstanceId(image.getOrthancInstanceId());
        dto.setOrthancSeriesId(image.getOrthancSeriesId());
        dto.setOrthancStudyId(image.getOrthancStudyId());
        dto.setDescription(image.getDescription());
        dto.setCreatedAt(image.getCreatedAt());
        return dto;
    }
}
