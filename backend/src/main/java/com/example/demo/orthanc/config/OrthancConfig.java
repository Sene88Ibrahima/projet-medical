package com.example.demo.orthanc.config;

import org.apache.http.auth.UsernamePasswordCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Configuration
public class OrthancConfig {

    @Value("${orthanc.api.url}")
    private String orthancApiUrl;

    @Value("${orthanc.api.username}")
    private String orthancUsername;

    @Value("${orthanc.api.password}")
    private String orthancPassword;

    @Bean
    public UsernamePasswordCredentials orthancCredentials() {
        return new UsernamePasswordCredentials(orthancUsername, orthancPassword);
    }

    public String getOrthancApiUrl() {
        return orthancApiUrl;
    }
    
    @Bean
    public RestTemplate orthancRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(30000);
        
        RestTemplate restTemplate = new RestTemplate(requestFactory);
        
        // Ajouter des logs pour le débogage
        System.out.println("Orthanc RestTemplate configuré avec URL: " + orthancApiUrl);
        System.out.println("Authentification: " + orthancUsername + ":*****");
        
        return restTemplate;
    }
    
    public HttpHeaders createBasicAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = orthancUsername + ":" + orthancPassword;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
        String authHeader = "Basic " + new String(encodedAuth);
        headers.set("Authorization", authHeader);
        return headers;
    }
}