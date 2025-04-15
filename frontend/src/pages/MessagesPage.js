// src/pages/MessagesPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/auth';

const MessagesPage = () => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/messages/conversations');
                setConversations(response.data);
            } catch (err) {
                console.error("Erreur lors du chargement des conversations:", err);
                setError("Impossible de charger vos messages");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchConversations();
        }
    }, [currentUser]);

    if (loading) {
        return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Mes messages</h2>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary">Nouveau message</button>
            </div>

            {conversations.length > 0 ? (
                <div className="row">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Conversations</h5>
                            </div>
                            <div className="list-group list-group-flush">
                                {conversations.map(conv => (
                                    <button
                                        key={conv.id}
                                        className="list-group-item list-group-item-action"
                                    >
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">
                                                {conv.with.firstName} {conv.with.lastName}
                                            </h6>
                                            <small className="text-muted">
                                                {new Date(conv.lastMessage.sentAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p className="mb-1 text-truncate">{conv.lastMessage.content}</p>
                                        {conv.unreadCount > 0 && (
                                            <span className="badge bg-primary rounded-pill">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Sélectionnez une conversation</h5>
                            </div>
                            <div className="card-body text-center text-muted">
                                <p>Veuillez sélectionner une conversation pour afficher les messages</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">
                    Vous n'avez pas encore de messages.
                </div>
            )}
        </div>
    );
};

export default MessagesPage;