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
            byte[] content = file.getBytes();
            
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(content, headers);
            ResponseEntity<OrthancResponse> response = restTemplate.exchange(
                orthancProperties.getApi().getUrl() + "/instances",
                HttpMethod.POST,
                requestEntity,
                OrthancResponse.class
            );

            // Audit de l'upload
            auditService.logAccess(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                response.getBody().getId(),
                "UPLOAD",
                "SUCCESS"
            );

            return response.getBody();
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

    public List<DicomStudyDTO> getAllStudies(String patientId) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);
            String url = orthancProperties.getApi().getUrl() + "/studies";
            
            if (patientId != null && !patientId.isEmpty()) {
                url += "?patientId=" + patientId;
            }

            ResponseEntity<List<DicomStudyDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<DicomStudyDTO>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting studies", e);
            throw new RuntimeException("Failed to get studies", e);
        }
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

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = orthancProperties.getApi().getUsername() + ":" + 
                     orthancProperties.getApi().getPassword();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.add("Authorization", "Basic " + encodedAuth);
        return headers;
    }
}