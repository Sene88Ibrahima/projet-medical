package com.example.demo.controller;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.AppointmentStatus;
import com.example.demo.orthanc.dto.DicomStudyDTO;
import com.example.demo.orthanc.dto.DicomSeriesDTO;
import com.example.demo.orthanc.dto.DicomInstanceDTO;
import com.example.demo.orthanc.dto.OrthancResponse;
import com.example.demo.orthanc.dto.ModifyInstanceRequest;
import com.example.demo.orthanc.service.OrthancService;
import com.example.demo.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;
    private final OrthancService orthancService;

    /**
     * Récupérer tous les patients
     */
    @GetMapping("/patients")
    public ResponseEntity<List<UserDTO>> getAllPatients() {
        return ResponseEntity.ok(doctorService.getAllPatients());
    }

    /**
     * Récupérer tous les rendez-vous du médecin connecté
     */
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getDoctorAppointments() {
        return ResponseEntity.ok(doctorService.getDoctorAppointments());
    }

    /**
     * Récupérer les rendez-vous du médecin par statut
     */
    @GetMapping("/appointments/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getDoctorAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(doctorService.getDoctorAppointmentsByStatus(status));
    }

    /**
     * Mettre à jour un rendez-vous
     */
    @PutMapping("/appointments/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id, @RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(doctorService.updateAppointment(id, appointmentDTO));
    }

    /**
     * Envoyer un message
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(doctorService.sendMessage(messageDTO));
    }

    /**
     * Récupérer la conversation avec un utilisateur
     */
    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorService.getConversation(userId));
    }

    /**
     * Marquer les messages comme lus
     */
    @PostMapping("/messages/{userId}/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long userId) {
        doctorService.markMessagesAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Récupérer les dossiers médicaux créés par le médecin
     */
    @GetMapping("/medical-records")
    public ResponseEntity<List<MedicalRecordDTO>> getDoctorMedicalRecords() {
        return ResponseEntity.ok(doctorService.getDoctorMedicalRecords());
    }

    /**
     * Créer un nouveau dossier médical
     */
    @PostMapping("/medical-records")
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@RequestBody MedicalRecordDTO medicalRecordDTO) {
        return ResponseEntity.ok(doctorService.createMedicalRecord(medicalRecordDTO));
    }
    
    /**
     * Téléverser un fichier DICOM pour un patient
     */
    @PostMapping("/dicom/upload")
    public ResponseEntity<OrthancResponse> uploadDicomFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String patientId) {
        return ResponseEntity.ok(orthancService.uploadDicomFile(file));
    }

    /**
     * Récupérer toutes les études DICOM
     */
    @GetMapping("/dicom/studies")
    public ResponseEntity<List<DicomStudyDTO>> getAllStudies(
            @RequestParam(required = false) String patientId) {
        return ResponseEntity.ok(orthancService.getAllStudies(patientId));
    }

    /**
     * Récupérer une étude DICOM spécifique
     */
    @GetMapping("/dicom/studies/{studyId}")
    public ResponseEntity<DicomStudyDTO> getStudy(@PathVariable String studyId) {
        return ResponseEntity.ok(orthancService.getStudy(studyId));
    }

    /**
     * Récupérer une série DICOM spécifique
     */
    @GetMapping("/dicom/series/{seriesId}")
    public ResponseEntity<DicomSeriesDTO> getSeries(@PathVariable String seriesId) {
        return ResponseEntity.ok(orthancService.getSeries(seriesId));
    }

    /**
     * Récupérer une instance DICOM spécifique
     */
    @GetMapping("/dicom/instances/{instanceId}")
    public ResponseEntity<DicomInstanceDTO> getInstance(@PathVariable String instanceId) {
        return ResponseEntity.ok(orthancService.getInstance(instanceId));
    }

    /**
     * Modifier une instance DICOM
     */
    @PostMapping("/dicom/instances/{instanceId}/modify")
    public ResponseEntity<OrthancResponse> modifyInstance(
            @PathVariable String instanceId,
            @RequestBody ModifyInstanceRequest request) {
        return ResponseEntity.ok(orthancService.modifyInstance(instanceId, request));
    }

    /**
     * Anonymiser une étude DICOM
     */
    @PostMapping("/dicom/studies/{studyId}/anonymize")
    public ResponseEntity<OrthancResponse> anonymizeStudy(
            @PathVariable String studyId,
            @RequestParam(required = false) List<String> keepTags) {
        return ResponseEntity.ok(orthancService.anonymizeStudy(studyId, keepTags));
    }
} 