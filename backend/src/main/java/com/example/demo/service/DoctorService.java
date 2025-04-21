package com.example.demo.service;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.*;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageRepository messageRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    /**
     * Récupère tous les patients du système
     */
    public List<UserDTO> getAllPatients() {
        return userRepository.findByRole(Role.PATIENT).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les rendez-vous d'un médecin
     */
    public List<AppointmentDTO> getDoctorAppointments() {
        User currentDoctor = getCurrentUser();
        return appointmentRepository.findByDoctor(currentDoctor).stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les rendez-vous d'un médecin selon un statut
     */
    public List<AppointmentDTO> getDoctorAppointmentsByStatus(AppointmentStatus status) {
        User currentDoctor = getCurrentUser();
        return appointmentRepository.findByDoctorAndStatus(currentDoctor, status).stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour un rendez-vous
     */
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        User currentDoctor = getCurrentUser();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        // Vérifier si le médecin est bien celui assigné au rendez-vous
        if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce rendez-vous");
        }
        
        appointment.setStatus(appointmentDTO.getStatus());
        appointment.setNotes(appointmentDTO.getNotes());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(updatedAppointment);
    }

    /**
     * Envoie un message à un patient ou à un autre utilisateur
     */
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User currentDoctor = getCurrentUser();

        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        Message message = Message.builder()
                .sender(currentDoctor)
                .receiver(receiver)
                .content(messageDTO.getContent())
                .sentAt(LocalDateTime.now())
                .read(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        return mapToMessageDTO(savedMessage);
    }

    /**
     * Récupère la conversation avec un utilisateur spécifique
     */
    public List<MessageDTO> getConversation(Long userId) {
        User currentDoctor = getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return messageRepository.findConversation(currentDoctor, otherUser).stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marque comme lus tous les messages d'une conversation
     */
    public void markMessagesAsRead(Long userId) {
        User currentDoctor = getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> unreadMessages = messageRepository.findUnreadMessages(otherUser, currentDoctor);
        
        unreadMessages.forEach(message -> {
            message.setRead(true);
            messageRepository.save(message);
        });
    }

    /**
     * Récupère les dossiers médicaux créés par le médecin
     */
    public List<MedicalRecordDTO> getDoctorMedicalRecords() {
        User currentDoctor = getCurrentUser();
        
        return medicalRecordRepository.findByDoctor(currentDoctor).stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crée un nouveau dossier médical pour un patient
     */
    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO medicalRecordDTO) {
        User currentDoctor = getCurrentUser();
        
        User patient = userRepository.findById(medicalRecordDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(currentDoctor)
                .diagnosis(medicalRecordDTO.getDiagnosis())
                .treatment(medicalRecordDTO.getTreatment())
                .createdAt(LocalDateTime.now())
                .notes(medicalRecordDTO.getNotes())
                .build();
        
        MedicalRecord savedMedicalRecord = medicalRecordRepository.save(medicalRecord);
        return mapToMedicalRecordDTO(savedMedicalRecord);
    }

    // Utilitaires
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non connecté"));
                
        // Vérifier que l'utilisateur est bien un médecin
        if (user.getRole() != Role.DOCTOR) {
            throw new RuntimeException("L'utilisateur n'est pas un médecin");
        }
        
        return user;
    }
    
    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
    
    private AppointmentDTO mapToAppointmentDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName())
                .dateTime(appointment.getDateTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .build();
    }
    
    private MessageDTO mapToMessageDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .read(message.isRead())
                .build();
    }
    
    private MedicalRecordDTO mapToMedicalRecordDTO(MedicalRecord medicalRecord) {
        return MedicalRecordDTO.builder()
                .id(medicalRecord.getId())
                .patientId(medicalRecord.getPatient().getId())
                .patientName(medicalRecord.getPatient().getFirstName() + " " + medicalRecord.getPatient().getLastName())
                .doctorId(medicalRecord.getDoctor().getId())
                .doctorName(medicalRecord.getDoctor().getFirstName() + " " + medicalRecord.getDoctor().getLastName())
                .diagnosis(medicalRecord.getDiagnosis())
                .treatment(medicalRecord.getTreatment())
                .createdAt(medicalRecord.getCreatedAt())
                .notes(medicalRecord.getNotes())
                .build();
    }
} 