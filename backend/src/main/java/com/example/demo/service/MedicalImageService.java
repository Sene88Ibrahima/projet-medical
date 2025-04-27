package com.example.demo.service;

import com.example.demo.model.MedicalImage;
import com.example.demo.model.MedicalRecord;
import com.example.demo.orthanc.dto.DicomInstanceDTO;
import com.example.demo.orthanc.service.OrthancService;
import com.example.demo.repository.MedicalImageRepository;
import com.example.demo.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalImageService {
    private final MedicalImageRepository medicalImageRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final OrthancService orthancService;
    
    /**
     * Télécharge un fichier DICOM vers Orthanc et l'associe à un dossier médical
     */
    @Transactional
    public MedicalImage uploadAndLinkDicomImage(MultipartFile file, Long recordId, String description) {
        // Vérifier que le dossier médical existe
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));
        
        // Télécharger le fichier vers Orthanc
        var orthancResponse = orthancService.uploadDicomFile(file);
        
        // Créer l'entrée dans la base de données
        MedicalImage image = MedicalImage.builder()
                .medicalRecord(record)
                .orthancInstanceId(orthancResponse.getId())
                .uploadedAt(LocalDateTime.now())
                .imageType("DICOM")
                .description(description)
                .build();
        
        return medicalImageRepository.save(image);
    }
    
    /**
     * Ajoute une image DICOM existante dans Orthanc à un dossier médical
     */
    @Transactional
    public MedicalImage addImageToRecord(Long recordId, String orthancInstanceId, String description) {
        // Vérifier que le dossier médical existe
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));
        
        // Vérifier que l'instance existe dans Orthanc
        try {
            orthancService.getInstance(orthancInstanceId);
        } catch (Exception e) {
            throw new RuntimeException("Instance DICOM non trouvée dans Orthanc", e);
        }
        
        // Créer l'entrée dans la base de données
        MedicalImage image = MedicalImage.builder()
                .medicalRecord(record)
                .orthancInstanceId(orthancInstanceId)
                .uploadedAt(LocalDateTime.now())
                .imageType("DICOM")
                .description(description)
                .build();
        
        return medicalImageRepository.save(image);
    }
    
    /**
     * Récupère toutes les images associées à un dossier médical
     */
    public List<MedicalImage> getImagesForRecord(Long recordId) {
        return medicalImageRepository.findByMedicalRecord_Id(recordId);
    }
    
    /**
     * Met à jour les annotations d'une image médicale
     */
    @Transactional
    public MedicalImage updateImageAnnotations(Long imageId, String annotations) {
        MedicalImage image = medicalImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));
        
        image.setAnnotations(annotations);
        return medicalImageRepository.save(image);
    }
    
    /**
     * Supprime une image médicale et éventuellement l'instance correspondante dans Orthanc
     */
    @Transactional
    public void deleteImage(Long imageId, boolean deleteFromOrthanc) {
        MedicalImage image = medicalImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));
        
        // Supprimer l'image d'Orthanc si demandé
        if (deleteFromOrthanc && image.getOrthancInstanceId() != null) {
            try {
                orthancService.deleteStudy(image.getOrthancInstanceId());
            } catch (Exception e) {
                // Continuer même si l'image n'existe plus dans Orthanc
                log.warn("Impossible de supprimer l'instance d'Orthanc: {}", e.getMessage());
            }
        }
        
        // Supprimer l'entrée de la base de données
        medicalImageRepository.delete(image);
    }
}
