// src/components/common/Footer.js
import React from 'react';

const Footer = () => {
    return (
        <footer className="footer mt-auto py-3 bg-light">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <h5>DiagnoPlus</h5>
                        <p className="text-muted">Plateforme de santé pour simplifier la relation médecin-patient</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <p>&copy; {new Date().getFullYear()} DiagnoPlus. Tous droits réservés.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;