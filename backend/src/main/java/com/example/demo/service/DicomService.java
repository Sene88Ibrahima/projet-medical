package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

/**
 * Service pour interagir avec le serveur Orthanc DICOM selon la nouvelle logique d'implémentation.
 */
@Service
public class DicomService {

    @Value("${orthanc.api.url:http://localhost:8042}")
    private String orthancApiUrl;

    @Value("${orthanc.username:orthanc}")
    private String orthancUsername;

    @Value("${orthanc.password:orthanc}")
    private String orthancPassword;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Télécharge un fichier DICOM vers Orthanc.
     *
     * @param file Fichier DICOM à télécharger
     * @return ID de l'instance créée dans Orthanc
     * @throws IOException Si une erreur se produit lors de la lecture du fichier
     */
    public String uploadDicomFile(MultipartFile file) throws IOException {
        // Préparer les en-têtes avec authentification
        HttpHeaders headers = createAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        // Créer l'entité de requête
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        // Envoyer la requête
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                orthancApiUrl + "/instances",
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        Map<String, Object> responseBody = response.getBody();

        // Extraire l'ID de l'instance
        if (responseBody != null && responseBody.containsKey("ID")) {
            return (String) responseBody.get("ID");
        } else {
            throw new RuntimeException("Impossible de récupérer l'ID de l'instance après téléchargement");
        }
    }

    /**
     * Récupère les détails d'une instance DICOM.
     *
     * @param instanceId ID de l'instance
     * @return Détails de l'instance
     */
    public Map<String, Object> getInstance(String instanceId) {
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                orthancApiUrl + "/instances/" + instanceId,
                HttpMethod.GET,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        Map<String, Object> result = response.getBody();

        return result;
    }

    /**
     * Récupère l'ID de la série pour une instance donnée.
     *
     * @param instanceId ID de l'instance
     * @return ID de la série
     */
    public String getSeriesIdForInstance(String instanceId) {
        Map<String, Object> instanceDetails = getInstance(instanceId);
        if (instanceDetails != null && instanceDetails.containsKey("ParentSeries")) {
            return (String) instanceDetails.get("ParentSeries");
        } else {
            return null;
        }
    }

    /**
     * Récupère l'ID de l'étude pour une instance donnée.
     *
     * @param instanceId ID de l'instance
     * @return ID de l'étude
     */
    public String getStudyIdForInstance(String instanceId) {
        Map<String, Object> instanceDetails = getInstance(instanceId);
        if (instanceDetails != null && instanceDetails.containsKey("ParentStudy")) {
            return (String) instanceDetails.get("ParentStudy");
        } else {
            return null;
        }
    }

    /**
     * Supprime une instance de Orthanc.
     *
     * @param instanceId ID de l'instance à supprimer
     */
    public void deleteInstance(String instanceId) {
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        restTemplate.exchange(
                orthancApiUrl + "/instances/" + instanceId,
                HttpMethod.DELETE,
                requestEntity,
                Void.class
        );
    }

    /**
     * Crée les en-têtes HTTP avec authentification Basic.
     *
     * @return En-têtes HTTP avec authentification
     */
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = orthancUsername + ":" + orthancPassword;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        String authHeader = "Basic " + new String(encodedAuth);
        headers.set("Authorization", authHeader);
        return headers;
    }
}
