package com.example.demo.orthanc.security;

import com.example.demo.config.TestConfig;
import com.example.demo.orthanc.model.DicomAuditLog;
import com.example.demo.orthanc.repository.DicomAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Import(TestConfig.class)
@ActiveProfiles("test")
class DicomAuditServiceTest {

    @Autowired
    private DicomAuditService auditService;

    private final DicomAuditLogRepository repository = mock(DicomAuditLogRepository.class);

    @Test
    void logAccess_Success() {
        // Arrange
        String userId = "testUser";
        String dicomId = "testDicom";
        String action = "UPLOAD";
        String result = "SUCCESS";

        // Act
        assertDoesNotThrow(() -> 
            auditService.logAccess(userId, dicomId, action, result)
        );
    }
}