package com.example.demo.orthanc.service;

import com.example.demo.orthanc.config.OrthancProperties;
import com.example.demo.orthanc.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import com.example.demo.orthanc.security.DicomEncryptionService;
import com.example.demo.orthanc.security.DicomAuditService;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrthancService {
    private final OrthancProperties orthancProperties;
    private final RestTemplate restTemplate;
    private final DicomEncryptionService encryptionService;
    private final DicomAuditService auditService;

    public OrthancResponse uploadDicomFile(MultipartFile file) {
        try {
            log.info("Début du téléversement du fichier DICOM: {}", file.getOriginalFilename());
            byte[] content = file.getBytes();
            
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            
            log.info("En-têtes de la requête: {}", headers);
            log.info("URL de l'API Orthanc: {}", orthancProperties.getApi().getUrl() + "/instances");

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(content, headers);
            
            try {
                ResponseEntity<OrthancResponse> response = restTemplate.exchange(
                    orthancProperties.getApi().getUrl() + "/instances",
                    HttpMethod.POST,
                    requestEntity,
                    OrthancResponse.class
                );
                
                // Afficher la structure de la réponse
                log.info("Réponse d'Orthanc pour l'upload: {}", response.getBody());
                log.info("Code de statut HTTP: {}", response.getStatusCode());
                
                if (response.getBody() != null) {
                    log.info("ID de l'instance: {}", response.getBody().getId());
                    
                    // Audit de l'upload
                    auditService.logAccess(
                        SecurityContextHolder.getContext().getAuthentication().getName(),
                        response.getBody().getId(),
                        "UPLOAD",
                        "SUCCESS"
                    );
                    
                    return response.getBody();
                } else {
                    log.error("La réponse d'Orthanc est vide");
                    throw new RuntimeException("La réponse d'Orthanc est vide");
                }
            } catch (Exception e) {
                log.error("Erreur lors de l'appel à l'API Orthanc: {}", e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } catch (Exception e) {
            // Audit de l'échec
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                null,
                "UPLOAD",
                "FAILURE: " + e.getMessage()
            );
            log.error("Error uploading DICOM file", e);
            throw new RuntimeException("Failed to upload DICOM file", e);
        }
    }

    public List<DicomStudyDTO> getStudies() {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);
            String url = orthancProperties.getApi().getUrl() + "/studies";
            
            log.info("Récupération des études depuis Orthanc: {}", url);
            System.out.println("URL Orthanc: " + url);
            System.out.println("En-têtes: " + headers);

            try {
                ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<List<String>>() {}
                );
                
                List<String> studyIds = response.getBody();
                System.out.println("Réponse d'Orthanc - Status: " + response.getStatusCode());
                System.out.println("Réponse d'Orthanc - Ids d'études: " + studyIds);
                
                List<DicomStudyDTO> studies = new ArrayList<>();
                
                if (studyIds != null) {
                    for (String studyId : studyIds) {
                        try {
                            System.out.println("Récupération des détails de l'étude: " + studyId);
                            DicomStudyDTO study = getStudy(studyId);
                            if (study != null) {
                                studies.add(study);
                            }
                        } catch (Exception e) {
                            log.error("Erreur lors de la récupération des détails de l'étude {}: {}", studyId, e.getMessage());
                            System.err.println("Erreur pour l'étude " + studyId + ": " + e.getMessage());
                        }
                    }
                }
                
                System.out.println("Nombre total d'études récupérées: " + studies.size());
                return studies;
            } catch (Exception e) {
                log.error("Erreur lors de l'appel à Orthanc: {}", e.getMessage());
                System.err.println("Erreur lors de l'appel à Orthanc: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des études", e);
            System.err.println("Exception générale: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Échec de la récupération des études", e);
        }
    }

    public List<DicomStudyDTO> getAllStudies(String patientId) {
        // Méthode maintenue pour compatibilité
        return getStudies();
    }

    public DicomStudyDTO getStudy(String studyId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<DicomStudyDTO> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/studies/" + studyId,
                HttpMethod.GET,
                requestEntity,
                DicomStudyDTO.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting study: {}", studyId, e);
            throw new RuntimeException("Failed to get study", e);
        }
    }

    public void deleteStudy(String studyId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/studies/" + studyId,
                HttpMethod.DELETE,
                requestEntity,
                Void.class
            );
        } catch (Exception e) {
            log.error("Error deleting study: {}", studyId, e);
            throw new RuntimeException("Failed to delete study", e);
        }
    }

    public OrthancResponse anonymizeStudy(String studyId, List<String> keepTags) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("Force", true);
            if (keepTags != null && !keepTags.isEmpty()) {
                requestBody.put("Keep", keepTags);
            }

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<OrthancResponse> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/studies/" + studyId + "/anonymize",
                HttpMethod.POST,
                requestEntity,
                OrthancResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error anonymizing study: {}", studyId, e);
            throw new RuntimeException("Failed to anonymize study", e);
        }
    }

    public DicomSeriesDTO getSeries(String seriesId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<DicomSeriesDTO> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/series/" + seriesId,
                HttpMethod.GET,
                requestEntity,
                DicomSeriesDTO.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting series: {}", seriesId, e);
            throw new RuntimeException("Failed to get series", e);
        }
    }

    public DicomInstanceDTO getInstance(String instanceId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<DicomInstanceDTO> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances/" + instanceId,
                HttpMethod.GET,
                requestEntity,
                DicomInstanceDTO.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting instance: {}", instanceId, e);
            throw new RuntimeException("Failed to get instance", e);
        }
    }

    public byte[] getInstancePreview(String instanceId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/preview",
                HttpMethod.GET,
                requestEntity,
                byte[].class
            );

            // Audit de l'accès
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "VIEW_PREVIEW",
                "SUCCESS"
            );

            return response.getBody();
        } catch (Exception e) {
            // Audit de l'échec
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "VIEW_PREVIEW",
                "FAILURE: " + e.getMessage()
            );
            log.error("Error getting instance preview: {}", instanceId, e);
            throw new RuntimeException("Failed to get instance preview", e);
        }
    }

    public byte[] getInstanceImage(String instanceId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/rendered",
                HttpMethod.GET,
                requestEntity,
                byte[].class
            );

            // Audit de l'accès
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "VIEW_IMAGE",
                "SUCCESS"
            );

            return response.getBody();
        } catch (Exception e) {
            // Audit de l'échec
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "VIEW_IMAGE",
                "FAILURE: " + e.getMessage()
            );
            log.error("Erreur lors de la récupération de l'image de l'instance: {}", instanceId, e);
            throw new RuntimeException("Échec de la récupération de l'image de l'instance", e);
        }
    }

    public OrthancResponse modifyInstance(String instanceId, ModifyInstanceRequest request) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("Replace", request.getReplaceTags());
            requestBody.put("Remove", request.getRemoveTags());
            requestBody.put("KeepPrivateTags", request.isKeepPrivateTags());

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<OrthancResponse> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/modify",
                HttpMethod.POST,
                requestEntity,
                OrthancResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error modifying instance: {}", instanceId, e);
            throw new RuntimeException("Failed to modify instance", e);
        }
    }

    public Map<String, Object> anonymizeStudy(String studyId, String keepTagsString) {
        List<String> keepTags = new ArrayList<>();
        if (keepTagsString != null && !keepTagsString.isEmpty()) {
            keepTags = Arrays.asList(keepTagsString.split(","));
        }
        
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("Force", true);
            if (keepTags != null && !keepTags.isEmpty()) {
                requestBody.put("Keep", keepTags);
            }

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/studies/" + studyId + "/anonymize",
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error anonymizing study: {}", studyId, e);
            throw new RuntimeException("Failed to anonymize study", e);
        }
    }

    /**
     * Récupère le fichier DICOM brut d'une instance
     * @param instanceId ID de l'instance
     * @return Contenu du fichier DICOM
     */
    public byte[] getInstanceDicomFile(String instanceId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            log.info("Récupération du fichier DICOM pour l'instance: {}", instanceId);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/file",
                HttpMethod.GET,
                requestEntity,
                byte[].class
            );

            // Audit de l'accès
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "DOWNLOAD_DICOM",
                "SUCCESS"
            );

            log.info("Fichier DICOM récupéré avec succès, taille: {} octets", 
                    response.getBody() != null ? response.getBody().length : 0);
            
            return response.getBody();
        } catch (Exception e) {
            // Audit de l'échec
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                instanceId,
                "DOWNLOAD_DICOM",
                "FAILURE: " + e.getMessage()
            );
            log.error("Erreur lors de la récupération du fichier DICOM: {}", instanceId, e);
            throw new RuntimeException("Échec de la récupération du fichier DICOM", e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = orthancProperties.getApi().getUsername() + ":" + 
                     orthancProperties.getApi().getPassword();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.add("Authorization", "Basic " + encodedAuth);
        return headers;
    }
}