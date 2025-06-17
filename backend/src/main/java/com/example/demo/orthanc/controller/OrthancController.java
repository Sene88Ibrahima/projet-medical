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
    @PreAuthorize("permitAll()")
    public ResponseEntity<DicomStudyDTO> getStudy(@PathVariable String studyId) {
        return ResponseEntity.ok(orthancService.getStudy(studyId));
    }

    @GetMapping("/studies")
    @PreAuthorize("permitAll()")
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
    
    @GetMapping("/study-ids")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<String>> getAllStudyIds(
            @RequestParam(required = false) String patientId) {
        System.out.println("Requête reçue pour /api/v1/dicom/study-ids avec patientId = " + patientId);
        try {
            // Récupérer directement les IDs d'études depuis Orthanc
            List<String> studyIds = orthancService.getStudyIds();
            System.out.println("Nombre d'IDs d'études récupérés : " + (studyIds != null ? studyIds.size() : 0));
            System.out.println("IDs d'études : " + studyIds);
            return ResponseEntity.ok(studyIds);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des IDs d'études : " + e.getMessage());
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
    @PreAuthorize("permitAll()")
    public ResponseEntity<DicomSeriesDTO> getSeries(@PathVariable String seriesId) {
        return ResponseEntity.ok(orthancService.getSeries(seriesId));
    }

    @GetMapping("/instances/{instanceId}")
    @PreAuthorize("permitAll()")
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
    @PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> getInstancePreview(@PathVariable String instanceId) {
        try {
            byte[] imageData = orthancService.getInstancePreview(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            
            // Ajouter des en-têtes de cache pour éviter les requêtes répétées
            headers.setCacheControl("public, max-age=86400"); // Cache côté client pendant 24h
            
            // Ajout d'en-têtes CORS pour permettre l'accès depuis n'importe quelle origine
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            
            // Ajouter un en-tête Vary pour indiquer que la réponse peut varier en fonction de l'en-tête Accept
            headers.add("Vary", "Accept");
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/instances/{instanceId}/image", produces = MediaType.IMAGE_JPEG_VALUE)
    @PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> getInstanceImage(@PathVariable String instanceId) {
        try {
            byte[] imageData = orthancService.getInstanceImage(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            
            // Ajouter des en-têtes de cache pour éviter les requêtes répétées
            headers.setCacheControl("public, max-age=86400"); // Cache côté client pendant 24h
            
            // Ajout d'en-têtes CORS pour permettre l'accès depuis n'importe quelle origine
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            
            // Ajouter un en-tête Vary pour indiquer que la réponse peut varier en fonction de l'en-tête Accept
            headers.add("Vary", "Accept");
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/instances/{instanceId}/file")
    @PreAuthorize("permitAll()")
    public ResponseEntity<byte[]> getInstanceFile(@PathVariable String instanceId) {
        try {
            byte[] dicomData = orthancService.getInstanceDicomFile(instanceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/dicom"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                    .filename("instance_" + instanceId + ".dcm")
                    .build());
            
            // Ajouter des en-têtes de cache pour éviter les requêtes répétées
            headers.setCacheControl("public, max-age=86400"); // Cache côté client pendant 24h
            
            // Ajout d'en-têtes CORS pour permettre l'accès depuis n'importe quelle origine
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            
            // Ajouter un en-tête Vary pour indiquer que la réponse peut varier en fonction de l'en-tête Accept
            headers.add("Vary", "Accept");
            
            return new ResponseEntity<>(dicomData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}