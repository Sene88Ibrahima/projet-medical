package com.example.demo.dto;

import java.time.LocalDateTime;

/**
 * DTO pour transférer les données des images DICOM associées à un patient entre le backend et le frontend.
 */
public class PatientDicomImageDTO {

    private Long id;
    private Long patientId;
    private String patientFirstName;
    private String patientLastName;
    private String orthancInstanceId;
    private String orthancSeriesId;
    private String orthancStudyId;
    private String description;
    private LocalDateTime createdAt;

    // Constructeurs
    public PatientDicomImageDTO() {
    }

    public PatientDicomImageDTO(Long id, Long patientId, String patientFirstName, String patientLastName,
                              String orthancInstanceId, String orthancSeriesId, String orthancStudyId,
                              String description, LocalDateTime createdAt) {
        this.id = id;
        this.patientId = patientId;
        this.patientFirstName = patientFirstName;
        this.patientLastName = patientLastName;
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

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientFirstName() {
        return patientFirstName;
    }

    public void setPatientFirstName(String patientFirstName) {
        this.patientFirstName = patientFirstName;
    }

    public String getPatientLastName() {
        return patientLastName;
    }

    public void setPatientLastName(String patientLastName) {
        this.patientLastName = patientLastName;
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
        return "PatientDicomImageDTO{" +
                "id=" + id +
                ", patientId=" + patientId +
                ", patientFirstName='" + patientFirstName + '\'' +
                ", patientLastName='" + patientLastName + '\'' +
                ", orthancInstanceId='" + orthancInstanceId + '\'' +
                ", orthancSeriesId='" + orthancSeriesId + '\'' +
                ", orthancStudyId='" + orthancStudyId + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
