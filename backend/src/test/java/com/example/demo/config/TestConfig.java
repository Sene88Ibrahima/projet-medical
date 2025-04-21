package com.example.demo.config;

import com.example.demo.orthanc.config.OrthancProperties;
import com.example.demo.orthanc.repository.DicomAuditLogRepository;
import com.example.demo.orthanc.security.DicomAuditService;
import com.example.demo.orthanc.security.DicomEncryptionService;
import com.example.demo.orthanc.service.OrthancService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;

@TestConfiguration
public class TestConfig {
    
    @MockBean
    private DicomAuditLogRepository auditLogRepository;

    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    public RestTemplate restTemplate() {
        return Mockito.mock(RestTemplate.class);
    }

    @Bean
    public OrthancProperties orthancProperties() {
        OrthancProperties properties = new OrthancProperties();
        properties.getApi().setUrl("http://localhost:8042");
        properties.getApi().setUsername("orthanc");
        properties.getApi().setPassword("orthanc");
        return properties;
    }

    @Bean
    public DicomEncryptionService dicomEncryptionService() {
        return new DicomEncryptionService();
    }

    @Bean
    public DicomAuditService dicomAuditService() {
        return new DicomAuditService(auditLogRepository);
    }

    @Bean
    public OrthancService orthancService(
            OrthancProperties orthancProperties,
            RestTemplate restTemplate,
            DicomEncryptionService encryptionService,
            DicomAuditService auditService) {
        return new OrthancService(orthancProperties, restTemplate, encryptionService, auditService);
    }
}