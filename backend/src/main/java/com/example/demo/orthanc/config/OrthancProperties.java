package com.example.demo.orthanc.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "orthanc")
public class OrthancProperties {
    private Api api = new Api();
    private Dicom dicom = new Dicom();
    private Security security = new Security();

    @Data
    public static class Api {
        private String url;
        private String username;
        private String password;
        private int maxConnections = 20;
        private int timeout = 30000;
    }

    @Data
    public static class Dicom {
        private String aet = "ORTHANC";
        private int port = 4242;
        private boolean transcoding = true;
    }

    @Data
    public static class Security {
        private boolean enableEncryption = true;
        private String encryptionKey;
        private boolean anonymizeHeaders = true;
    }
}