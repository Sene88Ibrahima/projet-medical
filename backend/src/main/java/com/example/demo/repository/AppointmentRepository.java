package com.example.demo.repository;

import com.example.demo.model.Appointment;
import com.example.demo.model.AppointmentStatus;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(User doctor);
    List<Appointment> findByPatientAndStatus(User patient, AppointmentStatus status);
    List<Appointment> findByDoctorAndStatus(User doctor, AppointmentStatus status);
    List<Appointment> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(AppointmentStatus status);  // Ajout de la méthode de comptage
}