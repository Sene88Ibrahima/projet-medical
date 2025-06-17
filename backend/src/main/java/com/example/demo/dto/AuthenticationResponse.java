package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String dashboardUrl; // URL de redirection vers le dashboard approprié
}