// src/pages/MessagesPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Card, Spinner, Modal, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaPaperclip, FaUserMd, FaUserCog, FaUser } from 'react-icons/fa';
import axios from '../api/auth';

const MessagesPage = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileAttachment, setFileAttachment] = useState(null);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newConversation, setNewConversation] = useState({ recipientId: '', message: '' });
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Titre de la page en fonction du rôle
    const getPageTitle = () => {
        switch(user?.role) {
            case 'DOCTOR':
                return 'Messages de mes patients';
            case 'ADMIN':
                return 'Gestion des messages';
            default:
                return 'Mes messages médicaux';
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Charger les contacts pour l'utilisateur
        const fetchContacts = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                
                let contactsData = [];
                
                try {
                    // Essayer de charger les contacts depuis le backend
                    let endpoint;
                    
                    // Adapter l'endpoint en fonction du rôle
                    if (user.role === 'DOCTOR') {
                        endpoint = '/api/v1/doctor/patients'; // Endpoint pour les médecins
                    } else if (user.role === 'PATIENT') {
                        endpoint = '/api/v1/patient/doctors'; // Endpoint pour les patients
                    } else if (user.role === 'ADMIN') {
                        endpoint = '/api/v1/admin/users'; // Endpoint pour les administrateurs
                    } else if (user.role === 'NURSE') {
                        endpoint = '/api/v1/nurse/doctors'; // Endpoint pour les infirmières
                    } else {
                        throw new Error("Rôle non pris en charge");
                    }
                    
                    const response = await axios.get(endpoint);
                    contactsData = response.data;
                    
                    // Vérifier que les données sont bien au format attendu
                    if (Array.isArray(contactsData) && contactsData.length > 0) {
                        console.log("Contacts chargés depuis le serveur:", contactsData.length);
                    } else {
                        // Si les données sont vides ou mal formatées, utiliser les données en cache ou simulées
                        throw new Error("Format de données incorrect depuis le serveur");
                    }
                } catch (err) {
                    console.error("Erreur lors du chargement des contacts depuis le serveur:", err);
                    
                    // Essayer de charger depuis localStorage en cas d'échec
                    const storedContacts = localStorage.getItem('user_contacts');
                    if (storedContacts) {
                        try {
                            contactsData = JSON.parse(storedContacts);
                            console.log("Contacts chargés depuis localStorage:", contactsData.length);
                        } catch (e) {
                            console.error("Erreur lors du parsing des contacts stockés:", e);
                            contactsData = await loadMockContacts(); // Charger les données simulées
                        }
                    } else {
                        contactsData = await loadMockContacts(); // Charger les données simulées
                    }
                }
                
                // Filtrer les contacts selon le rôle si nécessaire
                let filteredContacts = contactsData;
                if (user.role === 'DOCTOR') {
                    // Un médecin voit principalement ses patients
                    filteredContacts = contactsData.filter(c => c.role === 'PATIENT');
                } else if (user.role === 'PATIENT') {
                    // Un patient voit principalement ses médecins
                    filteredContacts = contactsData.filter(c => c.role === 'DOCTOR');
                }
                
                setContacts(filteredContacts);
                // Sélectionner le premier contact par défaut s'il existe
                if (filteredContacts.length > 0 && !selectedContact) {
                    setSelectedContact(filteredContacts[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des contacts:", err);
                setError("Impossible de charger vos contacts. Le serveur ne répond pas.");
                setLoading(false);
            }
        };

        const loadMockContacts = () => {
            return new Promise((resolve) => {
                console.log("Chargement des contacts simulés");
                
                // Utiliser des données fictives pour le développement
                let mockContacts = [
                    {
                        id: 1,
                        firstName: 'Marie',
                        lastName: 'Martin',
                        role: 'DOCTOR',
                        specialty: 'Cardiologie',
                        unreadCount: 2,
                        lastMessage: 'Bonjour, comment allez-vous aujourd\'hui?',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: 2,
                        firstName: 'Jean',
                        lastName: 'Dupont',
                        role: 'PATIENT',
                        unreadCount: 0,
                        lastMessage: 'Merci pour la consultation',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: 3,
                        firstName: 'Philippe',
                        lastName: 'Dubois',
                        role: 'DOCTOR',
                        specialty: 'Neurologie',
                        unreadCount: 1,
                        lastMessage: 'Vos résultats sont disponibles',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: 4,
                        firstName: 'Sophie',
                        lastName: 'Moreau',
                        role: 'PATIENT',
                        unreadCount: 3,
                        lastMessage: 'J\'ai une question concernant mon traitement',
                        avatar: 'https://via.placeholder.com/50'
                    },
                    {
                        id: 5,
                        firstName: 'Admin',
                        lastName: 'Système',
                        role: 'ADMIN',
                        unreadCount: 0,
                        lastMessage: 'Votre compte a été mis à jour',
                        avatar: 'https://via.placeholder.com/50'
                    }
                ];
                
                // Filtrer les contacts selon le rôle
                if (user?.role === 'DOCTOR') {
                    // Un médecin voit principalement ses patients
                    mockContacts = mockContacts.filter(c => c.role === 'PATIENT' || c.role === 'ADMIN');
                } else if (user?.role === 'PATIENT') {
                    // Un patient voit principalement ses médecins
                    mockContacts = mockContacts.filter(c => c.role === 'DOCTOR' || c.role === 'ADMIN');
                }
                // Admin voit tout le monde
                
                // Stocker les données simulées dans localStorage
                localStorage.setItem('user_contacts', JSON.stringify(mockContacts));
                
                console.log("Contacts simulés chargés avec succès");
                resolve(mockContacts);
            });
        };

        fetchContacts();
    }, [user, selectedContact]);

    useEffect(() => {
        // Charger les messages pour le contact sélectionné
        const fetchMessages = async () => {
            if (!selectedContact || !user) return;
            
            try {
                setLoading(true);
                
                let messagesData = [];
                
                try {
                    // Essayer de charger les messages depuis le backend
                    let endpoint;
                    
                    // Adapter l'endpoint en fonction du rôle
                    if (user.role === 'DOCTOR') {
                        endpoint = `/api/v1/doctor/messages/${selectedContact.id}`; // Endpoint pour les médecins
                    } else if (user.role === 'PATIENT') {
                        endpoint = `/api/v1/patient/messages/${selectedContact.id}`; // Endpoint pour les patients
                    } else if (user.role === 'ADMIN') {
                        endpoint = `/api/v1/admin/messages/${selectedContact.id}`; // Endpoint pour les administrateurs
                    } else if (user.role === 'NURSE') {
                        endpoint = `/api/v1/nurse/messages/${selectedContact.id}`; // Endpoint pour les infirmières
                    } else {
                        throw new Error("Rôle non pris en charge");
                    }
                    
                    const response = await axios.get(endpoint);
                    messagesData = response.data;
                    
                    // Vérifier que les données sont bien au format attendu
                    if (Array.isArray(messagesData)) {
                        console.log(`Messages chargés depuis le serveur pour ${selectedContact.firstName}:`, messagesData.length);
                    } else {
                        // Si les données sont vides ou mal formatées, utiliser les données en cache ou simulées
                        throw new Error("Format de données incorrect depuis le serveur");
                    }
                } catch (err) {
                    console.error("Erreur lors du chargement des messages depuis le serveur:", err);
                    
                    // Essayer de charger depuis localStorage en cas d'échec
                    const conversationKey = `messages_with_${selectedContact.id}`;
                    const storedMessages = localStorage.getItem(conversationKey);
                    
                    if (storedMessages) {
                        try {
                            messagesData = JSON.parse(storedMessages);
                            console.log(`Messages chargés depuis localStorage pour ${selectedContact.firstName}:`, messagesData.length);
                        } catch (e) {
                            console.error("Erreur lors du parsing des messages stockés:", e);
                            messagesData = await loadMockMessages(); // Charger les données simulées
                        }
                    } else {
                        messagesData = await loadMockMessages(); // Charger les données simulées
                    }
                }
                
                setMessages(messagesData);
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des messages:", err);
                setError("Impossible de charger vos messages. Le serveur ne répond pas.");
                setLoading(false);
            }
        };

        const loadMockMessages = () => {
            return new Promise((resolve) => {
                console.log("Chargement des messages simulés");
                
                // Générer des messages fictifs en fonction du contact sélectionné
                const now = new Date();
                const mockMessages = [
                    {
                        id: 1,
                        senderId: selectedContact.id,
                        receiverId: user?.id || 0,
                        content: `Bonjour${user?.firstName ? ' ' + user.firstName : ''}, comment allez-vous aujourd'hui?`,
                        timestamp: new Date(now - 60 * 60000).toISOString(),
                        read: true,
                        sender: {
                            firstName: selectedContact.firstName,
                            lastName: selectedContact.lastName,
                            avatar: selectedContact.avatar
                        }
                    },
                    {
                        id: 2,
                        senderId: user?.id || 0,
                        receiverId: selectedContact.id,
                        content: "Je vais bien, merci. J'ai une question concernant mon traitement.",
                        timestamp: new Date(now - 30 * 60000).toISOString(),
                        read: true,
                        sender: {
                            firstName: user?.firstName || 'Vous',
                            lastName: user?.lastName || '',
                            avatar: 'https://via.placeholder.com/50'
                        }
                    },
                    {
                        id: 3,
                        senderId: selectedContact.id,
                        receiverId: user?.id || 0,
                        content: "Bien sûr, que voulez-vous savoir exactement?",
                        timestamp: new Date(now - 15 * 60000).toISOString(),
                        read: false,
                        sender: {
                            firstName: selectedContact.firstName,
                            lastName: selectedContact.lastName,
                            avatar: selectedContact.avatar
                        }
                    }
                ];
                
                // Définir la clé de conversation pour le localStorage
                const conversationKey = `messages_with_${selectedContact.id}`;
                localStorage.setItem(conversationKey, JSON.stringify(mockMessages));
                
                console.log("Messages simulés chargés avec succès");
                resolve(mockMessages);
            });
        };

        fetchMessages();
    }, [selectedContact, user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        
        // Mettre à jour le nombre de messages non lus à 0 pour ce contact et marquer les messages comme lus
        const updatedContacts = contacts.map(c => {
            if (c.id === contact.id) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        });
        
        setContacts(updatedContacts);
        localStorage.setItem('user_contacts', JSON.stringify(updatedContacts));
        
        // Si nous sommes connectés au backend, marquer les messages comme lus
        if (user) {
            try {
                let endpoint;
                
                // Adapter l'endpoint en fonction du rôle
                if (user.role === 'DOCTOR') {
                    endpoint = `/api/v1/doctor/messages/${contact.id}/mark-read`;
                } else if (user.role === 'PATIENT') {
                    endpoint = `/api/v1/patient/messages/${contact.id}/mark-read`;
                } else if (user.role === 'ADMIN') {
                    endpoint = `/api/v1/admin/messages/${contact.id}/mark-read`;
                } else if (user.role === 'NURSE') {
                    endpoint = `/api/v1/nurse/messages/${contact.id}/mark-read`;
                } else {
                    throw new Error("Rôle non pris en charge");
                }
                
                axios.post(endpoint);
            } catch (err) {
                console.error("Erreur lors du marquage des messages comme lus:", err);
            }
        }
    };

    const handleNewConversationChange = (e) => {
        const { name, value } = e.target;
        setNewConversation(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStartNewConversation = async (e) => {
        e.preventDefault();
        
        try {
            const newMessage = {
                recipientId: newConversation.recipientId,
                content: newConversation.message,
                isUrgent: document.getElementById('urgentCheck')?.checked || false
            };
            
            // Envoyer au backend
            const response = await axios.post('/api/v1/messages', newMessage);
            
            // Mettre à jour l'état local
            const updatedMessages = [...messages, response.data];
            setMessages(updatedMessages);
            
            // Fermer la modale et réinitialiser le formulaire
            setShowNewMessageModal(false);
            setNewConversation({
                recipientId: '',
                message: ''
            });
            
            alert("Message envoyé avec succès!");
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !fileAttachment) return;

        try {
            // Créer un nouvel objet message
            const now = new Date();
            const newMessageObj = {
                id: Date.now(), // ID temporaire
                senderId: user?.id || 0,
                receiverId: selectedContact.id,
                content: newMessage.trim(),
                timestamp: now.toISOString(),
                read: false,
                sender: {
                    firstName: user?.firstName || 'Vous',
                    lastName: user?.lastName || '',
                    avatar: user?.avatar || 'https://via.placeholder.com/50'
                },
                attachments: fileAttachment ? [
                    {
                        id: `file-${Date.now()}`,
                        name: fileAttachment.name,
                        url: URL.createObjectURL(fileAttachment),
                        type: fileAttachment.type
                    }
                ] : []
            };

            // Variable pour stocker le message envoyé (soit depuis le serveur, soit local)
            let sentMessage = newMessageObj;
            
            // Essayer d'envoyer au backend si nous sommes connectés
            if (user) {
                try {
                    // Préparer les données pour l'envoi
                    const formData = new FormData();
                    formData.append('content', newMessage.trim());
                    formData.append('receiverId', selectedContact.id);
                    if (fileAttachment) {
                        formData.append('file', fileAttachment);
                    }
                    
                    // Adapter l'endpoint en fonction du rôle
                    let endpoint;
                    if (user.role === 'DOCTOR') {
                        endpoint = '/api/v1/doctor/messages';
                    } else if (user.role === 'PATIENT') {
                        endpoint = '/api/v1/patient/messages';
                    } else if (user.role === 'ADMIN') {
                        endpoint = '/api/v1/admin/messages';
                    } else if (user.role === 'NURSE') {
                        endpoint = '/api/v1/nurse/messages';
                    } else {
                        throw new Error("Rôle non pris en charge");
                    }
                    
                    // Envoyer le message au serveur
                    const response = await axios.post(endpoint, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    
                    // Si l'envoi réussit, utiliser les données renvoyées par le serveur
                    sentMessage = response.data;
                    console.log("Message envoyé avec succès au serveur:", sentMessage);
                } catch (err) {
                    console.error("Erreur lors de l'envoi du message au serveur:", err);
                    // Continuer avec les données locales
                }
            }

            // Mettre à jour les messages localement
            const updatedMessages = [...messages, sentMessage];
            setMessages(updatedMessages);
            
            // Stocker les messages dans localStorage
            const conversationKey = `messages_with_${selectedContact.id}`;
            localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
            
            // Mettre à jour le dernier message dans la liste des contacts
            const updatedContacts = contacts.map(c => {
                if (c.id === selectedContact.id) {
                    return {
                        ...c,
                        lastMessage: newMessage.trim() || 'Pièce jointe envoyée',
                        unreadCount: 0
                    };
                }
                return c;
            });
            
            setContacts(updatedContacts);
            localStorage.setItem('user_contacts', JSON.stringify(updatedContacts));
            
            // Réinitialiser le formulaire
            setNewMessage('');
            setFileAttachment(null);

            // Si nous ne sommes pas connectés au backend, simuler une réponse automatique
            if (!user || process.env.REACT_APP_SIMULATE_RESPONSES === 'true') {
                // Simuler une réponse automatique après un délai
                setTimeout(() => {
                    const autoReply = {
                        id: Date.now() + 1,
                        senderId: selectedContact.id,
                        receiverId: user?.id || 0,
                        content: `Merci pour votre message${fileAttachment ? " et le fichier" : ""}. Je reviens vers vous bientôt.`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        sender: {
                            firstName: selectedContact.firstName,
                            lastName: selectedContact.lastName,
                            avatar: selectedContact.avatar
                        }
                    };
                    
                    const updatedMessagesWithReply = [...updatedMessages, autoReply];
                    setMessages(updatedMessagesWithReply);
                    
                    // Mettre à jour localStorage avec la réponse automatique
                    localStorage.setItem(conversationKey, JSON.stringify(updatedMessagesWithReply));
                    
                    // Mettre à jour le dernier message et le compteur de non lus dans les contacts
                    const updatedContactsWithReply = contacts.map(c => {
                        if (c.id === selectedContact.id) {
                            return {
                                ...c,
                                lastMessage: autoReply.content,
                                unreadCount: 1
                            };
                        }
                        return c;
                    });
                    
                    setContacts(updatedContactsWithReply);
                    localStorage.setItem('user_contacts', JSON.stringify(updatedContactsWithReply));
                }, 2000);
            }
        } catch (err) {
            console.error("Erreur lors de l'envoi du message:", err);
            alert("Impossible d'envoyer votre message. Veuillez réessayer plus tard.");
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFileAttachment(e.target.files[0]);
        }
    };

    const formatTime = (timestamp) => {
        try {
            if (!timestamp) {
                return "Date non disponible";
            }
            
            // Si c'est déjà une chaîne formatée, la retourner directement
            if (typeof timestamp === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(timestamp)) {
                return timestamp;
            }
            
            const date = new Date(timestamp);
            
            // Vérifier si la date est valide
            if (isNaN(date.getTime())) {
                // Essayer différents formats courants
                // 1. Format avec T et millisecondes: "2023-04-15T14:30:45.123Z"
                // 2. Format simple: "2023-04-15 14:30:45"
                // 3. Timestamp numérique
                
                let parsedDate;
                
                // Essai 1: Conversion de format Java/ISO spécifique
                if (typeof timestamp === 'string') {
                    // Nettoyage et normalisation du format
                    const cleanTimestamp = timestamp.replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}).*/, "$1 $2");
                    parsedDate = new Date(cleanTimestamp);
                    
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleString('fr-FR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                    }
                }
                
                // Essai 2: Conversion d'un timestamp numérique
                if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
                    parsedDate = new Date(parseInt(timestamp));
                    
                    if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleString('fr-FR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                    }
                }
                
                // Si on arrive ici, aucun format n'a fonctionné
                console.log("Date non convertible:", timestamp);
                return "Date non disponible";
            }
            
            // Format date: JJ/MM/AAAA HH:MM
            return date.toLocaleString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            console.error("Erreur lors du formatage de la date:", error, "Valeur:", timestamp);
            return "Date non disponible";
        }
    };

    // Afficher un spinner pendant le chargement
    if (loading && !selectedContact) {
        return (
            <div className="container mt-4">
                <h2>Mes messages</h2>
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </Spinner>
                </div>
            </div>
        );
    }

    // Afficher un message d'erreur si le chargement a échoué
    if (error) {
        return (
            <div className="container mt-4">
                <h2>Mes messages</h2>
                <div className="alert alert-danger mt-3">
                    <h4 className="alert-heading">Erreur de chargement</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">Veuillez réessayer plus tard ou contacter le support technique.</p>
                </div>
            </div>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{getPageTitle()}</h2>
                <div>
                    {user?.role && (
                        <Badge bg={user.role === 'DOCTOR' ? 'success' : (user.role === 'ADMIN' ? 'danger' : 'info')} className="me-2">
                            {user.role === 'DOCTOR' ? <FaUserMd className="me-1" /> : 
                             user.role === 'ADMIN' ? <FaUserCog className="me-1" /> : 
                             <FaUser className="me-1" />}
                            {user.role}
                        </Badge>
                    )}
                    <Button 
                        variant="primary"
                        onClick={() => setShowNewMessageModal(true)}
                    >
                        Nouveau message
                    </Button>
                </div>
            </div>

            {contacts.length > 0 ? (
                <Row>
                    <Col md={4}>
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    {user?.role === 'DOCTOR' ? 'Mes patients' : 
                                     user?.role === 'ADMIN' ? 'Tous les utilisateurs' : 
                                     'Mes médecins'}
                                </h5>
                                {user?.role === 'ADMIN' && (
                                    <Button size="sm" variant="outline-primary">
                                        Gérer les utilisateurs
                                    </Button>
                                )}
                            </Card.Header>
                            <ListGroup variant="flush" className="conversation-list">
                                {contacts.map(contact => (
                                    <ListGroup.Item 
                                        key={contact.id}
                                        action
                                        active={selectedContact?.id === contact.id}
                                        onClick={() => handleContactSelect(contact)}
                                        className="d-flex justify-content-between align-items-start"
                                    >
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold d-flex align-items-center">
                                                {contact.role === 'DOCTOR' ? (
                                                    <><FaUserMd className="me-1 text-success" /> Dr. {contact.firstName} {contact.lastName}</>
                                                ) : contact.role === 'ADMIN' ? (
                                                    <><FaUserCog className="me-1 text-danger" /> {contact.firstName} {contact.lastName}</>
                                                ) : (
                                                    <><FaUser className="me-1 text-info" /> {contact.firstName} {contact.lastName}</>
                                                )}
                                            </div>
                                            <div className="small text-truncate" style={{maxWidth: '180px'}}>
                                                {contact.lastMessage}
                                            </div>
                                            {contact.role === 'DOCTOR' && contact.specialty && (
                                                <small className="text-muted">{contact.specialty}</small>
                                            )}
                                        </div>
                                        {contact.unreadCount > 0 && (
                                            <span className="badge bg-primary rounded-pill">
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                        
                        {user?.role === 'DOCTOR' && (
                            <Card className="mt-3">
                                <Card.Header>
                                    <h5 className="mb-0">Statistiques</h5>
                                </Card.Header>
                                <Card.Body>
                                    <p>Messages non lus: {contacts.reduce((total, contact) => total + contact.unreadCount, 0)}</p>
                                    <p>Patients actifs: {contacts.filter(c => c.role === 'PATIENT').length}</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    <Col md={8}>
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    {selectedContact 
                                        ? <>
                                            {selectedContact.role === 'DOCTOR' ? (
                                                <><FaUserMd className="me-1 text-success" /> Dr. {selectedContact.firstName} {selectedContact.lastName}</>
                                            ) : selectedContact.role === 'ADMIN' ? (
                                                <><FaUserCog className="me-1 text-danger" /> {selectedContact.firstName} {selectedContact.lastName}</>
                                            ) : (
                                                <><FaUser className="me-1 text-info" /> {selectedContact.firstName} {selectedContact.lastName}</>
                                            )}
                                          </> 
                                        : 'Sélectionnez un contact'
                                    }
                                </h5>
                                {selectedContact && user?.role === 'DOCTOR' && selectedContact.role === 'PATIENT' && (
                                    <Button size="sm" variant="outline-info">
                                        Voir dossier médical
                                    </Button>
                                )}
                            </Card.Header>
                            
                            {selectedContact ? (
                                <>
                                    <Card.Body className="messages-container" style={{ height: '400px', overflowY: 'auto' }}>
                                        {messages.map(message => {
                                            const isFromMe = message.senderId !== selectedContact.id;
                                            return (
                                                <div 
                                                    key={message.id} 
                                                    className={`mb-3 d-flex ${isFromMe ? 'justify-content-end' : 'justify-content-start'}`}
                                                >
                                                    {!isFromMe && (
                                                        <img 
                                                            src={selectedContact.avatar} 
                                                            alt="Avatar" 
                                                            className="rounded-circle me-2" 
                                                            style={{width: '30px', height: '30px'}}
                                                        />
                                                    )}
                                                    <div 
                                                        className={`message-bubble p-2 rounded ${isFromMe ? 'bg-primary text-white' : 'bg-light'}`}
                                                        style={{ maxWidth: '70%' }}
                                                    >
                                                        <div>{message.content}</div>
                                                        {message.attachments && message.attachments.length > 0 && (
                                                            <div className="mt-2">
                                                                {message.attachments.map(attachment => (
                                                                    <div key={attachment.id} className="attachment">
                                                                        <a 
                                                                            href={attachment.url} 
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={isFromMe ? "text-white" : ""}
                                                                        >
                                                                            <FaPaperclip className="me-1" />
                                                                            {attachment.name}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className={`message-time small ${isFromMe ? 'text-white-50' : 'text-muted'}`}>
                                                            {formatTime(message.timestamp || message.sentAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </Card.Body>
                                    <Card.Footer>
                                        <Form onSubmit={handleSendMessage}>
                                            <Form.Group className="mb-3">
                                                {fileAttachment && (
                                                    <div className="selected-file mb-2">
                                                        <span className="badge bg-secondary">
                                                            <FaPaperclip className="me-1" />
                                                            {fileAttachment.name}
                                                            <Button 
                                                                variant="link" 
                                                                size="sm" 
                                                                className="p-0 ms-2 text-white" 
                                                                onClick={() => setFileAttachment(null)}
                                                            >
                                                                &times;
                                                            </Button>
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="input-group">
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        onClick={handleAttachmentClick}
                                                    >
                                                        <FaPaperclip />
                                                    </Button>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Écrivez votre message..."
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                    />
                                                    <Button 
                                                        variant="primary" 
                                                        type="submit"
                                                        disabled={!newMessage.trim() && !fileAttachment}
                                                    >
                                                        <FaPaperPlane />
                                                    </Button>
                                                    <Form.Control
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Form>
                                    </Card.Footer>
                                </>
                            ) : (
                                <Card.Body className="text-center text-muted py-5">
                                    <p>Veuillez sélectionner un contact pour afficher les messages</p>
                                </Card.Body>
                            )}
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div className="alert alert-info">
                    Vous n'avez pas encore de contacts.
                </div>
            )}
            
            {/* Modal pour nouveau message */}
            <Modal show={showNewMessageModal} onHide={() => setShowNewMessageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nouveau message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleStartNewConversation}>
                        <Form.Group className="mb-3">
                            <Form.Label>Destinataire</Form.Label>
                            <Form.Select 
                                name="recipientId"
                                value={newConversation.recipientId}
                                onChange={handleNewConversationChange}
                                required
                            >
                                <option value="">Sélectionnez un destinataire</option>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.role === 'DOCTOR' ? 'Dr. ' : ''}{contact.firstName} {contact.lastName}
                                        {contact.role === 'ADMIN' ? ' (Admin)' : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                name="message"
                                value={newConversation.message}
                                onChange={handleNewConversationChange}
                                required
                            />
                        </Form.Group>
                        {user?.role === 'DOCTOR' && (
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox" 
                                    label="Marquer comme urgence médicale" 
                                    id="urgentCheck"
                                />
                            </Form.Group>
                        )}
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setShowNewMessageModal(false)}>
                                Annuler
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                disabled={!newConversation.recipientId || !newConversation.message.trim()}
                            >
                                Envoyer
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default MessagesPage;