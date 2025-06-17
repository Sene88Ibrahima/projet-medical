package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medical_reports")
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Orthanc instance ID to which this report is attached. Can be null for imported reports not linked
     * to a specific study/instance.
     */
    private String instanceId;

    private String title;

    /** created | imported */
    private String type;

    /** Date string provided by frontend (locale-formatted). */
    private String reportDate;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;
}
