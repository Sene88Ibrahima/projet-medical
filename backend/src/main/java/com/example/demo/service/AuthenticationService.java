package com.example.demo.service;

import com.example.demo.dto.AuthenticationRequest;
import com.example.demo.dto.AuthenticationResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.service.EmailService;
import com.example.demo.model.AccountStatus;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Pour l'inscription publique, seul le rôle PATIENT est autorisé
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT) // Forcer le rôle PATIENT pour l'inscription publique
                .status(AccountStatus.SUSPENDED)
                .build();

        userRepository.save(user);
        // Send activation email
        String activationLink = "http://localhost:8080/api/v1/auth/activate?email=" + user.getEmail();
        emailService.sendSimpleMessage(user.getEmail(), "Activation de votre compte", "Merci de cliquer sur le lien suivant pour activer votre compte: " + activationLink);

        var jwtToken = jwtService.generateToken(user);

        String dashboardUrl = getDashboardUrlByRole(user.getRole());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .dashboardUrl(dashboardUrl)
                .build();
    }

    public void activateAccount(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (user.getStatus() == AccountStatus.ACTIVE) {
            return; // déjà activé
        }
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        var jwtToken = jwtService.generateToken(user);

        String dashboardUrl = getDashboardUrlByRole(user.getRole());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .dashboardUrl(dashboardUrl)
                .build();
    }

    private String getDashboardUrlByRole(Role role) {
        return switch (role) {
            case ADMIN -> "/dashboard/admin";
            case DOCTOR -> "/dashboard/doctor";
            case NURSE -> "/dashboard/nurse";
            case PATIENT -> "/dashboard/patient";
        };
    }
}