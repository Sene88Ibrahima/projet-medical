package com.example.demo.orthanc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "dicom_audit_logs")
public class DicomAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String dicomId;
    private String action;
    private String result;
    private LocalDateTime timestamp;
    private String ipAddress;
    private String userAgent;
}