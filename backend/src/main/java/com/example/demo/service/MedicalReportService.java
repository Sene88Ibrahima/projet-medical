package com.example.demo.service;

import com.example.demo.dto.MedicalReportDTO;
import com.example.demo.model.MedicalReport;
import com.example.demo.model.User;
import com.example.demo.repository.MedicalReportRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final UserRepository userRepository;

    @Transactional
    public MedicalReportDTO createReport(MedicalReportDTO dto) {
        User currentDoctor = getCurrentUser();

        MedicalReport report = MedicalReport.builder()
                .instanceId(dto.getInstanceId())
                .title(dto.getTitle())
                .type(dto.getType())
                .reportDate(dto.getReportDate())
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .doctor(currentDoctor)
                .build();

        MedicalReport saved = medicalReportRepository.save(report);
        return mapToDTO(saved);
    }

    public List<MedicalReportDTO> getReportsByInstance(String instanceId) {
        return medicalReportRepository.findByInstanceId(instanceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MedicalReportDTO mapToDTO(MedicalReport report) {
        return MedicalReportDTO.builder()
                .id(report.getId())
                .instanceId(report.getInstanceId())
                .title(report.getTitle())
                .type(report.getType())
                .reportDate(report.getReportDate())
                .content(report.getContent())
                .createdAt(report.getCreatedAt())
                .doctorId(report.getDoctor() != null ? report.getDoctor().getId() : null)
                .doctorName(report.getDoctor() != null ? report.getDoctor().getFirstName() + " " + report.getDoctor().getLastName() : null)
                .build();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
