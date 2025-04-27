package com.example.demo.repository;

import com.example.demo.model.MedicalImage;
import com.example.demo.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalImageRepository extends JpaRepository<MedicalImage, Long> {
    List<MedicalImage> findByMedicalRecord(MedicalRecord medicalRecord);
    List<MedicalImage> findByMedicalRecord_Id(Long medicalRecordId);
    Optional<MedicalImage> findByOrthancInstanceId(String orthancInstanceId);
}