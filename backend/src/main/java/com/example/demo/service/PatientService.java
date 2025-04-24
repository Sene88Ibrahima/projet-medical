package com.example.demo.service;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.model.*;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MessageRepository messageRepository;

    public List<UserDTO> getAllDoctors() {
        return userRepository.findByRole(Role.DOCTOR).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getPatientAppointments() {
        User currentPatient = getCurrentUser();
        return appointmentRepository.findByPatient(currentPatient).stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        User currentPatient = getCurrentUser();
        User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        Appointment appointment = Appointment.builder()
                .patient(currentPatient)
                .doctor(doctor)
                .dateTime(appointmentDTO.getDateTime())
                .reason(appointmentDTO.getReason())
                .status(AppointmentStatus.SCHEDULED)
                .notes(appointmentDTO.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(savedAppointment);
    }

    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        User currentPatient = getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

        // Vérifier si le patient est bien celui qui a créé le rendez-vous
        if (!appointment.getPatient().getId().equals(currentPatient.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce rendez-vous");
        }

        if (appointmentDTO.getDoctorId() != null) {
            User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));
            appointment.setDoctor(doctor);
        }

        appointment.setDateTime(appointmentDTO.getDateTime());
        appointment.setReason(appointmentDTO.getReason());
        appointment.setStatus(appointmentDTO.getStatus());
        appointment.setNotes(appointmentDTO.getNotes());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(updatedAppointment);
    }

    public AppointmentDTO cancelAppointment(Long id) {
        User currentPatient = getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

        // Vérifier si le patient est bien celui qui a créé le rendez-vous
        if (!appointment.getPatient().getId().equals(currentPatient.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler ce rendez-vous");
        }
        
        // Vérifier que le rendez-vous est bien à l'état SCHEDULED
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new RuntimeException("Impossible d'annuler un rendez-vous qui n'est pas en attente");
        }

        // Mettre à jour le statut plutôt que de supprimer
        appointment.setStatus(AppointmentStatus.CANCELLED);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(updatedAppointment);
    }

    public List<MedicalRecordDTO> getPatientMedicalRecords() {
        User currentPatient = getCurrentUser();
        return medicalRecordRepository.findByPatient(currentPatient).stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    /**
     * Envoie un message à un médecin ou à un autre utilisateur
     */
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User currentPatient = getCurrentUser();

        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        Message message = Message.builder()
                .sender(currentPatient)
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
        User currentPatient = getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return messageRepository.findConversation(currentPatient, otherUser).stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marque comme lus tous les messages d'une conversation
     */
    public void markMessagesAsRead(Long userId) {
        User currentPatient = getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> unreadMessages = messageRepository.findUnreadMessages(otherUser, currentPatient);
        
        unreadMessages.forEach(message -> {
            message.setRead(true);
            messageRepository.save(message);
        });
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non connecté"));
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