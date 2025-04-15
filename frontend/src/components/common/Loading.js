// src/components/common/Loading.js
import React from 'react';

const Loading = () => {
    return (
        <div className="loading-container d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="ms-3 mb-0">Chargement...</p>
        </div>
    );
};

export default Loading;