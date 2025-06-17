package com.example.demo.service;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MedicalImageDTO;
import com.example.demo.service.EmailService;
import com.example.demo.model.*;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.MedicalImageRepository;
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
@Transactional
@RequiredArgsConstructor
public class NurseService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageRepository messageRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalImageRepository medicalImageRepository;
    private final EmailService emailService;

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
        // Send email notification
        emailService.sendSimpleMessage(receiver.getEmail(), "Nouveau message", "Vous avez reçu un nouveau message de " + currentUser.getFirstName() + " " + currentUser.getLastName() + ".");
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

    /* ======== Appointments ======== */

    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToAppointmentDTO)
                .collect(Collectors.toList());
    }

    /* ======== Medical Records ======== */

    public List<MedicalRecordDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getMedicalRecordDetails(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));
        return mapToMedicalRecordDTO(record);
    }

    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO dto) {
        if (dto.getPatientId() == null || dto.getDoctorId() == null) {
            throw new RuntimeException("PatientId et DoctorId sont requis");
        }
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .diagnosis(dto.getDiagnosis())
                .treatment(dto.getTreatment())
                .notes(dto.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToMedicalRecordDTO(saved);
    }

    public void deleteMedicalRecord(Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new RuntimeException("Dossier médical non trouvé");
        }
        // delete associated images first
        MedicalRecord rec = medicalRecordRepository.findById(id).get();
        List<MedicalImage> images = medicalImageRepository.findByMedicalRecord(rec);
        medicalImageRepository.deleteAll(images);
        medicalRecordRepository.delete(rec);
    }

    private MedicalRecordDTO mapToMedicalRecordDTO(MedicalRecord record) {
        List<MedicalImageDTO> imageDTOs = record.getMedicalImages() == null ? List.of() :
                record.getMedicalImages().stream()
                        .map(img -> MedicalImageDTO.builder()
                                .id(img.getId())
                                .orthancInstanceId(img.getOrthancInstanceId())
                                .imageType(img.getImageType())
                                .description(img.getDescription())
                                .uploadedAt(img.getUploadedAt())
                                .build())
                        .collect(Collectors.toList());

        return MedicalRecordDTO.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getFirstName() + " " + record.getPatient().getLastName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getFirstName() + " " + record.getDoctor().getLastName())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .createdAt(record.getCreatedAt())
                .notes(record.getNotes())
                .medicalImages(imageDTOs)
                .imageCount(imageDTOs.size())
                .build();
    }
}