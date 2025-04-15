package com.example.demo.service;

import com.example.demo.dto.AdminDashboardStats;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.AppointmentStatus;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.MedicalImageRepository;
import com.example.demo.repository.MedicalRecordRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalImageRepository medicalImageRepository;

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

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole());

        User updatedUser = userRepository.save(user);
        return mapToUserDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
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