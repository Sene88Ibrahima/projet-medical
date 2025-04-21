package com.example.demo.orthanc.service;

import com.example.demo.orthanc.config.OrthancProperties;
import com.example.demo.orthanc.dto.OrthancResponse;
import com.example.demo.orthanc.security.DicomAuditService;
import com.example.demo.orthanc.security.DicomEncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrthancServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private DicomEncryptionService encryptionService;

    @Mock
    private DicomAuditService auditService;

    @Mock
    private OrthancProperties orthancProperties;
    
    @Mock
    private OrthancProperties.Api orthancApi;

    @InjectMocks
    private OrthancService orthancService;

    @BeforeEach
    void setUp() {
        // Mock SecurityContextHolder pour éviter NullPointerException
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testUser");
        SecurityContextHolder.setContext(securityContext);
        
        // Configure OrthancProperties
        when(orthancProperties.getApi()).thenReturn(orthancApi);
        when(orthancApi.getUrl()).thenReturn("http://localhost:8042");
        when(orthancApi.getUsername()).thenReturn("orthanc");
        when(orthancApi.getPassword()).thenReturn("orthanc");

        // Mock encryption service
        when(encryptionService.encryptDicomFile(any())).thenReturn("encrypted data".getBytes());
        
        // Mock RestTemplate response
        OrthancResponse mockResponse = new OrthancResponse();
        mockResponse.setId("test-id");
        mockResponse.setStatus("success");
        
        ResponseEntity<OrthancResponse> responseEntity = ResponseEntity.ok(mockResponse);
        when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(OrthancResponse.class)
        )).thenReturn(responseEntity);
    }

    @Test
    void uploadDicomFile_Success() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.dcm", "application/dicom", "test data".getBytes()
        );

        // Act
        OrthancResponse response = orthancService.uploadDicomFile(file);

        // Assert
        assertNotNull(response);
        assertEquals("test-id", response.getId());
        assertEquals("success", response.getStatus());
    }
}