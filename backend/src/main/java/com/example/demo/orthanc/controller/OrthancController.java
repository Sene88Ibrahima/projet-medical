package com.example.demo.orthanc.controller;

import com.example.demo.orthanc.dto.*;
import com.example.demo.orthanc.service.OrthancService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dicom")
@RequiredArgsConstructor
public class OrthancController {

    private final OrthancService orthancService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<OrthancResponse> uploadDicomFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String patientId) {
        return ResponseEntity.ok(orthancService.uploadDicomFile(file));
    }

    @GetMapping("/studies/{studyId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<DicomStudyDTO> getStudy(@PathVariable String studyId) {
        return ResponseEntity.ok(orthancService.getStudy(studyId));
    }

    @GetMapping("/studies")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<List<DicomStudyDTO>> getAllStudies(
            @RequestParam(required = false) String patientId) {
        System.out.println("Requête reçue pour /api/v1/dicom/studies avec patientId = " + patientId);
        try {
            List<DicomStudyDTO> studies = orthancService.getStudies();
            System.out.println("Nombre d'études récupérées : " + (studies != null ? studies.size() : 0));
            return ResponseEntity.ok(studies);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des études : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/studies/{studyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudy(@PathVariable String studyId) {
        orthancService.deleteStudy(studyId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/studies/{studyId}/anonymize")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<OrthancResponse> anonymizeStudy(
            @PathVariable String studyId,
            @RequestParam(required = false) List<String> keepTags) {
        return ResponseEntity.ok(orthancService.anonymizeStudy(studyId, keepTags));
    }

    @GetMapping("/series/{seriesId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<DicomSeriesDTO> getSeries(@PathVariable String seriesId) {
        return ResponseEntity.ok(orthancService.getSeries(seriesId));
    }

    @GetMapping("/instances/{instanceId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<DicomInstanceDTO> getInstance(@PathVariable String instanceId) {
        return ResponseEntity.ok(orthancService.getInstance(instanceId));
    }

    @PostMapping("/instances/{instanceId}/modify")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<OrthancResponse> modifyInstance(
            @PathVariable String instanceId,
            @RequestBody ModifyInstanceRequest request) {
        return ResponseEntity.ok(orthancService.modifyInstance(instanceId, request));
    }

    @GetMapping("/instances/{instanceId}/preview")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    public ResponseEntity<byte[]> getInstancePreview(@PathVariable String instanceId) {
        try {
            byte[] imageData = orthancService.getInstancePreview(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/instances/{instanceId}/image", produces = MediaType.IMAGE_JPEG_VALUE)
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<byte[]> getInstanceImage(@PathVariable String instanceId) {
        try {
            byte[] imageData = orthancService.getInstanceImage(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/instances/{instanceId}/file")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<byte[]> getInstanceFile(@PathVariable String instanceId) {
        try {
            byte[] dicomData = orthancService.getInstanceDicomFile(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/dicom"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                    .filename("instance_" + instanceId + ".dcm")
                    .build());
            
            return new ResponseEntity<>(dicomData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}