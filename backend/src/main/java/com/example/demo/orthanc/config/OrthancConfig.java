package com.example.demo.orthanc.config;

import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OrthancConfig {

    @Value("${orthanc.api.url}")
    private String orthancApiUrl;

    @Value("${orthanc.api.username}")
    private String orthancUsername;

    @Value("${orthanc.api.password}")
    private String orthancPassword;

    @Bean
    public CloseableHttpClient orthancHttpClient() {
        return HttpClients.createDefault();
    }

    @Bean
    public UsernamePasswordCredentials orthancCredentials() {
        return new UsernamePasswordCredentials(orthancUsername, orthancPassword);
    }

    public String getOrthancApiUrl() {
        return orthancApiUrl;
    }
    @Bean
    public RestTemplate orthancRestTemplate() {
        return new RestTemplate();
    }
}