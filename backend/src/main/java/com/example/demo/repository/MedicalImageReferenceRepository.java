package com.example.demo.repository;

import com.example.demo.model.MedicalImageReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour accu00e9der aux ru00e9fu00e9rences d'images mu00e9dicales dans la base de donnu00e9es.
 */
@Repository
public interface MedicalImageReferenceRepository extends JpaRepository<MedicalImageReference, Long> {

    /**
     * Trouve toutes les ru00e9fu00e9rences d'images associu00e9es u00e0 un dossier mu00e9dical spu00e9cifique.
     *
     * @param medicalRecordId ID du dossier mu00e9dical
     * @return Liste des ru00e9fu00e9rences d'images associu00e9es au dossier mu00e9dical
     */
    List<MedicalImageReference> findByMedicalRecordId(Long medicalRecordId);

    /**
     * Vu00e9rifie si une instance DICOM est du00e9ju00e0 associu00e9e u00e0 un dossier mu00e9dical.
     *
     * @param orthancInstanceId ID de l'instance DICOM dans Orthanc
     * @param medicalRecordId ID du dossier mu00e9dical
     * @return true si l'association existe du00e9ju00e0, false sinon
     */
    boolean existsByOrthancInstanceIdAndMedicalRecordId(String orthancInstanceId, Long medicalRecordId);

    /**
     * Trouve toutes les ru00e9fu00e9rences d'images associu00e9es u00e0 une u00e9tude DICOM spu00e9cifique.
     *
     * @param orthancStudyId ID de l'u00e9tude DICOM dans Orthanc
     * @return Liste des ru00e9fu00e9rences d'images associu00e9es u00e0 l'u00e9tude
     */
    List<MedicalImageReference> findByOrthancStudyId(String orthancStudyId);
}
