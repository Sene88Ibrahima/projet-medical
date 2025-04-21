package com.example.demo.orthanc.controller;

import com.example.demo.orthanc.model.DicomAuditLog;
import com.example.demo.orthanc.repository.DicomAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/dicom/audit")
@RequiredArgsConstructor
public class DicomAuditController {

    private final DicomAuditLogRepository auditLogRepository;

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DicomAuditLog>> searchAuditLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String dicomId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String result,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        
        return ResponseEntity.ok(auditLogRepository.searchAuditLogs(
            userId, dicomId, action, result, startDate, endDate, pageable
        ));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Page<DicomAuditLog>> getUserAuditLogs(
            @PathVariable String userId,
            Pageable pageable) {
        return ResponseEntity.ok(auditLogRepository.findByUserId(userId, pageable));
    }

    @GetMapping("/dicom/{dicomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Page<DicomAuditLog>> getDicomAuditLogs(
            @PathVariable String dicomId,
            Pageable pageable) {
        return ResponseEntity.ok(auditLogRepository.findByDicomId(dicomId, pageable));
    }
}