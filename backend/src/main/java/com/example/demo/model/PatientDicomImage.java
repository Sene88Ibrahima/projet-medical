package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une image DICOM associée à un patient.
 */
@Entity
@Table(name = "patient_dicom_images")
public class PatientDicomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

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
    public PatientDicomImage() {
    }

    public PatientDicomImage(User patient, String orthancInstanceId, String orthancSeriesId, 
                           String orthancStudyId, String description) {
        this.patient = patient;
        this.orthancInstanceId = orthancInstanceId;
        this.orthancSeriesId = orthancSeriesId;
        this.orthancStudyId = orthancStudyId;
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

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
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
        return "PatientDicomImage{" +
                "id=" + id +
                ", patient=" + (patient != null ? patient.getId() : null) +
                ", orthancInstanceId='" + orthancInstanceId + '\'' +
                ", orthancSeriesId='" + orthancSeriesId + '\'' +
                ", orthancStudyId='" + orthancStudyId + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
