package com.example.demo.model;

/**
 * Représente l'état d'un compte utilisateur.
 */
public enum AccountStatus {
    /** Compte actif, l'utilisateur peut se connecter */
    ACTIVE,
    /** Compte suspendu, connexion interdite */
    SUSPENDED
}
