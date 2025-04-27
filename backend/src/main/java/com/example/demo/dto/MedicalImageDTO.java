package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalImageDTO {
    private Long id;
    private Long medicalRecordId;
    private String orthancInstanceId;
    private String imageType;
    private String description;
    private LocalDateTime uploadedAt;
    private String annotations;
} 