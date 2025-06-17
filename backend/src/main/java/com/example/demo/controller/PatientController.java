package com.example.demo.controller;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/doctors")
    public ResponseEntity<List<UserDTO>> getAllDoctors() {
        log.info("Récupération de la liste des médecins");
        return ResponseEntity.ok(patientService.getAllDoctors());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getPatientAppointments(Authentication authentication) {
        log.info("Récupération des rendez-vous pour le patient: {}", authentication.getName());
        try {
            List<AppointmentDTO> appointments = patientService.getPatientAppointments();
            log.info("Nombre de rendez-vous trouvés: {}", appointments.size());
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des rendez-vous: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO, Authentication authentication) {
        log.info("Création d'un rendez-vous pour le patient: {}", authentication.getName());
        log.info("Données du rendez-vous: {}", appointmentDTO);
        try {
            AppointmentDTO createdAppointment = patientService.createAppointment(appointmentDTO);
            log.info("Rendez-vous créé avec succès, ID: {}", createdAppointment.getId());
            return ResponseEntity.ok(createdAppointment);
        } catch (Exception e) {
            log.error("Erreur lors de la création du rendez-vous: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO appointmentDTO) {
        log.info("Mise à jour du rendez-vous ID: {}", id);
        return ResponseEntity.ok(patientService.updateAppointment(id, appointmentDTO));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDTO> deleteAppointment(@PathVariable Long id) {
        log.info("Annulation du rendez-vous ID: {}", id);
        return ResponseEntity.ok(patientService.cancelAppointment(id));
    }

    @PostMapping("/medical-info")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> saveMedicalInfo(@RequestBody Map<String, Object> medicalInfo,
                                                Authentication authentication) {
        log.info("Sauvegarde des informations médicales pour le patient: {}", authentication.getName());
        patientService.saveMedicalInfo(authentication.getName(), medicalInfo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/medical-records")
    public ResponseEntity<List<MedicalRecordDTO>> getPatientMedicalRecords() {
        return ResponseEntity.ok(patientService.getPatientMedicalRecords());
    }
    
    /**
     * Envoyer un message
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestParam("content") String content,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        log.info("Envoi d'un message au destinataire ID: {}", receiverId);
        
        MessageDTO messageDTO = MessageDTO.builder()
                .content(content)
                .receiverId(receiverId)
                .build();
        
        return ResponseEntity.ok(patientService.sendMessage(messageDTO));
    }

    /**
     * Récupérer la conversation avec un utilisateur
     */
    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Long userId) {
        log.info("Récupération de la conversation avec l'utilisateur ID: {}", userId);
        return ResponseEntity.ok(patientService.getConversation(userId));
    }

    /**
     * Marquer les messages comme lus
     */
    @PostMapping("/messages/{userId}/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long userId) {
        log.info("Marquage des messages comme lus pour l'utilisateur ID: {}", userId);
        patientService.markMessagesAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Annuler un rendez-vous
     */
    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        log.info("Annulation du rendez-vous ID: {}", id);
        return ResponseEntity.ok(patientService.cancelAppointment(id));
    }
} 