package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialise automatiquement un compte ADMIN et un compte NURSE (assistant)
 * lors du démarrage de l'application si ceux-ci n'existent pas encore.
 * <p>
 * – Évite la duplication en vérifiant l'email.
 * – Utilise {@link PasswordEncoder} pour encoder les mots de passe.
 * – Peut être désactivé en excluant le profil « default » ou en supprimant ce bean.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("default") // n'exécute le runner que sur le profil par défaut
public class DefaultUsersInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists(
                "admin8@mediconnect.com",
                "Super",
                "Admin",
                "Admin123!",
                Role.ADMIN
        );

        createUserIfNotExists(
                "assistant@mediconnect.com",
                "Alice",
                "Assistant",
                "Assistant123!",
                Role.NURSE
        );
    }

    private void createUserIfNotExists(String email, String firstName, String lastName, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            log.info("Utilisateur {} déjà présent, aucune création.", email);
            return;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();

        userRepository.save(user);
        log.info("Utilisateur {} (role: {}) créé automatiquement.", email, role);
    }
}
