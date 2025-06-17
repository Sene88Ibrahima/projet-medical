import React, { useState } from 'react';
import { createUser } from '../../api/admin';

const CreateUserForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'DOCTOR' // Par défaut, création d'un médecin
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        // Le backend impose une longueur minimale de 8 caractères
    if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;
            
            const response = await createUser(userData);
            
            console.log('User creation successful:', response.data);
            setSuccess(`L'utilisateur ${userData.firstName} ${userData.lastName} (${userData.role}) a été créé avec succès.`);
            
            // Réinitialiser le formulaire
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'DOCTOR'
            });
        } catch (err) {
            console.error('User creation failed:', err);
            // Si le backend renvoie une liste d'erreurs de validation, agréger les messages
        const backendMessage = Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.map(e => e.defaultMessage).join('\n')
            : err.response?.data?.message;
        setError(backendMessage || "Échec de la création de l'utilisateur. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card admin-card">
            <div className="card-header">
                <h3>Créer un nouvel utilisateur</h3>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="small" htmlFor="firstName">Prénom</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    placeholder="Prénom"
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="small" htmlFor="lastName">Nom</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    placeholder="Nom"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label className="small" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-control"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="small" htmlFor="password">Mot de passe</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    placeholder="Mot de passe (6 caractères minimum)"
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group mb-3">
                                <label className="small" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    placeholder="Confirmez le mot de passe"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label className="small" htmlFor="role">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="DOCTOR">Médecin</option>
                            <option value="NURSE">Infirmier(ère)</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                        <small className="form-text text-muted">
                            Les patients doivent s'inscrire eux-mêmes via la page d'inscription publique.
                        </small>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 mt-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserForm;
