package com.example.demo.service;

import com.example.demo.dto.AdminDashboardStats;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.AppointmentStatus;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.model.AccountStatus;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.MedicalImageRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalImageRepository medicalImageRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return mapToUserDTO(user);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier unicité de l'email si modifié
        if (!user.getEmail().equals(userDTO.getEmail()) && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole());

        User updatedUser = userRepository.save(user);
        return mapToUserDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        boolean hasDependencies = !user.getDoctorAppointments().isEmpty()
                || !user.getPatientAppointments().isEmpty()
                || !user.getMedicalRecords().isEmpty();

        if (hasDependencies) {
            // Suspension au lieu de suppression pour préserver l'intégrité
            changeStatus(id, AccountStatus.SUSPENDED);
        } else {
            userRepository.delete(user);
        }
    }

    public AdminDashboardStats getDashboardStats() {
        return AdminDashboardStats.builder()
                .totalPatients(userRepository.countByRole(Role.PATIENT))
                .totalDoctors(userRepository.countByRole(Role.DOCTOR))
                .totalNurses(userRepository.countByRole(Role.NURSE))
                .pendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.SCHEDULED))
                .completedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED))
                .totalMedicalRecords(medicalRecordRepository.count())
                .totalMedicalImages(medicalImageRepository.count())
                .build();
    }

    /**
     * Permet à un administrateur de créer un nouvel utilisateur avec un rôle spécifique
     * Seuls les rôles DOCTOR, NURSE et ADMIN sont autorisés
     */
    public UserDTO createUser(UserDTO userDTO, String password) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        
        // Vérifier que le rôle est autorisé (pas de création de PATIENT par cette méthode)
        if (userDTO.getRole() == Role.PATIENT) {
            throw new RuntimeException("Les patients doivent s'inscrire via l'inscription publique");
        }
        
        // Créer le nouvel utilisateur
        User user = User.builder()
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(password))
                .role(userDTO.getRole())
                .build();
        
        User savedUser = userRepository.save(user);
        return mapToUserDTO(savedUser);
    }

    /**
     * Change le statut d'un compte (activation / suspension)
     */
    public void changeStatus(Long id, AccountStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Empêcher un admin de se désactiver lui-même
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName().equals(user.getEmail()) && status == AccountStatus.SUSPENDED) {
            throw new RuntimeException("Impossible de suspendre son propre compte");
        }

        user.setStatus(status);
        userRepository.save(user);
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
}