package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une référence à une image médicale DICOM stockée dans Orthanc.
 * Cette entité permet de lier directement un dossier médical à une image DICOM.
 */
@Entity
@Table(name = "medical_image_references")
public class MedicalImageReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "orthanc_instance_id", nullable = false)
    private String orthancInstanceId;
    
    @Column(name = "orthanc_series_id")
    private String orthancSeriesId;
    
    @Column(name = "orthanc_study_id")
    private String orthancStudyId;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructeurs
    public MedicalImageReference() {
        this.createdAt = LocalDateTime.now();
    }

    public MedicalImageReference(MedicalRecord medicalRecord, String orthancInstanceId, String description) {
        this.medicalRecord = medicalRecord;
        this.orthancInstanceId = orthancInstanceId;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MedicalRecord getMedicalRecord() {
        return medicalRecord;
    }

    public void setMedicalRecord(MedicalRecord medicalRecord) {
        this.medicalRecord = medicalRecord;
    }

    public String getOrthancInstanceId() {
        return orthancInstanceId;
    }

    public void setOrthancInstanceId(String orthancInstanceId) {
        this.orthancInstanceId = orthancInstanceId;
    }

    public String getOrthancSeriesId() {
        return orthancSeriesId;
    }

    public void setOrthancSeriesId(String orthancSeriesId) {
        this.orthancSeriesId = orthancSeriesId;
    }

    public String getOrthancStudyId() {
        return orthancStudyId;
    }

    public void setOrthancStudyId(String orthancStudyId) {
        this.orthancStudyId = orthancStudyId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "MedicalImageReference{" +
                "id=" + id +
                ", medicalRecord=" + (medicalRecord != null ? medicalRecord.getId() : "null") +
                ", orthancInstanceId='" + orthancInstanceId + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
