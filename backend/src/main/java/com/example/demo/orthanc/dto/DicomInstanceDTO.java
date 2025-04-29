package com.example.demo.orthanc.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DicomInstanceDTO {
    private String id;
    private String SOPInstanceUID;
    private String fileUuid;
    private String imageType;
    private Integer width;
    private Integer height;
    private Integer instanceNumber;
    private String fileSize;
    private LocalDateTime acquisitionDateTime;
    
    // URLs pour accéder aux ressources de l'instance
    private String imageUrl;  // URL pour l'image JPEG
    private String fileUrl;   // URL pour le fichier DICOM
    private String previewUrl; // URL pour l'aperçu
}