package com.example.demo.orthanc.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DicomStudyDTO {
    private String id;
    private String patientName;
    private String patientId;
    private String studyDescription;
    private LocalDateTime studyDate;
    private List<DicomSeriesDTO> series;
}