package com.example.demo.service;

import com.example.demo.dto.AppointmentDTO;
import com.example.demo.dto.MedicalRecordDTO;
import com.example.demo.dto.MessageDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.MedicalImageDTO;
import com.example.demo.model.*;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.MedicalImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MessageRepository messageRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalImageRepository medicalImageRepository;

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
        User currentUser = getCurrentUser();
        List<MedicalRecord> records = medicalRecordRepository.findByDoctor(currentUser);
        return records.stream()
                .map(this::mapToMedicalRecordDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getMedicalRecordDetails(Long id) {
        User currentUser = getCurrentUser();
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));

        // Vérifier que le dossier appartient bien au docteur
        if (!record.getDoctor().equals(currentUser)) {
            throw new RuntimeException("Accès non autorisé à ce dossier médical");
        }

        return mapToMedicalRecordDTO(record);
    }

    /**
     * Crée un nouveau dossier médical pour un patient
     */
    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO medicalRecordDTO) {
        try {
            if (medicalRecordDTO == null) {
                throw new IllegalArgumentException("Le DTO du dossier médical ne peut pas être null");
            }

            if (medicalRecordDTO.getPatientId() == null) {
                throw new IllegalArgumentException("L'ID du patient ne peut pas être null");
            }

            User currentDoctor = getCurrentUser();
            System.out.println("Médecin actuel: " + currentDoctor.getEmail() + " (ID: " + currentDoctor.getId() + ")");
            
            User patient = userRepository.findById(medicalRecordDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'ID: " + medicalRecordDTO.getPatientId()));
            System.out.println("Patient trouvé: " + patient.getEmail() + " (ID: " + patient.getId() + ")");
            
            if (patient.getRole() != Role.PATIENT) {
                throw new IllegalArgumentException("L'utilisateur sélectionné n'est pas un patient");
            }
            
            MedicalRecord medicalRecord = MedicalRecord.builder()
                    .patient(patient)
                    .doctor(currentDoctor)
                    .diagnosis(medicalRecordDTO.getDiagnosis())
                    .treatment(medicalRecordDTO.getTreatment())
                    .createdAt(LocalDateTime.now())
                    .notes(medicalRecordDTO.getNotes())
                    .medicalImages(new ArrayList<>())
                    .build();
            
            System.out.println("Création du dossier médical...");
            System.out.println("Diagnostic: " + medicalRecord.getDiagnosis());
            System.out.println("Traitement: " + medicalRecord.getTreatment());
            
            MedicalRecord savedMedicalRecord = medicalRecordRepository.save(medicalRecord);
            System.out.println("Dossier médical créé avec l'ID: " + savedMedicalRecord.getId());
            
            // Associer les images DICOM au dossier médical
            if (medicalRecordDTO.getMedicalImages() != null) {
                System.out.println("Traitement de " + medicalRecordDTO.getMedicalImages().size() + " images DICOM");
                for (MedicalImageDTO imageDTO : medicalRecordDTO.getMedicalImages()) {
                    if (imageDTO.getOrthancInstanceId() != null) {
                        System.out.println("Association de l'image DICOM avec ID Orthanc: " + imageDTO.getOrthancInstanceId());
                        MedicalImage medicalImage = MedicalImage.builder()
                                .medicalRecord(savedMedicalRecord)
                                .orthancInstanceId(imageDTO.getOrthancInstanceId())
                                .imageType(imageDTO.getImageType())
                                .description(imageDTO.getDescription())
                                .uploadedAt(LocalDateTime.now())
                                .build();
                        
                        MedicalImage savedImage = medicalImageRepository.save(medicalImage);
                        System.out.println("Image médicale enregistrée avec ID: " + savedImage.getId());
                        
                        // Ajouter l'image à la liste des images du dossier médical
                        savedMedicalRecord.getMedicalImages().add(savedImage);
                    } else {
                        System.err.println("Erreur: ID Orthanc manquant pour une image");
                    }
                }
                // Mettre à jour le dossier médical avec les images associées
                savedMedicalRecord = medicalRecordRepository.save(savedMedicalRecord);
                System.out.println("Dossier médical mis à jour avec " + savedMedicalRecord.getMedicalImages().size() + " images");
            }
            
            return mapToMedicalRecordDTO(savedMedicalRecord);
        } catch (Exception e) {
            System.err.println("Erreur détaillée lors de la création du dossier médical:");
            System.err.println("Type d'erreur: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            System.err.println("Stack trace:");
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la création du dossier médical: " + e.getMessage(), e);
        }
    }

    /**
     * Supprime un dossier médical
     */
    public void deleteMedicalRecord(Long id) {
        User currentDoctor = getCurrentUser();
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));
        
        // Vérifier que le médecin est bien l'auteur du dossier
        if (!medicalRecord.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce dossier médical");
        }
        
        // Supprimer d'abord les images associées
        List<MedicalImage> images = medicalImageRepository.findByMedicalRecord(medicalRecord);
        medicalImageRepository.deleteAll(images);
        
        // Puis supprimer le dossier
        medicalRecordRepository.delete(medicalRecord);
    }

    /**
     * Annule un rendez-vous
     */
    public AppointmentDTO cancelAppointment(Long id) {
        User currentDoctor = getCurrentUser();
        
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        // Vérifier si le médecin est bien celui assigné au rendez-vous
        if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler ce rendez-vous");
        }
        
        // Vérifier que le rendez-vous est bien à l'état SCHEDULED
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new RuntimeException("Impossible d'annuler un rendez-vous qui n'est pas en attente");
        }
        
        // Mettre à jour le statut
        appointment.setStatus(AppointmentStatus.CANCELLED);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToAppointmentDTO(updatedAppointment);
    }

    /**
     * Crée un rendez-vous pour un patient
     */
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        try {
            System.out.println("DoctorService: Début de la création de rendez-vous");
            
            // Déterminer l'utilisateur courant (doit être un médecin)
            User currentDoctor = getCurrentUser();
            System.out.println("DoctorService: Médecin authentifié - ID: " + currentDoctor.getId() + ", Email: " + currentDoctor.getEmail() + ", Role: " + currentDoctor.getRole());
            
            // Trouver le patient
            System.out.println("DoctorService: Recherche du patient avec ID: " + appointmentDTO.getPatientId());
            User patient = userRepository.findById(appointmentDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            System.out.println("DoctorService: Patient trouvé - ID: " + patient.getId() + ", Email: " + patient.getEmail() + ", Role: " + patient.getRole());

            // Vérifier que l'utilisateur est bien un patient
            if (patient.getRole() != Role.PATIENT) {
                System.err.println("DoctorService: Erreur - L'utilisateur sélectionné n'est pas un patient (Role: " + patient.getRole() + ")");
                throw new RuntimeException("L'utilisateur sélectionné n'est pas un patient");
            }
            
            // Création de l'objet rendez-vous
            System.out.println("DoctorService: Création de l'objet rendez-vous");
            Appointment appointment = Appointment.builder()
                    .patient(patient)
                    .doctor(currentDoctor)
                    .dateTime(appointmentDTO.getDateTime())
                    .reason(appointmentDTO.getReason())
                    .status(AppointmentStatus.SCHEDULED)
                    .notes(appointmentDTO.getNotes())
                    .build();

            // Sauvegarde en base de données
            System.out.println("DoctorService: Sauvegarde du rendez-vous en base de données");
            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("DoctorService: Rendez-vous sauvegardé avec ID: " + savedAppointment.getId());
            
            // Conversion en DTO
            AppointmentDTO result = mapToAppointmentDTO(savedAppointment);
            System.out.println("DoctorService: DTO créé avec succès");
            return result;
        } catch (Exception e) {
            System.err.println("DoctorService: Erreur lors de la création du rendez-vous: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Utilitaires
    
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                System.err.println("DoctorService: Erreur - Aucune authentication trouvée dans le contexte de sécurité");
                throw new RuntimeException("Aucune authentification trouvée");
            }
            
            System.out.println("DoctorService: Authentication - Principal: " + authentication.getPrincipal() + ", Name: " + authentication.getName());
            System.out.println("DoctorService: Authorities: " + authentication.getAuthorities());
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non connecté"));
            
            System.out.println("DoctorService: Utilisateur trouvé - ID: " + user.getId() + ", Email: " + user.getEmail() + ", Role: " + user.getRole());
                    
            // Désactiver temporairement la vérification du rôle DOCTOR
            // if (user.getRole() != Role.DOCTOR) {
            //     System.err.println("DoctorService: Erreur - L'utilisateur n'est pas un médecin (Role: " + user.getRole() + ")");
            //     throw new RuntimeException("L'utilisateur n'est pas un médecin");
            // }
            
            return user;
        } catch (Exception e) {
            System.err.println("DoctorService: Erreur lors de la récupération de l'utilisateur courant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
    
    private MedicalRecordDTO mapToMedicalRecordDTO(MedicalRecord record) {
        List<MedicalImageDTO> imageDTOs = record.getMedicalImages().stream()
                .map(image -> MedicalImageDTO.builder()
                        .id(image.getId())
                        .orthancInstanceId(image.getOrthancInstanceId())
                        .imageType(image.getImageType())
                        .description(image.getDescription())
                        .uploadedAt(image.getUploadedAt())
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