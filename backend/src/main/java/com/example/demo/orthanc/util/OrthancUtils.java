package com.example.demo.orthanc.util;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class OrthancUtils {
    
    public String buildOrthancUrl(String baseUrl, String... pathSegments) {
        StringBuilder url = new StringBuilder(baseUrl);
        for (String segment : pathSegments) {
            if (!url.toString().endsWith("/")) {
                url.append("/");
            }
            url.append(segment);
        }
        return url.toString();
    }
    
    public boolean isValidDicomTag(String tag) {
        return tag != null && tag.matches("^[0-9A-Fa-f]{8}$");
    }
    
    public boolean isValidOrthancId(String id) {
        return id != null && id.matches("^[0-9a-f-]{36}$");
    }
}