package com.example.demo.orthanc.repository;

import com.example.demo.orthanc.model.DicomAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DicomAuditLogRepository extends JpaRepository<DicomAuditLog, Long> {
    
    Page<DicomAuditLog> findByDicomId(String dicomId, Pageable pageable);
    
    Page<DicomAuditLog> findByUserId(String userId, Pageable pageable);
    
    Page<DicomAuditLog> findByTimestampBetween(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );
    
    @Query("SELECT d FROM DicomAuditLog d WHERE " +
           "(:userId IS NULL OR d.userId = :userId) AND " +
           "(:dicomId IS NULL OR d.dicomId = :dicomId) AND " +
           "(:action IS NULL OR d.action = :action) AND " +
           "(:result IS NULL OR d.result LIKE %:result%) AND " +
           "d.timestamp BETWEEN :startDate AND :endDate")
    Page<DicomAuditLog> searchAuditLogs(
        @Param("userId") String userId,
        @Param("dicomId") String dicomId,
        @Param("action") String action,
        @Param("result") String result,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}