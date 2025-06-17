**Cloner le projet : [https://github.com/Sene88Ibrahima/projet-medical.git](https://github.com/Sene88Ibrahima/projet-medical.git)**

 

**Rapport Final – Diagnoplus**

> Application de gestion médicale complète intégrant Orthanc, Supabase et notifications e-mail.

**1\. Présentation du Projet – Diagnoplus**

Diagnoplus est désormais une plateforme SaaS prête à l’emploi : patients et professionnels peuvent gérer dossiers médicaux, rendez-vous, imagerie et communication sécurisée.

Nouveautés depuis la version initiale :
* Intégration **Supabase PostgreSQL** hébergé pour les données applicatives.
* Conteneur **Orthanc** Docker exposé publiquement pour le stockage DICOM.
* Notification **e-mail** (activation de compte, nouveaux messages, partage de dossiers/articles).
* Flux d’activation de compte (statut SUSPENDED → ACTIVE).
* Déploiement conteneurisé du backend Spring Boot & frontend React.
* Documentation complète (README + Swagger) et pipeline CI Gradle.

**L’application offrira :**  
 ✅ Un espace sécurisé pour les patients afin de consulter leurs résultats et communiquer avec leur médecin.  
 ✅ Une interface avancée pour les médecins afin d’analyser les images médicales, rédiger des rapports et envoyer des feedbacks aux patients.  
 ✅ Un système de gestion des rendez-vous pour organiser les consultations.

 

**2\. Objectifs du Projet**

✅ Faciliter la gestion des images médicales pour les médecins et radiologues.  
 ✅ Permettre aux médecins d’analyser et d’annoter les images médicales.  
 ✅ Envoyer des comptes rendus médicaux et des feedbacks aux patients.  
 ✅ Optimiser la prise de rendez-vous médicaux via un agenda en ligne.  
 ✅ Améliorer la communication entre patients et médecins grâce à une messagerie intégrée.

 

**3\. Fonctionnalités Réalisées**

*(✓ = implémenté · 🚀 = nouvelle fonctionnalité ajoutée lors de l’itération finale)*

**3.1. Gestion des Utilisateurs**

**📌 Espace Patient**

* Inscription et connexion sécurisée (JWT / OAuth2).  
* Consultation du dossier médical et des résultats d’analyses.  
* Prise de rendez-vous en ligne avec un médecin.  
* Accès et téléchargement des images médicales DICOM via Orthanc.  
* Réception des feedbacks et diagnostics envoyés par le médecin.  
* Messagerie interne avec les médecins.

**📌 Espace Médecin**

* Connexion sécurisée et gestion de son agenda.  
* Consultation des dossiers patients et de leur historique médical.  
* Analyse des images médicales DICOM avec outils avancés :  
  * Zoom, contraste, rotation, annotations sur l’image.  
  * Possibilité de comparer plusieurs images d’un même patient.  
* Rédaction d’un rapport médical sur l’image analysée.  
* Envoi du diagnostic et des recommandations au patient.  
* Gestion et suivi des rendez-vous avec notifications automatiques.

**📌 Espace Administrateur**

* Gestion des comptes utilisateurs (patients et médecins).  
* Suivi des rendez-vous et gestion des permissions.  
* Administration des dossiers médicaux et images archivées.

 

**3.2. Gestion des Images Médicales et Dossiers**

✅ Stockage et organisation des images médicales via Orthanc.  
 ✅ Visualisation DICOM avancée avec zoom, contraste et annotations.  
 ✅ Possibilité d’ajouter des observations sur l’image directement depuis l’interface.  
 ✅ Génération et téléchargement du rapport médical lié à l’image.  
 ✅ Recherche rapide des examens passés par patient, date et type d’examen.  
 ✅ Téléchargement sécurisé des images médicales et résultats d’analyses.

 

**3.3. Prise de Rendez-vous Médical**

✅ Sélection du médecin et de la spécialité via un agenda interactif.  
 ✅ Confirmation des rendez-vous avec notifications e-mail.  
 ✅ Annulation et report de rendez-vous selon la disponibilité.  
 ✅ Gestion des horaires et plannings médicaux côté médecin.

 

**3.4. Communication et Feedback Médical**

✅ Messagerie intégrée entre patients et médecins **(e-mail de notification 🚀)**  
 ✅ Consultation vidéo (optionnel) pour les téléconsultations.  
 ✅ Transmission sécurisée des comptes rendus médicaux et feedbacks.  
 ✅ Espace de discussion pour répondre aux questions du patient sur les résultats.

 

**3.5. Sécurisation des Données Médicales**

✅ Authentification avec JWT (**activation de compte par e-mail 🚀**).  
 ✅ Chiffrement des données sensibles pour garantir la confidentialité.  
 ✅ Respect des normes médicales (RGPD, HIPAA).  
 ✅ Permissions avancées pour restreindre l’accès aux données médicales.

 

**3.6. Base de Connaissances & Articles Médicaux 🚀**

✅ Publication d’articles scientifiques par les médecins (Markdown/PDF).  
✅ Partage ciblé ou public d’un article avec autres praticiens **(notification e-mail)**.  
✅ Indexation et recherche plein-texte (titre, spécialité, tags).  
✅ Historique des versions et possibilité de commenter un article.  
🎯 Constituer une base de données médicale collaborative pour soutenir la recherche.

---

**4. Contraintes Techniques**

**4.1. Backend – Spring Boot**

📌 Framework : Spring Boot (REST API)  
 📌 Base de données : **Supabase PostgreSQL** (hébergée) – stockage utilisateurs & métadonnées  
 📌 Gestion des utilisateurs : Spring Security \+ JWT + flux d’activation  
 📌 Gestion des images médicales : Intégration avec Orthanc PACS via API REST  
 📌 Service de notifications : **Spring Boot Mail** pour e-mail  
 📌 Gestion des rendez-vous : API de calendrier intégré

 

**4.2. Frontend – React.js**

📌 Framework : React.js avec Redux pour la gestion d’état  
 📌 UI Design : Tailwind CSS / Material-UI  
 📌 Affichage des images médicales : Cornerstone.js (visionneuse DICOM)  
 📌 Sécurité : Connexion via JWT, sessions sécurisées  
 📌 Responsive design pour une utilisation sur mobile et tablette

 

**4.3. Sécurité et Hébergement**

📌 Connexion HTTPS et chiffrement des données sensibles  
 📌 Déploiement sur un serveur cloud sécurisé (AWS, DigitalOcean, Azure)  
 📌 Sauvegardes automatiques des données médicales

 

**5\. Plan de Développement**

 **Développeur 1 – Frontend (React.js) 🎨**

**📌 Rôle :** Responsable de l’interface utilisateur et de la communication avec l’API Backend.

**👨‍💻** Tâches :

✅ Gestion de l’authentification et des utilisateurs

* Création des formulaires d’inscription & connexion (JWT).  
* Gestion du profil utilisateur (patients & médecins).

✅ Dashboard & UI des espaces Patients et Médecins

* Développement des interfaces patients et médecins.  
* Intégration des listes de dossiers médicaux et consultations.  
* Mise en place de Redux / Context API pour la gestion d’état.

✅ **Gestion des rendez-vous et messagerie**

* Interface de prise de rendez-vous et planning médecin.  
* Implémentation de la messagerie patient-médecin.

✅ **Intégration de la visualisation des images médicales**

* Utilisation de Cornerstone.js pour afficher les fichiers DICOM.  
* Interaction avec le Backend Orthanc pour charger les images.

✅ **Optimisation et tests UI**

* Adaptation pour Mobile & Desktop (Responsive Design).  
* Tests UI avec Jest / React Testing Library.

 

 **Développeur 2 – Backend API (Spring Boot) 🛠️**

**📌 Rôle :** Responsable du développement de l’API REST et des fonctionnalités métier.

**👨‍💻** Tâches :

✅ Gestion des utilisateurs et rôles

* Développement de l’API d’authentification (Spring Security \+ JWT).  
* Création des rôles (Patient, Médecin, Admin) et permissions d’accès.

✅ Gestion des dossiers médicaux et rendez-vous

* API CRUD pour patients, consultations et rendez-vous.  
* Intégration de la base de données PostgreSQL.  
* Création d’un système de recherche avancé des dossiers.

✅ API pour le feedback médical

* Méthodes pour permettre aux médecins d’envoyer des diagnostics.  
* Génération et envoi de rapports médicaux aux patients.

✅ Documentation et tests API

* Mise en place de Swagger pour documenter l’API REST.  
* Tests unitaires et d’intégration avec JUnit et Postman.

 

 **Développeur 3 – Backend Orthanc & Sécurité 🔒**

📌 Rôle : Responsable de l’intégration d’Orthanc et de la sécurisation des fichiers médicaux.

👨‍💻 Tâches :

✅ Intégration d’Orthanc pour la gestion des images médicales

* Configuration d’Orthanc PACS et API REST.  
* Développement des endpoints pour l’upload, la récupération et l’annotation des images DICOM.

✅ Sécurisation des fichiers médicaux

* Chiffrement des images pour garantir la confidentialité.  
* Gestion des droits d’accès aux fichiers selon le rôle utilisateur.

✅ Optimisation et performances

* Gestion des sauvegardes automatiques des fichiers DICOM.  
* Surveillance et optimisation des requêtes API Orthanc.

 

