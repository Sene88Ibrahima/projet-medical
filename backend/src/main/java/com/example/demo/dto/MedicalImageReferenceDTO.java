package com.example.demo.dto;

import java.time.LocalDateTime;

/**
 * DTO pour transfu00e9rer les donnu00e9es des ru00e9fu00e9rences d'images mu00e9dicales entre le backend et le frontend.
 */
public class MedicalImageReferenceDTO {

    private Long id;
    private Long medicalRecordId;
    private String orthancInstanceId;
    private String orthancSeriesId;
    private String orthancStudyId;
    private String description;
    private LocalDateTime createdAt;

    // Constructeurs
    public MedicalImageReferenceDTO() {
    }

    public MedicalImageReferenceDTO(Long id, Long medicalRecordId, String orthancInstanceId, 
                                  String orthancSeriesId, String orthancStudyId, 
                                  String description, LocalDateTime createdAt) {
        this.id = id;
        this.medicalRecordId = medicalRecordId;
        this.orthancInstanceId = orthancInstanceId;
        this.orthancSeriesId = orthancSeriesId;
        this.orthancStudyId = orthancStudyId;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMedicalRecordId() {
        return medicalRecordId;
    }

    public void setMedicalRecordId(Long medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
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
        return "MedicalImageReferenceDTO{" +
                "id=" + id +
                ", medicalRecordId=" + medicalRecordId +
                ", orthancInstanceId='" + orthancInstanceId + '\'' +
                ", orthancSeriesId='" + orthancSeriesId + '\'' +
                ", orthancStudyId='" + orthancStudyId + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
