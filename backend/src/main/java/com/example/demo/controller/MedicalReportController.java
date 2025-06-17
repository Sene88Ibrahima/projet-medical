package com.example.demo.controller;

import com.example.demo.dto.MedicalReportDTO;
import com.example.demo.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dicom/reports")
@RequiredArgsConstructor
public class MedicalReportController {

    private final MedicalReportService medicalReportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<MedicalReportDTO> createReport(@RequestBody MedicalReportDTO dto) {
        return ResponseEntity.ok(medicalReportService.createReport(dto));
    }

    @GetMapping("/instance/{instanceId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT', 'NURSE')")
    public ResponseEntity<List<MedicalReportDTO>> getReportsByInstance(@PathVariable String instanceId) {
        return ResponseEntity.ok(medicalReportService.getReportsByInstance(instanceId));
    }
}
