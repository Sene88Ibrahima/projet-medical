package com.example.demo.controller;

import com.example.demo.dto.MedicalImageDTO;
import com.example.demo.model.MedicalImage;
import com.example.demo.service.MedicalImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/medical-images")
@RequiredArgsConstructor
public class MedicalImageController {

    private final MedicalImageService medicalImageService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalImageDTO> uploadDicomImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recordId") Long recordId,
            @RequestParam(value = "description", required = false) String description) {
        
        MedicalImage image = medicalImageService.uploadAndLinkDicomImage(file, recordId, description);
        return ResponseEntity.ok(mapToDTO(image));
    }

    @PostMapping("/link")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalImageDTO> linkExistingDicomImage(
            @RequestParam("instanceId") String instanceId,
            @RequestParam("recordId") Long recordId,
            @RequestParam(value = "description", required = false) String description) {
        
        MedicalImage image = medicalImageService.addImageToRecord(recordId, instanceId, description);
        return ResponseEntity.ok(mapToDTO(image));
    }

    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<MedicalImageDTO>> getImagesForRecord(@PathVariable Long recordId) {
        List<MedicalImage> images = medicalImageService.getImagesForRecord(recordId);
        List<MedicalImageDTO> imageDTOs = images.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(imageDTOs);
    }

    @PutMapping("/{imageId}/annotations")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalImageDTO> updateAnnotations(
            @PathVariable Long imageId,
            @RequestBody String annotations) {
        
        MedicalImage updatedImage = medicalImageService.updateImageAnnotations(imageId, annotations);
        return ResponseEntity.ok(mapToDTO(updatedImage));
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long imageId,
            @RequestParam(value = "deleteFromOrthanc", defaultValue = "false") boolean deleteFromOrthanc) {
        
        medicalImageService.deleteImage(imageId, deleteFromOrthanc);
        return ResponseEntity.noContent().build();
    }

    private MedicalImageDTO mapToDTO(MedicalImage image) {
        return MedicalImageDTO.builder()
                .id(image.getId())
                .medicalRecordId(image.getMedicalRecord().getId())
                .orthancInstanceId(image.getOrthancInstanceId())
                .uploadedAt(image.getUploadedAt())
                .imageType(image.getImageType())
                .description(image.getDescription())
                .annotations(image.getAnnotations())
                .build();
    }
}
