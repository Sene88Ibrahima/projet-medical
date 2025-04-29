package com.example.demo.repository;

import com.example.demo.model.PatientDicomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour accu00e9der aux images DICOM associu00e9es aux patients dans la base de donnu00e9es.
 */
@Repository
public interface PatientDicomImageRepository extends JpaRepository<PatientDicomImage, Long> {

    /**
     * Trouve toutes les images DICOM associu00e9es u00e0 un patient spu00e9cifique.
     *
     * @param patientId ID du patient
     * @return Liste des images DICOM associu00e9es au patient
     */
    List<PatientDicomImage> findByPatientId(Long patientId);

    /**
     * Vu00e9rifie si une instance DICOM est du00e9ju00e0 associu00e9e u00e0 un patient.
     *
     * @param orthancInstanceId ID de l'instance DICOM dans Orthanc
     * @param patientId ID du patient
     * @return true si l'association existe du00e9ju00e0, false sinon
     */
    boolean existsByOrthancInstanceIdAndPatientId(String orthancInstanceId, Long patientId);

    /**
     * Trouve toutes les images DICOM associu00e9es u00e0 une u00e9tude DICOM spu00e9cifique.
     *
     * @param orthancStudyId ID de l'u00e9tude DICOM dans Orthanc
     * @return Liste des images DICOM associu00e9es u00e0 l'u00e9tude
     */
    List<PatientDicomImage> findByOrthancStudyId(String orthancStudyId);
}
