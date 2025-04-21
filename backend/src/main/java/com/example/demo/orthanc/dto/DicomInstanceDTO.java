package com.example.demo.orthanc.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DicomInstanceDTO {
    private String id;
    private String sopInstanceUid;
    private Integer instanceNumber;
    private String fileSize;
    private LocalDateTime acquisitionDateTime;
}