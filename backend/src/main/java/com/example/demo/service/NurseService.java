package com.example.demo.service;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.*;
import com.example.demo.repository.AppointmentRepository;
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
public class NurseService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageRepository messageRepository;

    public List<UserDTO> getAllDoctors() {
        return userRepository.findByRole(Role.DOCTOR).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getDoctorAppointments(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        return appointmentRepository.findByDoctor(doctor).stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        User patient = userRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .dateTime(appointmentDTO.getDateTime())
                .reason(appointmentDTO.getReason())
                .status(appointmentDTO.getStatus())
                .notes(appointmentDTO.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(savedAppointment);
    }

    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

        if (appointmentDTO.getPatientId() != null) {
            User patient = userRepository.findById(appointmentDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            appointment.setPatient(patient);
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

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Rendez-vous non trouvé");
        }
        appointmentRepository.deleteById(id);
    }

    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User currentUser = getCurrentUser();

        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinataire non trouvé"));

        Message message = Message.builder()
                .sender(currentUser)
                .receiver(receiver)
                .content(messageDTO.getContent())
                .sentAt(LocalDateTime.now())
                .read(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        return mapToMessageDTO(savedMessage);
    }

    public List<MessageDTO> getConversation(Long userId) {
        User currentUser = getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return messageRepository.findConversation(currentUser, otherUser).stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
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
}