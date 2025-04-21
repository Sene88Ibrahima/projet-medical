package com.example.demo.orthanc.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DicomSeriesDTO {
    private String id;
    private String description;
    private String modality;
    private List<DicomInstanceDTO> instances;
}
