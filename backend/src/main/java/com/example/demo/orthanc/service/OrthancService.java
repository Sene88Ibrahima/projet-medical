package com.example.demo.orthanc.service;

import com.example.demo.orthanc.cache.OrthancCache;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;
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
    private final OrthancCache orthancCache;

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
    
    /**
     * Récupère uniquement les IDs d'études depuis Orthanc
     * Cette méthode est optimisée pour éviter de récupérer les détails complets
     * @return Liste des IDs d'études
     */
    public List<String> getStudyIds() {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);
            String url = orthancProperties.getApi().getUrl() + "/studies";
            
            log.info("Récupération des IDs d'études depuis Orthanc: {}", url);
            System.out.println("URL Orthanc pour les IDs d'études: " + url);

            ResponseEntity<List<String>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<List<String>>() {}
            );
            
            List<String> studyIds = response.getBody();
            System.out.println("Réponse d'Orthanc - Status: " + response.getStatusCode());
            System.out.println("Réponse d'Orthanc - Ids d'études (brut): " + studyIds);
            
            // Valider les IDs reçus
            if (studyIds == null) {
                return new ArrayList<>();
            }
            
            // Filtrer les valeurs null ou vides
            List<String> validatedIds = studyIds.stream()
                .filter(id -> id != null && !id.isEmpty())
                .collect(Collectors.toList());
                
            System.out.println("IDs d'études validés: " + validatedIds);
            log.info("IDs d'études récupérés avec succès: {}", validatedIds.size());
            
            return validatedIds;
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des IDs d'études", e);
            System.err.println("Exception lors de la récupération des IDs d'études: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Échec de la récupération des IDs d'études", e);
        }
    }

    public DicomStudyDTO getStudy(String studyId) {
        try {
            log.info("Récupération des détails de l'étude {}", studyId);
            
            // Vérifier d'abord dans le cache
            DicomStudyDTO cachedStudy = orthancCache.getStudy(studyId);
            if (cachedStudy != null) {
                log.info("Étude {} récupérée depuis le cache", studyId);
                return cachedStudy;
            }
            
            // Si non trouvé dans le cache, interroger Orthanc
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            // 1. Récupérer d'abord les données de base de l'étude
            String studyUrl = orthancProperties.getApi().getUrl() + "/studies/" + studyId;
            log.info("URL de l'étude: {}", studyUrl);
            
            // Utiliser Map pour capturer toutes les propriétés
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                studyUrl,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> studyData = response.getBody();
            log.info("Données de l'étude reçues: {}", studyData);
            
            // 2. Construire l'objet DicomStudyDTO manuellement
            DicomStudyDTO studyDTO = new DicomStudyDTO();
            studyDTO.setId(studyId);
            
            // Extraire les données des MainDicomTags si disponibles
            if (studyData != null && studyData.containsKey("MainDicomTags")) {
                Map<String, Object> mainTags = (Map<String, Object>) studyData.get("MainDicomTags");
                
                studyDTO.setPatientName(getStringValue(mainTags, "PatientName"));
                studyDTO.setPatientId(getStringValue(mainTags, "PatientID"));
                studyDTO.setStudyDescription(getStringValue(mainTags, "StudyDescription"));
                
                // Convertir la date d'étude si présente
                String studyDateStr = getStringValue(mainTags, "StudyDate");
                if (studyDateStr != null && !studyDateStr.isEmpty()) {
                    try {
                        // Format DICOM: YYYYMMDD
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
                        LocalDate date = LocalDate.parse(studyDateStr, formatter);
                        studyDTO.setStudyDate(date.atStartOfDay());
                    } catch (Exception e) {
                        log.warn("Impossible de parser la date d'étude: {}", studyDateStr, e);
                    }
                }
            }
            
            // 3. Récupérer les séries associées à cette étude
            if (studyData != null && studyData.containsKey("Series")) {
                List<String> seriesIds = (List<String>) studyData.get("Series");
                List<DicomSeriesDTO> seriesList = new ArrayList<>();
                
                // Récupérer les détails de chaque série (limiter à 5 pour éviter les problèmes de performance)
                int maxSeries = Math.min(seriesIds.size(), 5);
                for (int i = 0; i < maxSeries; i++) {
                    String seriesId = seriesIds.get(i);
                    try {
                        DicomSeriesDTO series = getSeries(seriesId);
                        if (series != null) {
                            seriesList.add(series);
                        }
                    } catch (Exception e) {
                        log.error("Erreur lors de la récupération de la série {}: {}", seriesId, e.getMessage());
                    }
                }
                
                studyDTO.setSeries(seriesList);
            }
            
            log.info("DTO d'étude construit avec succès: {}", studyDTO);
            
            // Mettre en cache le résultat pour les prochaines requêtes
            orthancCache.putStudy(studyId, studyDTO);
            
            return studyDTO;
        } catch (Exception e) {
            log.error("Error getting study: {}", studyId, e);
            throw new RuntimeException("Failed to get study", e);
        }
    }
    
    /**
     * Extrait une valeur String d'une Map de façon sécurisée
     */
    private String getStringValue(Map<String, Object> map, String key) {
        if (map != null && map.containsKey(key)) {
            Object value = map.get(key);
            return value != null ? value.toString() : null;
        }
        return null;
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
            log.info("Récupération des détails de la série {}", seriesId);
            
            // Vérifier d'abord dans le cache
            DicomSeriesDTO cachedSeries = orthancCache.getSeries(seriesId);
            if (cachedSeries != null) {
                log.info("Série {} récupérée depuis le cache", seriesId);
                return cachedSeries;
            }
            
            // Si non trouvé dans le cache, interroger Orthanc
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            // 1. Récupérer d'abord les données de base de la série
            String seriesUrl = orthancProperties.getApi().getUrl() + "/series/" + seriesId;
            log.info("URL de la série: {}", seriesUrl);
            
            // Utiliser Map pour capturer toutes les propriétés
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                seriesUrl,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> seriesData = response.getBody();
            
            // 2. Construire l'objet DicomSeriesDTO manuellement
            DicomSeriesDTO seriesDTO = new DicomSeriesDTO();
            seriesDTO.setId(seriesId);
            
            // Extraire les données des MainDicomTags si disponibles
            if (seriesData != null && seriesData.containsKey("MainDicomTags")) {
                Map<String, Object> mainTags = (Map<String, Object>) seriesData.get("MainDicomTags");
                
                seriesDTO.setSeriesDescription(getStringValue(mainTags, "SeriesDescription"));
                seriesDTO.setModality(getStringValue(mainTags, "Modality"));
                
                // Convertir le nombre d'images si présent
                String imagesCountStr = getStringValue(mainTags, "ImagesInAcquisition");
                if (imagesCountStr != null && !imagesCountStr.isEmpty()) {
                    try {
                        seriesDTO.setImagesCount(Integer.parseInt(imagesCountStr));
                    } catch (NumberFormatException e) {
                        log.warn("Impossible de parser le nombre d'images: {}", imagesCountStr);
                    }
                }
            }
            
            // 3. Récupérer les instances associées à cette série
            if (seriesData != null && seriesData.containsKey("Instances")) {
                List<String> instanceIds = (List<String>) seriesData.get("Instances");
                List<DicomInstanceDTO> instancesList = new ArrayList<>();
                
                log.info("Récupération de {} instances pour la série {}", instanceIds.size(), seriesId);
                
                // Récupérer les détails de chaque instance (limiter à maximum 10 pour éviter les problèmes de performance)
                int maxInstances = Math.min(instanceIds.size(), 10);
                for (int i = 0; i < maxInstances; i++) {
                    String instanceId = instanceIds.get(i);
                    try {
                        DicomInstanceDTO instance = getInstance(instanceId);
                        if (instance != null) {
                            instancesList.add(instance);
                        }
                    } catch (Exception e) {
                        log.error("Erreur lors de la récupération de l'instance {}: {}", instanceId, e.getMessage());
                    }
                }
                
                seriesDTO.setInstances(instancesList);
            }
            
            log.info("DTO de série construit avec succès: {}", seriesDTO);
            
            // Mettre en cache le résultat pour les prochaines requêtes
            orthancCache.putSeries(seriesId, seriesDTO);
            
            return seriesDTO;
        } catch (Exception e) {
            log.error("Error getting series: {}", seriesId, e);
            throw new RuntimeException("Failed to get series", e);
        }
    }

    public DicomInstanceDTO getInstance(String instanceId) {
        try {
            log.info("Récupération des détails de l'instance {}", instanceId);
            
            // Vérifier d'abord dans le cache
            DicomInstanceDTO cachedInstance = orthancCache.getInstance(instanceId);
            if (cachedInstance != null) {
                log.info("Instance {} récupérée depuis le cache", instanceId);
                return cachedInstance;
            }
            
            // Si non trouvé dans le cache, interroger Orthanc
            HttpHeaders headers = createHeaders();
            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            // 1. Récupérer d'abord les données de base de l'instance
            String instanceUrl = orthancProperties.getApi().getUrl() + "/instances/" + instanceId;
            log.info("URL de l'instance: {}", instanceUrl);
            
            // Utiliser Map pour capturer toutes les propriétés
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                instanceUrl,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> instanceData = response.getBody();
            
            // 2. Construire l'objet DicomInstanceDTO manuellement
            DicomInstanceDTO instanceDTO = new DicomInstanceDTO();
            instanceDTO.setId(instanceId);
            
            // Extraire des informations de base
            if (instanceData != null) {
                // Extraire l'ID de fichier si disponible
                if (instanceData.containsKey("FileUuid")) {
                    instanceDTO.setFileUuid(getStringValue(instanceData, "FileUuid"));
                }
                
                // Extraire les informations des MainDicomTags
                if (instanceData.containsKey("MainDicomTags")) {
                    Map<String, Object> mainTags = (Map<String, Object>) instanceData.get("MainDicomTags");
                    
                    // Récupérer les informations spécifiques à l'instance
                    instanceDTO.setSOPInstanceUID(getStringValue(mainTags, "SOPInstanceUID"));
                    instanceDTO.setImageType(getStringValue(mainTags, "ImageType"));
                    
                    // Extraire les dimensions de l'image si disponibles
                    String rows = getStringValue(mainTags, "Rows");
                    String columns = getStringValue(mainTags, "Columns");
                    if (rows != null && columns != null) {
                        try {
                            instanceDTO.setWidth(Integer.parseInt(columns));
                            instanceDTO.setHeight(Integer.parseInt(rows));
                        } catch (NumberFormatException e) {
                            log.warn("Impossible de parser les dimensions de l'image: {} x {}", rows, columns);
                        }
                    }
                }
                
                // Ajouter les URLs pour récupérer l'image et le fichier DICOM directement
                instanceDTO.setImageUrl(orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/rendered");
                instanceDTO.setFileUrl(orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/file");
                instanceDTO.setPreviewUrl(orthancProperties.getApi().getUrl() + "/instances/" + instanceId + "/preview");
            }
            
            log.info("DTO d'instance construit avec succès pour l'ID: {}", instanceId);
            
            // Mettre en cache le résultat pour les prochaines requêtes
            orthancCache.putInstance(instanceId, instanceDTO);
            
            return instanceDTO;
        } catch (Exception e) {
            log.error("Error getting instance: {}", instanceId, e);
            throw new RuntimeException("Failed to get instance", e);
        }
    }

    public byte[] getInstancePreview(String instanceId) {
        try {
            // Vérifier d'abord dans le cache
            byte[] cachedImage = orthancCache.getImage("preview_" + instanceId);
            if (cachedImage != null) {
                log.info("Aperçu de l'instance {} récupéré depuis le cache", instanceId);
                
                // Audit de l'accès (depuis le cache)
                auditService.logAccess(
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    instanceId,
                    "VIEW_PREVIEW_CACHED",
                    "SUCCESS"
                );
                
                return cachedImage;
            }
            
            // Si non trouvé dans le cache, interroger Orthanc
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
            
            // Mettre en cache le résultat pour les prochaines requêtes
            byte[] imageData = response.getBody();
            if (imageData != null && imageData.length > 0) {
                orthancCache.putImage("preview_" + instanceId, imageData);
                log.info("Aperçu de l'instance {} mis en cache ({} octets)", instanceId, imageData.length);
            }

            return imageData;
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
            // Vérifier d'abord dans le cache
            byte[] cachedImage = orthancCache.getImage("image_" + instanceId);
            if (cachedImage != null) {
                log.info("Image de l'instance {} récupérée depuis le cache", instanceId);
                
                // Audit de l'accès (depuis le cache)
                auditService.logAccess(
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    instanceId,
                    "VIEW_IMAGE_CACHED",
                    "SUCCESS"
                );
                
                return cachedImage;
            }
            
            // Si non trouvé dans le cache, interroger Orthanc
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
            
            // Mettre en cache le résultat pour les prochaines requêtes
            byte[] imageData = response.getBody();
            if (imageData != null && imageData.length > 0) {
                orthancCache.putImage("image_" + instanceId, imageData);
                log.info("Image de l'instance {} mise en cache ({} octets)", instanceId, imageData.length);
            }

            return imageData;
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