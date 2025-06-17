# Projet Médical

Gestion complète de dossiers, rendez-vous, messages et imagerie médicale pour les hôpitaux et cliniques.

---

## Sommaire
1. [Aperçu](#aperçu)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Démarrage local](#démarrage-local)
5. [Variables d’environnement](#variables-denvironnement)
6. [Déploiement](#déploiement)
   * [Base de données Supabase](#base-de-données-supabase)
   * [Orthanc conteneur Docker](#orthanc-conteneur-docker)
   * [Backend Spring Boot](#backend-spring-boot)
   * [Frontend React](#frontend-react)
7. [Email & Notifications](#email--notifications)
8. [Endpoints principaux](#endpoints-principaux)
9. [Licence](#licence)

---

## Aperçu
Application full-stack destinée à la gestion médicale :
* **Backend** : Spring Boot 3 (Java 23), PostgreSQL, Spring Security (JWT), Orthanc pour les DICOM.
* **Frontend** : React 18 + Vite.
* **Déploiement cible** : PostgreSQL hébergé sur **Supabase**, Orthanc dans un conteneur **Docker** exposé publiquement.

## Architecture
```
┌─────────────┐        REST/JSON        ┌────────────┐        JDBC            ┌────────────────┐
│  Frontend   │  <───────────────────► │  Backend   │ ────────────────────► │  Supabase PG   │
│ React (3000)│                        │ SpringBoot │                        │   (PostgreSQL) │
└─────────────┘                        │   (8080)   │                        └────────────────┘
       ▲                               └──────▲─────┘                              ▲
       │  JPEG/MP4 preview                   │                                       │
       │                                     │ REST/DICOM                           │
┌─────────────┐  HTTPS / DICOMweb   ┌────────┴───────┐                              │
│   Browser    │ ◄──────────────────│  Orthanc DC    │◄────────────────────────────┘
└─────────────┘                    └────────────────┘
                                    (Docker container)
```
Les données applicatives et métadonnées DICOM sont stockées dans **Supabase PostgreSQL**. Les fichiers DICOM bruts restent dans Orthanc (stockage objet interne ou volume).

Les métadonnées DICOM sont stockées dans PostgreSQL, les fichiers réels restent dans Orthanc.

## Fonctionnalités
* Authentification JWT + activation de compte par e-mail.
* Gestion des rôles : PATIENT, DOCTOR, NURSE, ADMIN.
* Messagerie interne + notification e-mail.
* Rendez-vous médicaux.
* Dossiers médicaux avec images DICOM.
* Partage d’articles & dossiers entre médecins (e-mail).

## Démarrage local
### Prérequis
* JDK 21+ (le build utilise Java 23).
* Node 18+ & npm.
* Docker (pour Orthanc) – facultatif si vous pointez sur votre instance en ligne.
* PostgreSQL local **OU** une connexion Supabase.

### Backend
```powershell
cd backend
# 1. Configurer les variables dans application.properties ou via JVM (-D)
# 2. Lancer
.\gradlew.bat bootRun
```
Accès : `http://localhost:8080/swagger-ui/index.html` (si Swagger activé).

### Frontend
```bash
cd frontend
npm install
npm start    # http://localhost:3000
```

## Variables d’environnement
| Clé | Exemple | Description |
|-----|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.supabase.co:5432/postgres` | URL JDBC Supabase |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | User Supabase |
| `SPRING_DATASOURCE_PASSWORD` | `******` | Password |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `SPRING_MAIL_PORT` | `587` | SMTP port |
| `SPRING_MAIL_USERNAME` | `noreply@demo.com` | SMTP user |
| `SPRING_MAIL_PASSWORD` | `******` | SMTP pwd |
| `ORTHANC_BASE_URL` | `https://orthanc.myhosp.com` | URL publique du conteneur Orthanc |
| `ORTHANC_USERNAME` | `orthanc` | login |
| `ORTHANC_PASSWORD` | `orthanc` | pwd |
| `JWT_SECRET` | `superSecretKey` | clé de signature JWT |

Ajoutez ces variables dans : `backend/src/main/resources/application.properties` ou via votre provider de cloud (Heroku, Render, etc.).

## Déploiement
### Base de données Supabase
1. Créez un nouveau projet Supabase.  
2. Notez l’URL et le mot de passe « DB_PASSWORD ».  
3. Dans Supabase SQL Editor, exécutez `CREATE EXTENSION IF NOT EXISTS pgcrypto;` (UUID).  
4. Ajoutez la connexion dans vos variables d’environnement (voir tableau).

### Orthanc conteneur Docker
```bash
docker run -d --name orthanc \
  -p 8042:8042 -p 4242:4242 \
  -e ORTHANC__AUTHENTICATION_ENABLED=true \
  -e ORTHANC__REGISTERED_USERS__orthanc=orthanc \
  jodogne/orthanc-plugins
```
Exposez `8042` (HTTP REST & DICOMweb). Utilisez un reverse-proxy (Traefik, Nginx) + HTTPS pour la production.

### Backend Spring Boot
* Build : `./gradlew clean bootJar`
* Déployer le JAR sur votre serveur ou utiliser Docker :
```dockerfile
FROM eclipse-temurin:21-jre
COPY build/libs/backend-*.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app.jar"]
```
Ajoutez les variables d’environnement vues plus haut.

### Frontend React
1. Définir `VITE_API_URL=https://api.myhosp.com` dans `.env`.  
2. `npm run build` → déployer le dossier `dist/` sur Vercel, Netlify, etc.

## Email & Notifications
Le backend utilise `spring-boot-starter-mail`. Remplissez les variables SMTP. Les notifications sont envoyées :
* à l’inscription (lien d’activation) ;
* lors d’un nouveau message interne ;
* lors du partage d’un article ou dossier médical.

## Endpoints principaux
| Méthode | URL | Description |
|---------|-----|-------------|
| `POST /api/v1/auth/register` | Inscription patient (e-mail d’activation) |
| `GET  /api/v1/auth/activate?email=` | Active le compte |
| `POST /api/v1/auth/authenticate` | Login (JWT) |
| `GET  /api/v1/doctor/patients` | Liste des patients |
| `POST /api/v1/doctor/medical-records` | Création dossier médical + mail |
| `POST /api/v1/doctor/messages` | Envoi message + mail |

Consultez les autres URL dans le code ou via Swagger.

## Licence
MIT.