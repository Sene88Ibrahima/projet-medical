package com.example.demo.orthanc.security;

import com.example.demo.config.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Import(TestConfig.class)
@ActiveProfiles("test")
public class DicomEncryptionServiceTest {

    @Autowired
    private DicomEncryptionService encryptionService;

    @Test
    void encryptAndDecrypt_Success() {
        // Arrange
        String originalData = "Test DICOM data";
        byte[] content = originalData.getBytes();

        // Act
        byte[] encrypted = encryptionService.encryptDicomFile(content);
        byte[] decrypted = encryptionService.decryptDicomFile(encrypted);

        // Assert
        assertNotEquals(new String(encrypted), originalData);
        assertEquals(new String(decrypted), originalData);
    }
}