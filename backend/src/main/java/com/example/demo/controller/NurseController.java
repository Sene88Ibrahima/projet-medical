package com.example.demo.controller;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.example.demo.dto.UserDTO;
import com.example.demo.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nurse")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NURSE')")
public class NurseController {

    private final NurseService nurseService;

    @GetMapping("/doctors")
    public ResponseEntity<List<UserDTO>> getAllDoctors() {
        return ResponseEntity.ok(nurseService.getAllDoctors());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        return ResponseEntity.ok(nurseService.getAllAppointments());
    }

    @GetMapping("/appointments/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentDTO>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(nurseService.getDoctorAppointments(doctorId));
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(nurseService.createAppointment(appointmentDTO));
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(nurseService.updateAppointment(id, appointmentDTO));
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        nurseService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestParam("content") String content,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        MessageDTO messageDTO = MessageDTO.builder()
                .content(content)
                .receiverId(receiverId)
                .build();
        
        return ResponseEntity.ok(nurseService.sendMessage(messageDTO));
    }

    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(nurseService.getConversation(userId));
    }

    /* ====== Medical Records endpoints ====== */

    @GetMapping("/medical-records")
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecords() {
        return ResponseEntity.ok(nurseService.getAllMedicalRecords());
    }

    @GetMapping("/medical-records/{id}")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordDetails(@PathVariable Long id) {
        return ResponseEntity.ok(nurseService.getMedicalRecordDetails(id));
    }

    @PostMapping("/medical-records")
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(nurseService.createMedicalRecord(dto));
    }

    @DeleteMapping("/medical-records/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        nurseService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
}