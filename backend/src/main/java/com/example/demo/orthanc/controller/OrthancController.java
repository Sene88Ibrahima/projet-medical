package com.example.demo.orthanc.controller;

import com.example.demo.orthanc.dto.*;
import com.example.demo.orthanc.service.OrthancService;
import lombok.RequiredArgsConstructor;
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
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DicomStudyDTO> getStudy(@PathVariable String studyId) {
        return ResponseEntity.ok(orthancService.getStudy(studyId));
    }

    @GetMapping("/studies")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<DicomStudyDTO>> getAllStudies(
            @RequestParam String patientId) {
        return ResponseEntity.ok(orthancService.getAllStudies(patientId));
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
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DicomSeriesDTO> getSeries(@PathVariable String seriesId) {
        return ResponseEntity.ok(orthancService.getSeries(seriesId));
    }

    @GetMapping("/instances/{instanceId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
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
}