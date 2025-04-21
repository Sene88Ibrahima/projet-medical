package com.example.demo.orthanc.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class DicomEncryptionService {
    
    @Value("${orthanc.security.encryption-key}")
    private String encryptionKeyString;
    
    @Value("${orthanc.security.encryption-algorithm}")
    private String algorithm;
    
    private SecretKey getSecretKey() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(encryptionKeyString.getBytes());
        return new SecretKeySpec(hash, algorithm);
    }

    public byte[] encryptDicomFile(byte[] content) {
        try {
            SecretKey key = getSecretKey();
            Cipher cipher = Cipher.getInstance(algorithm);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return cipher.doFinal(content);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting DICOM file", e);
        }
    }

    public byte[] decryptDicomFile(byte[] encryptedContent) {
        try {
            SecretKey key = getSecretKey();
            Cipher cipher = Cipher.getInstance(algorithm);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return cipher.doFinal(encryptedContent);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting DICOM file", e);
        }
    }

    public String encryptMetadata(String metadata) {
        try {
            return Base64.getEncoder().encodeToString(
                encryptDicomFile(metadata.getBytes())
            );
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting metadata", e);
        }
    }

    public String decryptMetadata(String encryptedMetadata) {
        try {
            return new String(
                decryptDicomFile(Base64.getDecoder().decode(encryptedMetadata))
            );
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting metadata", e);
        }
    }
}