package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportDTO {
    private Long id;
    private String instanceId;
    private String title;
    private String type;
    private String reportDate;
    private String content;
    private LocalDateTime createdAt;
    private Long doctorId;
    private String doctorName;
}
