package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStats {
    private long totalPatients;
    private long totalDoctors;
    private long totalNurses;
    private long pendingAppointments;
    private long completedAppointments;
    private long totalMedicalRecords;
    private long totalMedicalImages;
}