package com.example.demo.orthanc.security;

import com.example.demo.orthanc.model.DicomAuditLog;
import com.example.demo.orthanc.repository.DicomAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DicomAuditService {
    
    private final DicomAuditLogRepository auditLogRepository;

    public void logAccess(String userId, String dicomId, String action, String result) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();

        DicomAuditLog auditLog = DicomAuditLog.builder()
                .userId(userId)
                .dicomId(dicomId)
                .action(action)
                .result(result)
                .timestamp(LocalDateTime.now())
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .build();

        auditLogRepository.save(auditLog);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
}